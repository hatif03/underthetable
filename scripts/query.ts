import "./load-env.ts"
import { isAddress, type Address } from "viem"
import { derive } from "../src/lib/derive.ts"
import { measure, rupees, shortAddress } from "../src/lib/format.ts"
import { departmentLabel, labelize } from "../src/lib/labels.ts"
import { fetchReports, readError } from "../src/lib/query.ts"

function flag(name: string): string | undefined {
  const index = process.argv.indexOf(name)
  if (index === -1) return undefined
  return process.argv[index + 1]
}

const district = flag("--district")
const minRaw = flag("--min-inr")
const createdBy = flag("--created-by")
const minInr = minRaw === undefined ? undefined : Number(minRaw)

if (!district && !createdBy) {
  console.log("Reading every underthetable report still on Tiramisu.")
}
if (minRaw !== undefined && (!Number.isInteger(minInr) || (minInr ?? 0) < 1)) {
  console.error("--min-inr needs a whole number of rupees.")
  process.exit(1)
}
if (createdBy !== undefined && !isAddress(createdBy)) {
  console.error("--created-by needs an address.")
  process.exit(1)
}

const rpc = process.env.ARKIV_RPC_URL
let board
try {
  board = await fetchReports({
    district,
    minInr,
    createdBy: createdBy as Address | undefined,
    fresh: true,
    rpc,
  })
} catch (error) {
  console.error(readError(error, district ?? "nashik", minInr))
  process.exit(1)
}
const d = derive(board.rows, board.blockNumber, Date.now(), board.attestations)
const quoted = d.quoted
const unquoted = d.desks.filter((desk) => !desk.quoted).flatMap((desk) => desk.voiceRows)

console.log(`block ${board.blockNumber}`)
if (board.truncated) console.log("stopped after 5 pages")
if (board.filteredCount !== null) console.log(`matching ${board.filteredCount}`)
if (board.chainCount !== null) console.log(`chain ${board.chainCount}`)
console.log(`reports ${d.live.length}, location-checked ${d.verifiedCount} (attestations by trusted wallets: ${board.attestations.length})`)
console.log(`quoted ${quoted.length}`)
for (const bucket of quoted) {
  console.log(
    `${labelize(bucket.district)} ${departmentLabel(bucket.department)} ${labelize(bucket.service)} ${bucket.week} voices ${bucket.voices} checked ${bucket.verifiedVoices} median ${measure(bucket.kind, bucket.medianInr ?? 0)}`,
  )
}
console.log(`unquoted ${unquoted.length}`)
for (const row of unquoted) {
  console.log(`${row.key} creator ${shortAddress(row.creator)} ${labelize(row.service)} ${row.week} ${rupees(row.amountInr)}`)
}
