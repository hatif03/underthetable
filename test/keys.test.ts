import assert from "node:assert/strict"
import test from "node:test"
import { inLane, keysFrom, shuffled, walletBusy } from "../server/keys.ts"

const k = (n: number) => `0x${n.toString(16).padStart(64, "0")}`

test("server wallets are read from NAME, NAME_2, NAME_3 and bad values are ignored", () => {
  const env = { DRIP_KEY: k(1), DRIP_KEY_2: k(2), DRIP_KEY_3: "not a key", DRIP_KEY_4: k(1), DRIP_KEY_5: k(5), OTHER_KEY: k(9) }
  assert.deepEqual(keysFrom(env, "DRIP_KEY"), [k(1), k(2), k(5)])
  assert.deepEqual(keysFrom({}, "DRIP_KEY"), [])
})

test("one wallet sends one transaction at a time, and a failure does not block the next", async () => {
  const log: string[] = []
  const slow = (name: string, ms: number, fail = false) =>
    inLane("w1", async () => {
      log.push(`${name}:start`)
      await new Promise((resolve) => setTimeout(resolve, ms))
      log.push(`${name}:end`)
      if (fail) throw new Error("nonce too low")
    })
  const results = await Promise.allSettled([slow("a", 30, true), slow("b", 5), slow("c", 5)])
  assert.deepEqual(log, ["a:start", "a:end", "b:start", "b:end", "c:start", "c:end"])
  assert.equal(results[0].status, "rejected")
  assert.equal(results[2].status, "fulfilled")
})

test("different wallets run in parallel, and busy errors are told apart", async () => {
  const order: string[] = []
  await Promise.all([
    inLane("x", async () => { await new Promise((r) => setTimeout(r, 30)); order.push("x") }),
    inLane("y", async () => { order.push("y") }),
  ])
  assert.deepEqual(order, ["y", "x"])
  assert.equal(walletBusy(new Error("nonce too low: next nonce 5")), true)
  assert.equal(walletBusy(new Error("insufficient funds for gas")), true)
  assert.equal(walletBusy(new Error("The faucet is resting.")), false)
  assert.deepEqual([...shuffled([1, 2, 3, 4])].sort(), [1, 2, 3, 4])
})
