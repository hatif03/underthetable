import assert from "node:assert/strict"
import test from "node:test"
import { attestationProblem, reportProblem, type RawEntity } from "../src/lib/validate.ts"

const DEAD = "0x000000000000000000000000000000000000dEaD"
const TODAY = "2026-10-16"

function report(over: Record<string, unknown> = {}, extra: Partial<RawEntity> = {}): RawEntity {
  const base: Record<string, { type: string; value: unknown }> = {
    project: { type: "str", value: "underthetable" },
    type: { type: "str", value: "report" },
    state: { type: "str", value: "mh" },
    district: { type: "str", value: "nashik" },
    department: { type: "str", value: "rto" },
    role: { type: "str", value: "motor_vehicle_inspector" },
    service: { type: "str", value: "driving_licence" },
    outcome: { type: "str", value: "asked" },
    kind: { type: "str", value: "demand" },
    week: { type: "str", value: "2026-W42" },
    amount_inr: { type: "u64", value: 700n },
  }
  for (const [name, value] of Object.entries(over)) {
    if (value === undefined) delete base[name]
    else base[name] = value as { type: string; value: unknown }
  }
  return { key: "0xk", creator: "0xc", owner: DEAD, payload: new TextEncoder().encode('{"v":1}'), attributes: base as never, ...extra }
}
const str = (value: string) => ({ type: "str", value })

test("a well-formed sealed report is valid", () => {
  assert.equal(reportProblem(report(), TODAY), null)
  assert.equal(reportProblem(report({ source: str("press") }), TODAY), null)
  assert.equal(reportProblem(report({ day: str("2026-10-14") }), TODAY), null) // a row written before the day was dropped
})

test("rejections, one at a time", () => {
  const cases: [string, RawEntity][] = [
    ["a name in a slug field", report({ district: str("rahul_sharma") })],
    ["an attribute outside the schema", report({ note: str("asked me for money, Mr Rahul") })],
    ["a note in the payload", report({}, { payload: new TextEncoder().encode('{"v":1,"note":"Rahul"}') })],
    ["no payload read", report({}, { payload: undefined })],
    ["not sealed", report({}, { owner: "0x13398a1803eCa909D909193F1547FfFc1e05eF4F" })],
    ["an off-list department", report({ department: str("army") })],
    ["a role from the wrong department", report({ role: str("tehsildar") })],
    ["a service from the wrong department", report({ service: str("mutation") })],
    ["a demand amount of zero", report({ amount_inr: { type: "u64", value: 0n } })],
    ["a demand amount over the cap", report({ amount_inr: { type: "u64", value: 99_999_999n } })],
    ["a severity that is a rupee amount", report({ kind: str("failure"), department: str("municipal"), role: str("public"), service: str("pothole"), outcome: str("noted") })],
    ["an i32 amount", report({ amount_inr: { type: "i32", value: 700 } })],
    ["a future week", report({ week: str("2099-W01") })],
    ["a week from years ago", report({ week: str("2019-W10") })],
    ["a malformed week", report({ week: str("last tuesday") })],
    ["a source that is not press", report({ source: str("police") })],
    ["a phone number in the outcome", report({ outcome: str("9876543210") })],
    ["a kind that is not on the list", report({ kind: str("rumour") })],
  ]
  for (const [label, entity] of cases) assert.notEqual(reportProblem(entity, TODAY), null, label)
})

test("an attestation must be exactly the schema and sealed", () => {
  const attestation = (over: Record<string, unknown> = {}, extra: Partial<RawEntity> = {}): RawEntity => {
    const base: Record<string, unknown> = {
      project: str("underthetable"),
      type: str("attestation"),
      report: { type: "key", value: "0x" + "ab".repeat(32) },
      method: str("geo"),
      scope: str("state"),
      state: str("mh"),
      ...over,
    }
    return { key: "0xk", creator: "0xc", owner: DEAD, payload: new TextEncoder().encode('{"v":1}'), attributes: base as never, ...extra }
  }
  assert.equal(attestationProblem(attestation()), null)
  assert.notEqual(attestationProblem(attestation({ lat: str("18.52") })), null) // a position must never ride along
  assert.notEqual(attestationProblem(attestation({ method: str("aadhaar") })), null)
  assert.notEqual(attestationProblem(attestation({}, { owner: "0x1" })), null)
  assert.notEqual(attestationProblem(attestation({ report: str("0xnot-a-key") })), null)
})
