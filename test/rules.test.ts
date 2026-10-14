import assert from "node:assert/strict"
import test from "node:test"
import { aggregate, type ReportRow } from "../src/lib/aggregate.ts"
import { PAYLOAD_TEXT, assertPayload, redactText, sealReport } from "../src/lib/guard.ts"
import { addDays, isoWeek, kolkataDay } from "../src/lib/week.ts"

const encoder = new TextEncoder()

function row(partial: Partial<ReportRow> & Pick<ReportRow, "creator" | "createdAt" | "amountInr">): ReportRow {
  return {
    key: `0x${partial.creator}`,
    owner: "0x000000000000000000000000000000000000dEaD",
    expiresAt: 0n,
    state: "mh",
    district: "nashik",
    department: "rto",
    role: "motor_vehicle_inspector",
    service: "driving_licence",
    outcome: "asked",
    week: "2026-W42",
    day: "2026-10-16",
    ...partial,
  }
}

test("ISO week follows the Thursday rule", () => {
  assert.equal(isoWeek("2005-01-01"), "2004-W53")
  assert.equal(isoWeek("2005-01-03"), "2005-W01")
})

test("Kolkata civil date crosses midnight before UTC does", () => {
  assert.equal(kolkataDay(new Date("2026-10-15T20:00:00.000Z")), "2026-10-16")
  assert.equal(kolkataDay(new Date("2026-10-16T18:29:00.000Z")), "2026-10-16")
  assert.equal(kolkataDay(new Date("2026-10-16T18:30:00.000Z")), "2026-10-17")
  assert.equal(addDays("2026-10-16", -180), "2026-04-19")
})

test("the payload is exactly the version object", () => {
  assert.equal(PAYLOAD_TEXT, '{"v":1}')
  assert.doesNotThrow(() => assertPayload(encoder.encode(PAYLOAD_TEXT)))
  assert.throws(() => assertPayload(encoder.encode('{"v":1,"note":"Rahul"}')))
})

test("the guard rejects identity, amount, date, and off-list slugs", () => {
  const base = {
    state: "mh",
    district: "nashik",
    department: "rto",
    role: "motor_vehicle_inspector",
    service: "driving_licence",
    outcome: "asked",
    amountInr: 700,
    day: "2026-10-16",
    today: "2026-10-16",
  }
  const sealed = sealReport(base)
  assert.equal(sealed.week, isoWeek("2026-10-16"))
  assert.equal(sealed.amount_inr, 700n)
  assert.throws(() => sealReport({ ...base, district: "nashik_city" }))
  assert.throws(() => sealReport({ ...base, role: "commissioner" }))
  assert.throws(() => sealReport({ ...base, amountInr: 0 }))
  assert.throws(() => sealReport({ ...base, day: "2026-10-17" }))
  assert.throws(() => sealReport({ ...base, day: "2026-01-01" }))
  assert.throws(() => sealReport({ ...base, outcome: "paid+919876543210" }))
  assert.throws(() => sealReport({ ...base, outcome: "user@example.com" }))
  const cleaned = redactText("Shri Rahul at room 12 asked 700. Call 9876543210 or a@b.co")
  assert.equal(cleaned.text.includes("9876543210"), false)
  assert.equal(cleaned.text.includes("a@b.co"), false)
  assert.equal(cleaned.text.includes("Rahul"), false)
  assert.ok(cleaned.removed.length >= 2)
  const failure = sealReport({
    ...base,
    kind: "failure",
    department: "municipal",
    role: "public",
    service: "pothole",
    outcome: "noted",
    amountInr: 4,
  })
  assert.equal(failure.kind, "failure")
  assert.equal(failure.amount_inr, 4n)
  assert.throws(() => sealReport({ ...base, kind: "failure", department: "municipal", role: "public", service: "pothole", outcome: "noted", amountInr: 700 }))
})

test("three wallets quote a median, and a second slip from one wallet does not add a voice", () => {
  const result = aggregate([
    row({ creator: "a", createdAt: 10n, amountInr: 500, outcome: "asked" }),
    row({ creator: "a", createdAt: 20n, amountInr: 9000, outcome: "paid" }),
    row({ creator: "b", createdAt: 11n, amountInr: 800, outcome: "paid" }),
    row({ creator: "c", createdAt: 12n, amountInr: 700, outcome: "refused" }),
  ])
  assert.equal(result.quoted.length, 1)
  assert.equal(result.quoted[0].voices, 3)
  assert.equal(result.quoted[0].medianInr, 700)
  assert.deepEqual(result.quoted[0].outcomes, { asked: 1, paid: 1, refused: 1 })
  assert.equal(result.unquoted.length, 0)
})

test("two wallets stay unquoted, and five flood slips are one additional voice", () => {
  const below = aggregate([
    row({ creator: "a", createdAt: 10n, amountInr: 500 }),
    row({ creator: "b", createdAt: 11n, amountInr: 800 }),
  ])
  assert.equal(below.quoted.length, 0)
  assert.equal(below.unquoted.length, 2)

  const flood = aggregate([
    row({ creator: "a", createdAt: 10n, amountInr: 500 }),
    row({ creator: "b", createdAt: 11n, amountInr: 800 }),
    row({ creator: "c", createdAt: 12n, amountInr: 700 }),
    ...[1, 2, 3, 4, 5].map((n) =>
      row({ creator: "flood", createdAt: BigInt(20 + n), amountInr: n === 1 ? 1000 : 50, key: `flood-${n}` }),
    ),
  ])
  assert.equal(flood.quoted[0].voices, 4)
  assert.equal(flood.quoted[0].medianInr, 750)
})
