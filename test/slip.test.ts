import assert from "node:assert/strict"
import test from "node:test"
import { buckets, type ReportRow } from "../src/lib/aggregate.ts"
import { findPrivate, redactText, sealReport } from "../src/lib/guard.ts"
import { guess } from "../src/lib/parse.ts"
import { previousWeek, weekChoices, weekStart } from "../src/lib/week.ts"

test("a sentence fills the slip on the device", () => {
  const g = guess("Last week in Nashik the RTO inspector asked 700 for a driving licence. I didn't pay.")
  assert.equal(g.kind, "demand")
  assert.equal(g.district, "nashik")
  assert.equal(g.state, "mh")
  assert.equal(g.department, "rto")
  assert.equal(g.service, "driving_licence")
  assert.equal(g.amountInr, 700)
  assert.equal(g.outcome, "asked")
  assert.equal(g.weeksAgo, 1)
  assert.equal(guess("paid Rs 1,500 for my licence in Pune").amountInr, 1500)
  assert.equal(guess("they wanted 2k at the RTO in Mumbai").amountInr, 2000)
})

test("conditions and restrictions are read from words, with a severity", () => {
  const pothole = guess("A very bad pothole in Pune, worse than last month")
  assert.deepEqual([pothole.kind, pothole.service, pothole.amountInr, pothole.outcome], ["failure", "pothole", 5, "worsened"])
  const ban = guess("Permission for the march in Delhi was denied this week")
  assert.deepEqual([ban.kind, ban.department, ban.service, ban.district], ["restriction", "police", "assembly_permission_denied", "new_delhi"])
  assert.equal(guess("lathi charge on the crowd").service, "force_at_gathering")
})

test("the tripwire finds identity the lists would never hold", () => {
  const sentence = "Inspector Sharma took 500. Call 98765 43210, aadhaar 1234 5678 9012, bike MH15 AB 1234, FIR no 55/2026, mail a@b.co"
  const notes = new Set(findPrivate(sentence).map((hit) => hit.note))
  for (const note of ["a name", "a phone number", "an Aadhaar number", "a vehicle number", "a case number", "an email address"]) {
    assert.ok(notes.has(note), `missing ${note}`)
  }
  const cleaned = redactText(sentence).text
  for (const leak of ["Sharma", "98765", "1234 5678", "MH15", "55/2026", "a@b.co"]) assert.equal(cleaned.includes(leak), false, leak)
  assert.equal(redactText("RTO in Nashik asked 700 last week").removed.length, 0)
})

test("a restriction is a closed kind with a severity and no person", () => {
  const base = { state: "dl", district: "new_delhi", department: "police", role: "public", service: "assembly_permission_denied", outcome: "noted", amountInr: 3, day: "2026-10-16", today: "2026-10-16", kind: "restriction" as const }
  assert.equal(sealReport(base).kind, "restriction")
  assert.throws(() => sealReport({ ...base, service: "fir_registration" }))
  assert.throws(() => sealReport({ ...base, role: "constable" }))
  assert.throws(() => sealReport({ ...base, amountInr: 700 }))
})

test("weeks are chosen, not typed", () => {
  assert.deepEqual(weekChoices("2026-10-16", 3).map((item) => item.week), ["2026-W42", "2026-W41", "2026-W40"])
  assert.equal(weekStart("2026-W42"), "2026-10-12")
  assert.equal(previousWeek("2026-W01"), "2025-W52")
})

test("buckets show 2 of 3 wallets and quote only at 3", () => {
  const row = (creator: string, createdAt: bigint, amountInr: number): ReportRow => ({
    key: `${creator}${createdAt}`, creator, owner: "0xdead", createdAt, expiresAt: 99n, state: "mh", district: "nashik",
    department: "rto", role: "clerk", service: "driving_licence", outcome: "asked", week: "2026-W42", amountInr,
  })
  const two = buckets([row("a", 1n, 500), row("a", 2n, 900), row("b", 3n, 700)])
  assert.equal(two[0].voices, 2)
  assert.equal(two[0].quoted, false)
  assert.equal(two[0].medianInr, null)
  const three = buckets([row("a", 1n, 500), row("b", 3n, 700), row("c", 4n, 800)])
  assert.equal(three[0].quoted, true)
  assert.equal(three[0].medianInr, 700)
})

test("the scan sees through Hindi digits, UPI handles, spelled emails and separated digit runs", () => {
  const noted = (text: string) => findPrivate(text).map((hit) => hit.note)
  assert.ok(noted("call ९८७६५४३२१०").length > 0) // Devanagari digits
  assert.ok(noted("call ٩٨٧٦٥٤٣٢١٠").length > 0) // Arabic-Indic digits
  assert.ok(noted("call 98765-43210").length > 0)
  assert.ok(noted("call 98 76 54 32 10").length > 0)
  assert.ok(noted("pay rahul@okbank").length > 0) // UPI
  assert.ok(noted("write to rahul (at) gmail (dot) com").length > 0)
  assert.ok(noted("श्री रमेश कुमार ने माँगे").includes("a name"))
  // Things that are not personal stay untouched.
  assert.equal(noted("on 16/10/2026 at 10:30 they asked 5,000 for a licence").length, 0)
  assert.equal(noted("asked 700 in Nashik last week").length, 0)
  assert.throws(() => sealReport({ state: "mh", district: "nashik", department: "rto", role: "clerk", service: "driving_licence", outcome: "९८७६५४३२१०", amountInr: 500, day: "2026-10-16", today: "2026-10-16" }))
})

test("rights violations and shutdowns are read from words", () => {
  const cases: [string, string, string][] = [
    ["Mobile internet was shut down in Nashik for three days", "administration", "internet_shutdown"],
    ["They bulldozed our shop in Pune without any notice", "administration", "demolition_without_notice"],
    ["A journalist was detained in Nashik while covering the march", "police", "journalist_detained_or_attacked"],
    ["He was beaten in custody at the Nashik police station", "police", "custodial_violence"],
  ]
  for (const [text, department, service] of cases) {
    const g = guess(text)
    assert.equal(g.kind, "restriction", text)
    assert.equal(g.department, department, text)
    assert.equal(g.service, service, text)
  }
})
