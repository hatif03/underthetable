import "./load-env.ts"
import { str } from "@arkiv-network/sdk/attr"
import { eq } from "@arkiv-network/sdk/query"
import { readFileSync, existsSync } from "node:fs"
import { makePublicClient, PAGE_LIMIT } from "../src/lib/client.ts"
import { findPrivate } from "../src/lib/guard.ts"
import { attestationProblem, reportProblem, type RawEntity } from "../src/lib/validate.ts"

/**
 * Reads every underthetable entity on Tiramisu, payload included, and checks each one against the same
 * rules the page applies (src/lib/validate.ts). It prints anything that does not belong: a value outside
 * the closed lists, an extra attribute, a payload that is not {"v":1}, an entity that its writer could still
 * delete, or a string that looks like a phone number, an email or a name.
 * A chain cannot be edited, so the audit is how we know the record is clean, and what we point judges at.
 *   npm run audit
 */
if (existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const match = /^ARKIV_RPC_URL=(.*)$/.exec(line.trim())
    if (match && !process.env.ARKIV_RPC_URL) process.env.ARKIV_RPC_URL = match[1].replace(/^["']|["']$/g, "")
  }
}
const client = makePublicClient(process.env.ARKIV_RPC_URL)
const head = await client.getBlockNumber({ cacheTime: 0 })

type Row = RawEntity & { key: string }
const rows: Row[] = []
let page = await client
  .select({ key: true, creator: true, owner: true, createdAt: true, expiresAt: true, attributes: true, payload: true })
  .where(eq("project", str("underthetable")))
  .atBlock(head)
  .limit(PAGE_LIMIT)
  .fetch()
rows.push(...(page.entities as unknown as Row[]))
for (let guard = 0; page.hasNextPage() && guard < 10; guard++) {
  page = await page.next()
  rows.push(...(page.entities as unknown as Row[]))
}

let reports = 0
let attestations = 0
const bad: string[] = []
for (const entity of rows) {
  const kind = entity.attributes?.type
  const type = kind && kind.type === "str" ? (kind.value as string) : "unknown"
  const problem = type === "attestation" ? attestationProblem(entity) : reportProblem(entity)
  const strings = Object.values(entity.attributes ?? {}).flatMap((cell) => (cell.type === "str" ? [cell.value as string] : []))
  const pii = strings.flatMap((value) => findPrivate(value).map((hit) => `${hit.note} in "${value}"`))
  if (problem || pii.length > 0) bad.push(`${entity.key}  ${problem ?? ""}${pii.length ? ` | looks like ${pii.join(", ")}` : ""}`)
  else if (type === "attestation") attestations += 1
  else reports += 1
}

console.log(`block ${head}`)
console.log(`entities read: ${rows.length}`)
console.log(`valid reports: ${reports}`)
console.log(`valid attestations: ${attestations}`)
console.log(`outside the schema: ${bad.length}`)
for (const line of bad) console.log(`  ${line}`)
console.log(bad.length === 0 ? "clean: nothing on chain is outside the closed lists" : "NOT CLEAN: the page ignores these rows, and they cannot be removed")
process.exit(bad.length === 0 ? 0 : 1)
