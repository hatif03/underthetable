import "./load-env.ts"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { createWalletClient } from "@arkiv-network/sdk"
import { tiramisu } from "@arkiv-network/sdk/chains"
import { type Hex } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import curators from "../data/curators.json" with { type: "json" }
import { keyedHttp, makePublicClient } from "../src/lib/client.ts"
import { sealReport, type ReportKind } from "../src/lib/guard.ts"
import { submitReport } from "../src/lib/write.ts"
import { kolkataDay } from "../src/lib/week.ts"

/**
 * Writes press-sourced reports from data/press-records.json, one Arkiv entity each, from the curator wallet.
 * A press-sourced report is the same closed-list slip as a citizen report with source = press. It is one
 * wallet, so it can never reach the 3-wallet figure on its own. The articles behind each one go to
 * data/press-sources.json (by entity key) and docs/press-records.md. Nothing in them names a person.
 *   npm run seed:press            writes the records that have no receipt yet
 *   npm run seed:press -- --dry   checks every record against the guard and prints nothing to the chain
 */
type Source = { outlet: string; url: string; title: string; published: string }
type PressRecord = {
  id: string
  kind: ReportKind
  state: string
  district: string
  department: string
  role: string
  service: string
  outcome: string
  amountInr: number
  eventDate: string
  sources: Source[]
  note: string
}
type Progress = { txHash: Hex; entityKey: Hex }

for (const line of existsSync(".env") ? readFileSync(".env", "utf8").split(/\r?\n/) : []) {
  const match = /^(PRESS_KEY|ARKIV_RPC_URL)=(.*)$/.exec(line.trim())
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^["']|["']$/g, "")
}

const records = JSON.parse(readFileSync("data/press-records.json", "utf8")) as PressRecord[]
const today = kolkataDay()
const dry = process.argv.includes("--dry")

// Check every record first so a bad one stops the run before anything is written.
const sealed = records.map((record) => {
  if (record.sources.length === 0) throw new Error(`${record.id} has no source`)
  return sealReport({
    state: record.state,
    district: record.district,
    department: record.department,
    role: record.role,
    service: record.service,
    outcome: record.outcome,
    amountInr: record.amountInr,
    day: record.eventDate,
    today,
    kind: record.kind,
    source: "press",
  })
})
console.log(`${records.length} records pass the guard`)
if (dry) process.exit(0)

const raw = process.env.PRESS_KEY
if (!raw || !/^0x[0-9a-fA-F]{64}$/.test(raw)) throw new Error("PRESS_KEY must be a 32-byte hex key in .env. The value is not printed.")
const account = privateKeyToAccount(raw as Hex)
if (!curators.addresses.map((address) => address.toLowerCase()).includes(account.address.toLowerCase())) {
  throw new Error("PRESS_KEY is not listed in data/curators.json, so the page would not believe its reports.")
}
const rpc = process.env.ARKIV_RPC_URL ?? tiramisu.rpcUrls.default.http[0]
const reader = makePublicClient(rpc)
const wallet = createWalletClient({ account, chain: tiramisu, transport: keyedHttp(rpc, 30_000) })

const progressPath = "arkiv/press-progress.json"
const progress: Record<string, Progress> = existsSync(progressPath) ? JSON.parse(readFileSync(progressPath, "utf8")) : {}
const sourcesPath = "data/press-sources.json"
const sourceMap: Record<string, { sources: Source[]; note: string }> = existsSync(sourcesPath) ? JSON.parse(readFileSync(sourcesPath, "utf8")) : {}

for (const [index, record] of records.entries()) {
  if (progress[record.id]) {
    console.log(`${record.id} already written ${progress[record.id].entityKey}`)
    continue
  }
  // Strictly one write at a time from this wallet.
  const receipt = await submitReport(wallet, sealed[index], false, reader, false)
  const mined = await reader.waitForTransactionReceipt({ hash: receipt.txHash })
  if (mined.status !== "success") throw new Error(`${record.id} transaction ${receipt.txHash} did not succeed`)
  progress[record.id] = { txHash: receipt.txHash, entityKey: receipt.entityKey }
  sourceMap[receipt.entityKey.toLowerCase()] = { sources: record.sources, note: record.note }
  mkdirSync("arkiv", { recursive: true })
  writeFileSync(progressPath, `${JSON.stringify(progress, null, 2)}\n`)
  writeFileSync(sourcesPath, `${JSON.stringify(sourceMap, null, 2)}\n`)
  console.log(`${record.id} ${receipt.entityKey} ${receipt.txHash}`)
}

const lines = [
  "# Press-sourced reports",
  "",
  `Written by the curator wallet \`${account.address}\` from published news, between 9 and 16 October 2026. Each is one Arkiv entity with \`source = press\`. None names a person. They are not citizen reports and do not count toward a 3-wallet figure. Severity is the curator's reading of the article, with the basis given below; a figure in rupees is the amount the article states.`,
  "",
  "| Record | Kind | District | Service | Week | Figure | Entity | Sources |",
  "| --- | --- | --- | --- | --- | --- | --- | --- |",
  ...records.map((record, index) => {
    const done = progress[record.id]
    const figure = record.kind === "demand" ? `₹${record.amountInr.toLocaleString("en-IN")}` : `severity ${record.amountInr}`
    const links = record.sources.map((source) => `[${source.outlet}](${source.url})`).join(", ")
    return `| ${record.id} | ${record.kind} | ${record.district}, ${record.state} | ${record.service} | ${sealed[index].week} | ${figure} | ${done ? `\`${done.entityKey}\`` : "not written"} | ${links} |`
  }),
  "",
]
writeFileSync("docs/press-records.md", lines.join("\n"))
console.log("wrote docs/press-records.md")
