import assert from "node:assert/strict"
import test from "node:test"
import { sealReport } from "../src/lib/guard.ts"
import { reportProblem, type RawEntity } from "../src/lib/validate.ts"

const DEAD = "0x000000000000000000000000000000000000dEaD"
const TODAY = "2026-10-16"
const str = (value: string) => ({ type: "str", value })
const i32 = (value: number) => ({ type: "i32", value })

const slip = { state: "mh", district: "nashik", department: "municipal", role: "public", service: "pothole", outcome: "noted", amountInr: 3, day: "2026-10-14", today: TODAY, kind: "failure" as const }

function pinned(over: Record<string, unknown> = {}): RawEntity {
  const base: Record<string, unknown> = {
    project: str("underthetable"),
    type: str("report"),
    state: str("mh"),
    district: str("nashik"),
    department: str("municipal"),
    role: str("public"),
    service: str("pothole"),
    outcome: str("noted"),
    kind: str("failure"),
    week: str("2026-W42"),
    amount_inr: { type: "u64", value: 3n },
    lat_e5: i32(1_999_751),
    lon_e5: i32(7_378_981),
    ...over,
  }
  for (const [k, v] of Object.entries(base)) if (v === undefined) delete base[k]
  return { key: "0xk", creator: "0xc", owner: DEAD, payload: new TextEncoder().encode('{"v":1}'), attributes: base as never }
}

test("a pothole pin is sealed as e5 integers", () => {
  const sealed = sealReport({ ...slip, geo: { lat: 19.99751, lon: 73.78981 } })
  assert.equal(sealed.lat_e5, 1_999_751)
  assert.equal(sealed.lon_e5, 7_378_981)
  assert.equal(sealReport(slip).lat_e5, undefined)
})

test("the guard refuses a pin on anything but public infrastructure, outside India, or in the wrong state", () => {
  const geo = { lat: 19.99751, lon: 73.78981 }
  assert.throws(() => sealReport({ ...slip, geo: { lat: 51.5, lon: -0.12 } }), /./) // London
  assert.throws(() => sealReport({ ...slip, geo: { lat: 12.97, lon: 77.59 } }), /./) // Bengaluru on a Maharashtra slip
  assert.throws(() => sealReport({ ...slip, department: "health", role: "public", service: "doctor_absent", kind: "absence", geo }), /./)
  assert.throws(() => sealReport({ ...slip, department: "rto", role: "motor_vehicle_inspector", service: "driving_licence", kind: "demand", amountInr: 700, outcome: "asked", geo }), /./)
})

test("the reader ignores a hostile pin even if someone wrote it straight to the chain", () => {
  assert.equal(reportProblem(pinned(), TODAY), null)
  const bad: [string, RawEntity][] = [
    ["only one coordinate", pinned({ lon_e5: undefined })],
    ["a u64 coordinate", pinned({ lat_e5: { type: "u64", value: 1_999_751n } })],
    ["a coordinate that is a string", pinned({ lat_e5: str("19.99751") })],
    ["outside India", pinned({ lat_e5: i32(5_150_000), lon_e5: i32(-12_000) })],
    ["in the wrong state", pinned({ lat_e5: i32(1_297_000), lon_e5: i32(7_759_000) })],
    ["on a demand", pinned({ kind: str("demand"), department: str("rto"), role: str("motor_vehicle_inspector"), service: str("driving_licence"), outcome: str("asked") })],
    ["on a non-infrastructure failure", pinned({ department: str("health"), service: str("doctor_absent"), kind: str("absence") })],
  ]
  for (const [label, entity] of bad) assert.notEqual(reportProblem(entity, TODAY), null, label)
})
