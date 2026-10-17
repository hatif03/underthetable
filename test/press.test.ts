import assert from "node:assert/strict"
import test from "node:test"
import curators from "../data/curators.json" with { type: "json" }
import pressRecords from "../data/press-records.json" with { type: "json" }
import type { ReportRow } from "../src/lib/aggregate.ts"
import { DEMO_WALLETS } from "../src/lib/demo.ts"
import { derive } from "../src/lib/derive.ts"
import { sealReport } from "../src/lib/guard.ts"
import { toReportRow } from "../src/lib/query.ts"

const curator = curators.addresses[0]
const demo = [...DEMO_WALLETS][0]

function entity(creator: string, source?: string) {
  return {
    key: "0xabc" as `0x${string}`,
    creator: creator as `0x${string}`,
    owner: "0x000000000000000000000000000000000000dEaD" as `0x${string}`,
    payload: new TextEncoder().encode('{"v":1}'),
    createdAt: 5n,
    expiresAt: 999n,
    attributes: {
      project: { type: "str", value: "underthetable" },
      type: { type: "str", value: "report" },
      state: { type: "str", value: "dl" },
      district: { type: "str", value: "new_delhi" },
      department: { type: "str", value: "police" },
      role: { type: "str", value: "public" },
      service: { type: "str", value: "assembly_permission_denied" },
      outcome: { type: "str", value: "noted" },
      kind: { type: "str", value: "restriction" },
      week: { type: "str", value: "2026-W41" },
      amount_inr: { type: "u64", value: 3n },
      ...(source ? { source: { type: "str", value: source } } : {}),
    },
  }
}

test("only the curator wallet is believed when it says press", () => {
  assert.equal(toReportRow(entity(curator, "press") as never, "2026-10-16")?.source, "press")
  // A citizen who writes source = press is read as an ordinary citizen row.
  assert.equal(toReportRow(entity("0x0000000000000000000000000000000000000002", "press") as never, "2026-10-16")?.source, undefined)
  assert.equal(toReportRow(entity(curator) as never, "2026-10-16")?.source, undefined)
})

test("a press row is never a citizen voice, and demo rows hide by default", () => {
  const row = (creator: string, key: string, source?: string): ReportRow => ({
    key, creator, owner: "0xdead", createdAt: 10n, expiresAt: 999n, state: "dl", district: "new_delhi", department: "police",
    role: "public", service: "assembly_permission_denied", outcome: "noted", week: "2026-W41", amountInr: 3, kind: "restriction", source,
  })
  const rows = [row(curator, "0x1", "press"), row("citizen-a", "0x2"), row("citizen-b", "0x3"), row(demo, "0x4")]
  const hidden = derive(rows, 100n, 0)
  assert.equal(hidden.press.length, 1)
  assert.equal(hidden.demoHidden, 1)
  assert.equal(hidden.desks[0].voices, 2) // the press row and the demo row are not voices
  assert.equal(hidden.quoted.length, 0)
  const shown = derive(rows, 100n, 0, [], true)
  assert.equal(shown.desks[0].voices, 3) // the demo wallet counts once it is shown
  assert.equal(shown.demoHidden, 0)
})

test("every press record passes the guard, is dated in the window, and cites a source", () => {
  assert.ok(pressRecords.length > 0)
  for (const record of pressRecords) {
    assert.ok(record.sources.length > 0, record.id)
    assert.ok(record.eventDate >= "2026-10-09" && record.eventDate <= "2026-10-16", `${record.id} is outside 9 to 16 October`)
    const sealed = sealReport({
      state: record.state, district: record.district, department: record.department, role: record.role, service: record.service,
      outcome: record.outcome, amountInr: record.amountInr, day: record.eventDate, today: "2026-10-16", kind: record.kind as never, source: "press",
    })
    assert.equal(sealed.source, "press")
    // No name or number that identifies a person in what is published about the record.
    assert.equal(/\d{10,}|@/.test(`${record.note} ${record.sources.map((source) => source.title).join(" ")}`), false, record.id)
  }
})
