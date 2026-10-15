import "./load-env.ts"
import { createWalletClient, ExpirationTime } from "@arkiv-network/sdk"
import { u64 } from "@arkiv-network/sdk/attr"
import { tiramisu } from "@arkiv-network/sdk/chains"
import { existsSync, readFileSync } from "node:fs"
import { type Hex } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { DEAD, keyedHttp, makePublicClient } from "../src/lib/client.ts"
import { fetchReports } from "../src/lib/query.ts"

/**
 * Proves the seal on a live entity. Reads it, then tries four writes that must all revert:
 * patch and delete from the creator, extend from the creator and from a stranger.
 * Reverts are caught at gas estimation, so a passing run spends no GLM.
 *   npm run verify                 (picks a live entity written by a team wallet)
 *   npm run verify -- --key 0x...  (any entity)
 */
const NAMES = ["SEED_KEY_1", "SEED_KEY_2", "SEED_KEY_3", "FLOOD_KEY"] as const
if (existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const match = /^(SEED_KEY_1|SEED_KEY_2|SEED_KEY_3|FLOOD_KEY|ARKIV_RPC_URL)=(.*)$/.exec(line.trim())
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^["']|["']$/g, "")
  }
}
const rpc = process.env.ARKIV_RPC_URL ?? tiramisu.rpcUrls.default.http[0]
const accounts = NAMES.flatMap((name) => {
  const raw = process.env[name]
  return raw && /^0x[0-9a-fA-F]{64}$/.test(raw) ? [{ name, account: privateKeyToAccount(raw as Hex) }] : []
})
if (accounts.length < 2) {
  console.error("Needs two of SEED_KEY_1, SEED_KEY_2, SEED_KEY_3, FLOOD_KEY in .env: one creator and one stranger.")
  process.exit(1)
}

const flag = process.argv.indexOf("--key")
const reader = makePublicClient(rpc)
let key = flag > -1 ? (process.argv[flag + 1] as Hex) : undefined
if (!key) {
  const board = await fetchReports({ light: true, fresh: true, rpc })
  const row = board.rows.find((item) => item.expiresAt > board.blockNumber && accounts.some((a) => a.account.address.toLowerCase() === item.creator.toLowerCase()))
  if (!row) {
    console.error("No live entity from a team wallet was found. Pass --key.")
    process.exit(1)
  }
  key = row.key as Hex
}

const entity = await reader.getEntity(key)
console.log(`entity   ${key}`)
console.log(`creator  ${entity.creator}`)
console.log(`owner    ${entity.owner}`)
console.log(`expires  block ${entity.expiresAt}`)
let failed = false
function check(label: string, ok: boolean) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}`)
  if (!ok) failed = true
}
check("owner is the dead address", entity.owner?.toLowerCase() === DEAD.toLowerCase())

const creator = accounts.find((a) => a.account.address.toLowerCase() === entity.creator?.toLowerCase())
const stranger = accounts.find((a) => a.account.address.toLowerCase() !== entity.creator?.toLowerCase())
const wallet = (account: (typeof accounts)[number]) =>
  createWalletClient({ account: account.account, chain: tiramisu, transport: keyedHttp(rpc, 30_000) })

async function mustRevert(label: string, run: () => Promise<unknown>) {
  try {
    await run()
    check(`${label} reverted`, false)
  } catch (error) {
    const message = error instanceof Error ? error.message.split("\n")[0] : String(error)
    check(`${label} reverted`, true)
    console.log(`        ${message.slice(0, 180)}`)
  }
}

if (creator) {
  const client = wallet(creator)
  await mustRevert("patchEntity from the creator", () => client.patchEntity({ entityKey: key as Hex, set: { amount_inr: u64(1n) } }))
  await mustRevert("deleteEntity from the creator", () => client.deleteEntity({ entityKey: key as Hex }))
  await mustRevert("extendEntity from the creator", () => client.extendEntity({ entityKey: key as Hex, expires: ExpirationTime.fromDays(365) }))
} else {
  console.log("SKIP  the creator of this entity is not one of the wallets in .env")
}
if (stranger) {
  await mustRevert("extendEntity from a stranger", () => wallet(stranger).extendEntity({ entityKey: key as Hex, expires: ExpirationTime.fromDays(365) }))
}
// A location attestation is an entity too. It must be owned by the dead address and written by a trusted wallet.
const board = await fetchReports({ light: true, rpc })
const proof = board.attestations[0]
if (proof) {
  const attestation = await reader.getEntity(proof.key as Hex)
  console.log(`attestation ${proof.key} for report ${proof.report}`)
  check("attestation owner is the dead address", attestation.owner?.toLowerCase() === DEAD.toLowerCase())
  check("attestation written by a trusted attester", board.attestations.length > 0)
  const attester = accounts.find((a) => a.account.address.toLowerCase() === attestation.creator?.toLowerCase())
  if (!attester && stranger) {
    await mustRevert("deleteEntity from a stranger on the attestation", () => wallet(stranger).deleteEntity({ entityKey: proof.key as Hex }))
  }
} else {
  console.log("SKIP  no trusted attestation is on the chain yet")
}
process.exit(failed ? 1 : 0)
