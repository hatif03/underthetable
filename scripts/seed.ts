import "./load-env.ts"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { createWalletClient } from "@arkiv-network/sdk"
import { tiramisu } from "@arkiv-network/sdk/chains"
import { isAddress, parseEther, type Hex } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { keyedHttp, makePublicClient } from "../src/lib/client.ts"
import { sealReport, type ReportKind } from "../src/lib/guard.ts"
import { submitReport } from "../src/lib/write.ts"
import { kolkataDay } from "../src/lib/week.ts"

type EnvName = "SEED_KEY_1" | "SEED_KEY_2" | "SEED_KEY_3" | "FLOOD_KEY"

type Job = {
  name: string
  env: EnvName
  state: string
  district: string
  department: string
  role: string
  service: string
  outcome: string
  amountInr: number
  kind: ReportKind
  hours: boolean
}

type ProgressEntry = {
  status: "sending" | "receipt"
  txHash?: Hex
  entityKey?: Hex
  owner?: Hex
}

const directory: { env: EnvName; use: string }[] = [
  { env: "SEED_KEY_1", use: "First funded account. It also sends test GLM to the other three." },
  { env: "SEED_KEY_2", use: "Second creator. Funded by a transfer, not the faucet." },
  { env: "SEED_KEY_3", use: "Third creator. Funded by a transfer, not the faucet." },
  { env: "FLOOD_KEY", use: "Fourth creator. Five slips in one Nashik bucket, one voice." },
]

const voices: { env: EnvName; outcome: string; amountInr: number }[] = [
  { env: "SEED_KEY_1", outcome: "asked", amountInr: 500 },
  { env: "SEED_KEY_2", outcome: "paid", amountInr: 800 },
  { env: "SEED_KEY_3", outcome: "refused", amountInr: 700 },
]

const cities: { state: string; district: string }[] = [
  { state: "dl", district: "new_delhi" },
  { state: "ka", district: "bengaluru_urban" },
  { state: "tn", district: "chennai" },
  { state: "wb", district: "kolkata" },
  { state: "up", district: "lucknow" },
  { state: "gj", district: "ahmedabad" },
  { state: "tg", district: "hyderabad" },
  { state: "br", district: "patna" },
  { state: "rj", district: "jaipur" },
  { state: "mh", district: "mumbai" },
]

function licence(city: { state: string; district: string }, voice: (typeof voices)[number]): Job {
  return {
    name: `${city.district}-licence-${voice.env}`,
    env: voice.env,
    state: city.state,
    district: city.district,
    department: "rto",
    role: "motor_vehicle_inspector",
    service: "driving_licence",
    outcome: voice.outcome,
    amountInr: voice.amountInr,
    kind: "demand",
    hours: false,
  }
}

function condition(
  name: string,
  env: EnvName,
  department: string,
  service: string,
  outcome: string,
  amountInr: number,
  kind: ReportKind,
): Job {
  return {
    name,
    env,
    state: "mh",
    district: "nashik",
    department,
    role: "public",
    service,
    outcome,
    amountInr,
    kind,
    hours: false,
  }
}

const jobs: Job[] = [
  ...cities.flatMap((city) => voices.map((voice) => licence(city, voice))),
  licence({ state: "mh", district: "nashik" }, voices[1]),
  licence({ state: "mh", district: "nashik" }, voices[2]),
  ...[1000, 50, 60, 70, 80].map((amountInr, index): Job => ({
    ...licence({ state: "mh", district: "nashik" }, { env: "FLOOD_KEY", outcome: "asked", amountInr }),
    name: `nashik-flood-${index + 1}`,
  })),
  condition("nashik-pothole-2", "SEED_KEY_2", "municipal", "pothole", "noted", 3, "failure"),
  condition("nashik-pothole-3", "SEED_KEY_3", "municipal", "pothole", "worsened", 5, "failure"),
  condition("nashik-medicine-2", "SEED_KEY_2", "health", "medicine_missing", "noted", 2, "absence"),
  condition("nashik-medicine-3", "SEED_KEY_3", "health", "medicine_missing", "noted", 4, "absence"),
  condition("nashik-grain-2", "SEED_KEY_2", "ration", "grain_short", "noted", 3, "diversion"),
  condition("nashik-grain-3", "SEED_KEY_3", "ration", "grain_short", "worsened", 5, "diversion"),
]

// npm run seed -- --short writes one report that leaves every query in about an hour.
// Run it shortly before a demo so the Entity Expiration panel has something to show.
if (process.argv.includes("--short")) {
  jobs.push({
    ...condition(`pune-short-${new Date().toISOString().slice(0, 16)}`, "SEED_KEY_1", "municipal", "pothole", "noted", 2, "failure"),
    district: "pune",
    hours: true,
  })
}

