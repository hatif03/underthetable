import "./load-env.ts"
import { createWalletClient, ExpirationTime, jsonToPayload } from "@arkiv-network/sdk"
import { str, u64 } from "@arkiv-network/sdk/attr"
import { tiramisu } from "@arkiv-network/sdk/chains"
import { eq, gte } from "@arkiv-network/sdk/query"
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts"
import { keyedHttp, makePublicClient } from "../src/lib/client.ts"

/**
 * Reproduces the Arkiv behaviours recorded in arkiv/friction.md, one at a time, with what each call returns.
 * Nothing here writes to the chain: every write is made from a fresh, unfunded key and fails at estimation.
 *   npm run repro
 */
const client = makePublicClient()
const head = await client.getBlockNumber({ cacheTime: 0 })
const project = eq("project", str("underthetable"))
const message = (error: unknown) => (error instanceof Error ? error.message.split("\n")[0].slice(0, 220) : String(error))

console.log(`SDK @arkiv-network/sdk 0.8.1, block ${head}\n`)

console.log("R1  a bare number against a u64 attribute (friction F13)")
try {
  const bare = await client.select({ key: true }).where(project, gte("amount_inr", 500 as never)).atBlock(head).limit(200).fetch()
  console.log(`    gte("amount_inr", 500)      -> ${bare.entities.length} rows`)
} catch (error) {
  console.log(`    gte("amount_inr", 500)      -> threw: ${message(error)}`)
}
const typed = await client.select({ key: true }).where(project, gte("amount_inr", u64(500n))).atBlock(head).limit(200).fetch()
console.log(`    gte("amount_inr", u64(500n)) -> ${typed.entities.length} rows\n`)

console.log("R2  $createdAt cannot be filtered (friction F5)")
try {
  await client.select({ key: true }).where(project, gte("$createdAt", u64(head - 2000n))).limit(5).fetch()
  console.log("    accepted")
} catch (error) {
  console.log(`    threw: ${message(error)}\n`)
}

console.log("R3  expired and never-existed look alike to getEntity (friction F14)")
const expired = "0x3922f6cbef9b03c6615eda04510103a4b2992d89693517cef89184ac1c509e18" // the one-hour Pune demo row, written 16 October 2026
for (const [label, key] of [["an expired entity", expired], ["a key that never existed", `0x${"11".repeat(32)}`]] as const) {
  try {
    await client.getEntity(key as `0x${string}`)
    console.log(`    ${label}: found`)
  } catch (error) {
    console.log(`    ${label}: ${message(error)}`)
  }
}
console.log("")

console.log("R4  a write from an unfunded key (friction F15)")
const account = privateKeyToAccount(generatePrivateKey())
const wallet = createWalletClient({ account, chain: tiramisu, transport: keyedHttp() })
try {
  await wallet.createEntity({ payload: jsonToPayload({ v: 1 }), contentType: "application/json", attributes: { project: str("repro") }, expires: ExpirationTime.fromDays(1) })
  console.log("    accepted (this should not happen from an unfunded key)")
} catch (error) {
  console.log(`    threw: ${message(error)}`)
}
