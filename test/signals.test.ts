import assert from "node:assert/strict"
import test from "node:test"
import curators from "../data/curators.json" with { type: "json" }
import { buckets, type ReportRow } from "../src/lib/aggregate.ts"
import { derive } from "../src/lib/derive.ts"

const base = { owner: "0xdead", expiresAt: 9999n, state: "mh", district: "nashik", department: "rto", role: "clerk", service: "driving_licence", outcome: "asked", week: "2026-W42" }
const row = (creator: string, createdAt: bigint, amountInr: number, key = `${creator}${createdAt}`): ReportRow => ({ ...base, key, creator, createdAt, amountInr })

test("a quoted desk shows its spread, and flags a wild amount and a burst", () => {
  const [desk] = buckets([row("a", 100n, 500), row("b", 120n, 700), row("c", 150n, 90000, "wild")])
  assert.equal(desk.quoted, true)
  assert.equal(desk.medianInr, 700)
  assert.deepEqual([desk.min, desk.max], [500, 90000])
  assert.deepEqual(desk.outlierKeys, ["wild"]) // the median already ignores it; the page also says so
  assert.equal(desk.bursty, true) // 50 blocks apart
  const [spread] = buckets([row("a", 100n, 500), row("b", 5000n, 700), row("c", 9000n, 800)])
  assert.equal(spread.bursty, false)
})

test("a press report is checked against citizens, never counted as one", () => {
  const press: ReportRow = { ...base, key: "0xpress", creator: curators.addresses[0], createdAt: 50n, amountInr: 3000, source: "press" }
  const citizens = [row("a", 100n, 3000), row("b", 110n, 2500), row("c", 120n, 3500)]
  const d = derive([press, ...citizens], 200n, 0)
  assert.equal(d.pressCitizens.get("0xpress"), 3)
  assert.equal(d.desks[0].voices, 3) // the press row is not one of the three
  assert.equal(d.deskPress.get(d.desks[0].id)?.length, 1)
  // A different district is not a match.
  const far = derive([{ ...press, district: "pune" }, ...citizens], 200n, 0)
  assert.equal(far.pressCitizens.get("0xpress"), 0)
})