function loadEnv() {
  if (!existsSync(".env")) return
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const match = /^(SEED_KEY_1|SEED_KEY_2|SEED_KEY_3|FLOOD_KEY|ARKIV_RPC_URL)=(.*)$/.exec(line.trim())
    if (!match || process.env[match[1]]) continue
    process.env[match[1]] = match[2].replace(/^["']|["']$/g, "")
  }
}

function accountFrom(name: string) {
  const raw = process.env[name]
  if (!raw || !/^0x[0-9a-fA-F]{64}$/.test(raw)) {
    throw new Error(`${name} must be a 32-byte hex key in the environment. The value is not printed.`)
  }
  return privateKeyToAccount(raw as `0x${string}`)
}

function addressFor(name: EnvName): string {
  const address = accountFrom(name).address
  if (!isAddress(address)) throw new Error("A derived address was not an address.")
  return address
}

function loadProgress(): Record<string, ProgressEntry> {
  if (!existsSync("arkiv/seed-progress.json")) return {}
  return JSON.parse(readFileSync("arkiv/seed-progress.json", "utf8")) as Record<string, ProgressEntry>
}

function saveProgress(progress: Record<string, ProgressEntry>) {
  mkdirSync("arkiv", { recursive: true })
  writeFileSync("arkiv/seed-progress.json", `${JSON.stringify(progress, null, 2)}\n`)
}

loadEnv()
const rpc = process.env.ARKIV_RPC_URL ?? tiramisu.rpcUrls.default.http[0]
const reader = makePublicClient(rpc)
const today = kolkataDay()
const progress = loadProgress()
const gift = parseEther("1")
const source = accountFrom("SEED_KEY_1")
const sourceWallet = createWalletClient({
  account: source,
  chain: tiramisu,
  transport: keyedHttp(rpc),
})
const clients = new Map<EnvName, typeof sourceWallet>()
clients.set("SEED_KEY_1", sourceWallet)

function clientFor(env: EnvName) {
  const existing = clients.get(env)
  if (existing) return existing
  const client = createWalletClient({
    account: accountFrom(env),
    chain: tiramisu,
    transport: keyedHttp(rpc),
  })
  clients.set(env, client)
  return client
}

const lines = [
  "# Wallets",
  "",
  "Four demo accounts for Tiramisu. Private keys stay in `.env` under these names. This file has addresses only.",
  "",
  "The slip itself is not limited to one city. Every state and union territory is in the place list. Nashik is only the district the page opens on.",
  "",
  ...directory.map((item) => `- \`${item.env}\`: \`${addressFor(item.env)}\`. ${item.use}`),
  "",
  "- Checker wallet (`ATTEST_KEY`): `0xabd68359A33fAb9A03Bb706B56272370A011E5b6`. Writes `attestation` entities only. Its address is also in data/attesters.json.",
  "- Browser identities: reports filed from the page come from throwaway addresses made in the visitor's browser and funded by /api/drip. They are not listed here.",
  "",
  "## Transfers",
  "",
]

for (const env of ["SEED_KEY_2", "SEED_KEY_3", "FLOOD_KEY"] as const) {
  const destination = accountFrom(env)
  const saved = progress[`fund-${env}`]
  if (saved?.txHash) {
    console.log(`fund ${env} already recorded ${saved.txHash}`)
    lines.push(`- 1 test GLM to \`${destination.address}\`, tx \`${saved.txHash}\``)
    continue
  }
  const held = await reader.getBalance({ address: destination.address })
  if (held >= gift) {
    console.log(`${env} already holds enough`)
    lines.push(`- \`${destination.address}\` already held at least 1 test GLM`)
    continue
  }
  const sourceBalance = await reader.getBalance({ address: source.address })
  if (sourceBalance < gift) {
    throw new Error(`The funded wallet does not have 1 test GLM left to send to ${destination.address}.`)
  }
  const hash = await sourceWallet.sendTransaction({ to: destination.address, value: gift })
  const mined = await reader.waitForTransactionReceipt({ hash })
  if (mined.status !== "success") throw new Error(`Transfer to ${destination.address} did not succeed.`)
  progress[`fund-${env}`] = { status: "receipt", txHash: hash }
  saveProgress(progress)
  console.log(`sent 1 GLM to ${env} ${destination.address} ${hash}`)
  lines.push(`- 1 test GLM to \`${destination.address}\`, tx \`${hash}\``)
}

lines.push("", "## Entities", "")

const known = new Set(jobs.map((job) => job.name))
for (const [name, entry] of Object.entries(progress)) {
  if (known.has(name) || name.startsWith("fund-") || !entry.txHash) continue
  lines.push(`- ${name}: tx \`${entry.txHash}\`, entity \`${entry.entityKey ?? "not recorded"}\``)
}

for (const job of jobs) {
  const saved = progress[job.name]
  if (saved?.status === "sending" && !saved.txHash) {
    throw new Error(`${job.name} was already sent and has no recorded receipt. It was not submitted again.`)
  }
  if (saved?.txHash && saved.entityKey) {
    console.log(`${job.name} already recorded ${saved.entityKey}`)
    lines.push(`- ${job.name}: tx \`${saved.txHash}\`, entity \`${saved.entityKey}\``)
    continue
  }

  const report = sealReport({
    state: job.state,
    district: job.district,
    department: job.department,
    role: job.role,
    service: job.service,
    outcome: job.outcome,
    amountInr: job.amountInr,
    day: today,
    today,
    kind: job.kind,
  })
  const filed = await submitReport(clientFor(job.env), report, job.hours, reader, false)
  const mined = await reader.waitForTransactionReceipt({ hash: filed.txHash })
  if (mined.status !== "success") {
    throw new Error(`${job.name} transaction ${filed.txHash} did not succeed.`)
  }
  progress[job.name] = { status: "receipt", txHash: filed.txHash, entityKey: filed.entityKey, owner: filed.owner }
  saveProgress(progress)
  console.log(`${job.name} ${addressFor(job.env)} tx ${filed.txHash} key ${filed.entityKey}`)
  lines.push(`- ${job.name}: ${job.state}/${job.district} ${job.kind} ${job.service} ${job.amountInr}, tx \`${filed.txHash}\`, entity \`${filed.entityKey}\``)
}

lines.push(
  "",
  "A desk is quoted only after 3 different wallets. These examples use the same driving-licence demand in several cities, plus Nashik reports for a broken road, missing medicine, and short grain. The public read budget may still refuse the page until it resets.",
)
mkdirSync("arkiv", { recursive: true })
writeFileSync("arkiv/wallets.md", `${lines.join("\n")}\n`)
