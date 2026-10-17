import { createWalletClient } from "@arkiv-network/sdk"
import { tiramisu } from "@arkiv-network/sdk/chains"
import { isAddress, parseEther } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { keyedHttp, makePublicClient } from "../src/lib/client.ts"
import { checkHuman, type Proof } from "./human.ts"
import { inLane, shuffled, walletBusy } from "./keys.ts"

/**
 * Sends a few cents of test GLM to a throwaway browser address so a person with no wallet can file.
 * It never signs a report, never stores an address, and never logs a client. The limits live in
 * memory: ponytail: per-instance counters, move to a shared store if the faucet is abused.
 */
// One report costs about 0.00016 test GLM, so 0.005 is enough for around thirty.
const TOP_UP = parseEther("0.005")
const HOLDS_ENOUGH = parseEther("0.003")
const PER_CLIENT_PER_HOUR = 6
const PER_DAY = 300
const hits = new Map<string, number[]>()
let day = { date: "", count: 0 }

export async function drip(address: unknown, client: string, env: { key?: string; keys?: string[]; rpc?: string; human?: { secret?: string; turnstileSecret?: string; turnstileSite?: string } }, proof?: Proof) {
  const keys = (env.keys && env.keys.length > 0 ? env.keys : env.key ? [env.key] : []).filter((key) => /^0x[0-9a-fA-F]{64}$/.test(key))
  if (keys.length === 0) {
    throw new Error("The faucet is not configured on this host. Connect a wallet that holds test GLM.")
  }
  if (typeof address !== "string" || !isAddress(address)) throw new Error("That is not an address.")
  await checkHuman(proof, env.human ?? {}, client)

  const now = Date.now()
  const recent = (hits.get(client) ?? []).filter((time) => now - time < 3_600_000)
  if (recent.length >= PER_CLIENT_PER_HOUR) throw new Error("The faucet is resting. Try again in an hour, or connect your own wallet.")
  const today = new Date(now).toISOString().slice(0, 10)
  if (day.date !== today) day = { date: today, count: 0 }
  if (day.count >= PER_DAY) throw new Error("The faucet is out for today. Connect your own wallet to report now.")

  const rpc = env.rpc || tiramisu.rpcUrls.default.http[0]
  const reader = makePublicClient(rpc)
  const held = await reader.getBalance({ address })
  if (held >= HOLDS_ENOUGH) return { sent: false }

  // Several faucet wallets share the load. Each sends one payment at a time (a wallet with two payments in
  // flight collides on its nonce); a busy or empty wallet hands over to the next.
  let failure: unknown
  let paid = false
  for (const key of shuffled(keys)) {
    const account = privateKeyToAccount(key as `0x${string}`)
    try {
      await inLane(account.address, async () => {
        const wallet = createWalletClient({ account, chain: tiramisu, transport: keyedHttp(rpc) })
        const hash = await wallet.sendTransaction({ to: address, value: TOP_UP })
        const receipt = await reader.waitForTransactionReceipt({ hash, timeout: 30_000 })
        if (receipt.status !== "success") throw new Error("The faucet transfer did not succeed.")
      })
      paid = true
      break
    } catch (error) {
      failure = error
      if (!walletBusy(error)) break
    }
  }
  if (!paid) throw failure instanceof Error ? failure : new Error("The faucet is busy. Try again, or connect your own wallet.")
  hits.set(client, [...recent, now])
  day.count += 1
  return { sent: true }
}
