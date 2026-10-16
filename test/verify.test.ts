import assert from "node:assert/strict"
import test from "node:test"
import attesters from "../data/attesters.json" with { type: "json" }
import type { ReportRow } from "../src/lib/aggregate.ts"
import { derive } from "../src/lib/derive.ts"
import { sameArea, stateAt } from "../src/lib/geo.ts"
import { toAttestation } from "../src/lib/query.ts"
import { insideState } from "../server/attest.ts"

const row = (creator: string, key: string, state = "mh"): ReportRow => ({
  key, creator, owner: "0xdead", createdAt: 10n, expiresAt: 999n, state, district: "pune", department: "municipal",
  role: "public", service: "pothole", outcome: "noted", week: "2026-W42", amountInr: 3, kind: "failure",
})

test("the location check compares a rounded position with the state on the report", () => {
  assert.equal(insideState(18.5, 73.85, "mh"), true) // Pune
  assert.equal(insideState(12.95, 77.6, "mh"), false) // Bengaluru
  assert.equal(insideState(12.95, 77.6, "ka"), true)
  assert.equal(insideState(34.1, 74.8, "la"), true) // Srinagar: Ladakh shares the Jammu and Kashmir polygon
  assert.equal(insideState(19.0, 60.0, "mh"), false) // Arabian Sea, far outside
})

test("the browser warns about the wrong state from the dot grid, without any polygon", () => {
  assert.equal(stateAt({ lat: 18.5, lon: 73.85 }), "mh")
  assert.equal(stateAt({ lat: 12.95, lon: 77.6 }), "ka")
  assert.equal(stateAt({ lat: 0, lon: 0 }), null)
  assert.equal(sameArea("jk", "la"), true)
  assert.equal(sameArea("mh", "ka"), false)
})

test("only a trusted attester can vouch, and only for the state on the report", () => {
  const trusted = attesters.addresses[0]
  const entity = (creator: string) => ({
    key: "0xaaa" as `0x${string}`,
    creator: creator as `0x${string}`,
    owner: "0x000000000000000000000000000000000000dEaD" as `0x${string}`,
    payload: new TextEncoder().encode('{"v":1}'),
    attributes: {
      project: { type: "str", value: "underthetable" },
      method: { type: "str", value: "geo" },
      type: { type: "str", value: "attestation" },
      report: { type: "key", value: "0xAbC0000000000000000000000000000000000000000000000000000000000001" },
      state: { type: "str", value: "mh" },
      scope: { type: "str", value: "state" },
    },
  })
  assert.equal(toAttestation(entity("0x0000000000000000000000000000000000000001") as never), null)
  const proof = toAttestation(entity(trusted) as never)
  assert.equal(proof?.report, "0xabc0000000000000000000000000000000000000000000000000000000000001")

  const rows = [row("a", "0xabc0000000000000000000000000000000000000000000000000000000000001"), row("b", "0xdef"), row("c", "0x123")]
  const d = derive(rows, 100n, 0, [proof!])
  assert.equal(d.verifiedCount, 1)
  assert.equal(d.desks[0].verifiedVoices, 1)
  assert.equal(d.desks[0].corroborated, false)
  // Same attestation, but the report says another state: it does not count.
  assert.equal(derive([row("a", "0xabc0000000000000000000000000000000000000000000000000000000000001", "ka")], 100n, 0, [proof!]).verifiedCount, 0)
})

test("three location-checked wallets corroborate a desk", () => {
  const proofs = ["0xa1", "0xb2", "0xc3"].map((report) => ({ key: `k${report}`, report, state: "mh", scope: "state", attester: "0x1" }))
  const rows = [row("a", "0xa1"), row("b", "0xb2"), row("c", "0xc3")]
  const d = derive(rows, 100n, 0, proofs)
  assert.equal(d.desks[0].quoted, true)
  assert.equal(d.desks[0].corroborated, true)
})
