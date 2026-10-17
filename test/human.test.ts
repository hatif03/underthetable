import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import test from "node:test"
import { checkHuman, humanMode, POW_BITS } from "../server/human.ts"
import { leadingZeroBits, sha256 } from "../src/lib/sha256.ts"

const env = { secret: "test-secret" }

function solve(challenge: string): string {
  const enc = new TextEncoder()
  for (let n = 0; ; n++) if (leadingZeroBits(sha256(enc.encode(`${challenge}:${n}`))) >= POW_BITS) return String(n)
}

test("the browser's sha256 equals node's", () => {
  for (const text of ["", "abc", "a".repeat(55), "a".repeat(56), "a".repeat(64), "underthetable ✓ मुंबई"]) {
    const bytes = new TextEncoder().encode(text)
    assert.equal(Buffer.from(sha256(bytes)).toString("hex"), createHash("sha256").update(bytes).digest("hex"), text)
  }
})

test("a solved proof passes once, and not twice", async () => {
  const mode = humanMode(env)
  assert.equal(mode.mode, "pow")
  if (mode.mode !== "pow") return
  const proof = { mode: "pow", challenge: mode.challenge, nonce: solve(mode.challenge) }
  await checkHuman(proof, env, "1.2.3.4")
  await assert.rejects(checkHuman(proof, env, "1.2.3.4"), /already used/)
})

test("an unsolved, forged, expired or missing proof is refused", async () => {
  const mode = humanMode(env)
  if (mode.mode !== "pow") return assert.fail()
  await assert.rejects(checkHuman({ challenge: mode.challenge, nonce: "0" }, env, "x"), /not solved/)
  await assert.rejects(checkHuman(undefined, env, "x"), /first/)
  const other = humanMode({ secret: "someone-else" })
  if (other.mode !== "pow") return assert.fail()
  await assert.rejects(checkHuman({ challenge: other.challenge, nonce: solve(other.challenge) }, env, "x"), /not issued here/)
  const stamp = Date.now() - 10 * 60_000
  const body = `${stamp}.deadbeef`
  const { createHmac } = await import("node:crypto")
  const challenge = `${body}.${createHmac("sha256", env.secret).update(body).digest("hex")}`
  await assert.rejects(checkHuman({ challenge, nonce: solve(challenge) }, env, "x"), /expired/)
})
