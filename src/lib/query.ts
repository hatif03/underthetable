import type { Attributes } from "@arkiv-network/sdk"
import { addr, i32, str, u64 } from "@arkiv-network/sdk/attr"
import attesters from "../../data/attesters.json"
import curators from "../../data/curators.json"
import { attestationProblem, reportProblem, type RawEntity } from "./validate"
import { QueryError, and, eq, gte, lte, render } from "@arkiv-network/sdk/query"
import type { Address, Hex } from "viem"
import type { ReportRow } from "./aggregate"
import { MAX_PAGES, PAGE_LIMIT, makePublicClient, sharedPublicClient } from "./client"

const CACHE_MS = 60_000

/** A location check written by a trusted attester wallet. It points at a report by entity key. */
export type Attestation = { key: string; report: string; state: string; scope: string; attester: string }

const TRUSTED = new Set(attesters.addresses.map((address) => address.toLowerCase()))
const CURATORS = new Set(curators.addresses.map((address) => address.toLowerCase()))

export type BoardLoad = {
  rows: ReportRow[]
  attestations: Attestation[]
  blockNumber: bigint
  truncated: boolean
  ignored: number
  chainCount: number | null
  filteredCount: number | null
  fromCache: boolean
  /** "snapshot" when our server read Arkiv for the page, "direct" when the browser did. */
  via?: "snapshot" | "direct"
  /** Wall-clock ms when the rows were read from Arkiv. */
  savedAt: number
}

export type FetchOptions = {
  district?: string
  minInr?: number
  createdBy?: Address
  fresh?: boolean
  rpc?: string
  /** Read the chain as it was at this block, not at the head. Never cached. */
  atBlock?: bigint
  /** Skip the two count calls. The page spends its anonymous budget on rows. */
  light?: boolean
}

type CacheRow = Omit<ReportRow, "createdAt" | "expiresAt"> & {
  createdAt: string
  expiresAt: string
}

type CacheBody = {
  attestations?: Attestation[]
  savedAt: number
  blockNumber: string
  truncated: boolean
  ignored: number
  rows: CacheRow[]
  chainCount: number | null
  filteredCount: number | null
}

/** The board as JSON text, with block numbers as strings. Used by the snapshot route and its reader. */
export function boardToJson(board: BoardLoad): string {
  const body: CacheBody = {
    attestations: board.attestations,
    savedAt: board.savedAt,
    blockNumber: board.blockNumber.toString(),
    truncated: board.truncated,
    ignored: board.ignored,
    chainCount: board.chainCount,
    filteredCount: board.filteredCount,
    rows: board.rows.map((row) => ({ ...row, createdAt: row.createdAt.toString(), expiresAt: row.expiresAt.toString() })),
  }
  return JSON.stringify(body)
}

export function boardFromJson(text: string): BoardLoad {
  const body = JSON.parse(text) as CacheBody
  if (!Array.isArray(body.rows) || typeof body.blockNumber !== "string") throw new Error("That is not a board.")
  return {
    attestations: body.attestations ?? [],
    rows: body.rows.map((row) => ({ ...row, createdAt: BigInt(row.createdAt), expiresAt: BigInt(row.expiresAt) })),
    blockNumber: BigInt(body.blockNumber),
    truncated: body.truncated,
    ignored: body.ignored,
    chainCount: body.chainCount,
    filteredCount: body.filteredCount,
    fromCache: false,
    savedAt: body.savedAt,
    via: "snapshot",
  }
}

function cacheKey(options: FetchOptions): string {
  return `utt:board:${options.district ?? ""}:${options.minInr ?? ""}:${options.createdBy ?? ""}`
}

export function readCache(options: FetchOptions, maxAge = CACHE_MS): BoardLoad | null {
  if (options.rpc || options.atBlock !== undefined || typeof localStorage === "undefined") return null
  let raw: string | null = null
  try {
    raw = localStorage.getItem(cacheKey(options))
  } catch {
    return null
  }
  if (!raw) return null
  try {
    const body = JSON.parse(raw) as CacheBody
    if (Date.now() - body.savedAt > maxAge) return null
    return {
      attestations: body.attestations ?? [],
      rows: body.rows.map((row) => ({
        ...row,
        createdAt: BigInt(row.createdAt),
        expiresAt: BigInt(row.expiresAt),
      })),
      blockNumber: BigInt(body.blockNumber),
      truncated: body.truncated,
      ignored: body.ignored,
      chainCount: body.chainCount,
      filteredCount: body.filteredCount,
      fromCache: true,
      savedAt: body.savedAt,
    }
  } catch {
    return null
  }
}

function writeCache(options: FetchOptions, board: BoardLoad) {
  if (options.rpc || options.atBlock !== undefined || typeof localStorage === "undefined") return
  const body: CacheBody = {
    attestations: board.attestations,
    savedAt: Date.now(),
    blockNumber: board.blockNumber.toString(),
    truncated: board.truncated,
    ignored: board.ignored,
    chainCount: board.chainCount,
    filteredCount: board.filteredCount,
    rows: board.rows.map((row) => ({
      ...row,
      createdAt: row.createdAt.toString(),
      expiresAt: row.expiresAt.toString(),
    })),
  }
  try {
    localStorage.setItem(cacheKey(options), JSON.stringify(body))
  } catch {
    // storage full or blocked: the page still works without the cache
  }
}

function readStr(attributes: Attributes, name: string): string | null {
  const cell = attributes[name]
  if (!cell || cell.type !== "str") return null
  return cell.value
}

/** A valid, sealed underthetable report as a row, or null. See validate.ts: anything outside the lists is ignored. */
export function toReportRow(entity: RawEntity & { key?: Hex; creator?: Hex; owner?: Hex }, today?: string): ReportRow | null {
  if (!entity.key || !entity.creator || !entity.owner || entity.createdAt === undefined || entity.expiresAt === undefined) return null
  if (reportProblem(entity, today)) return null
  const attributes = entity.attributes as Attributes
  const amount = attributes.amount_inr
  if (!amount || amount.type !== "u64") return null
  return {
    key: entity.key,
    creator: entity.creator,
    owner: entity.owner,
    createdAt: entity.createdAt,
    expiresAt: entity.expiresAt,
    state: readStr(attributes, "state") as string,
    district: readStr(attributes, "district") as string,
    department: readStr(attributes, "department") as string,
    role: readStr(attributes, "role") as string,
    service: readStr(attributes, "service") as string,
    outcome: readStr(attributes, "outcome") as string,
    week: readStr(attributes, "week") as string,
    day: readStr(attributes, "day") ?? undefined,
    amountInr: Number(amount.value),
    kind: readStr(attributes, "kind") ?? "demand",
    // Anyone can write source = press. Only a listed curator wallet is believed.
    ...(attributes.lat_e5 && attributes.lon_e5 && attributes.lat_e5.type === "i32" && attributes.lon_e5.type === "i32"
      ? { lat: Number(attributes.lat_e5.value) / 100_000, lon: Number(attributes.lon_e5.value) / 100_000 }
      : {}),
    source: readStr(attributes, "source") === "press" && CURATORS.has(entity.creator.toLowerCase()) ? "press" : undefined,
  }
}

export function toAttestation(entity: RawEntity & { key?: Hex; creator?: Hex }): Attestation | null {
  const attributes = entity.attributes
  if (!entity.key || !entity.creator || !attributes) return null
  if (readStr(attributes, "type") !== "attestation") return null
  if (attestationProblem(entity)) return null
  const report = attributes.report
  const state = readStr(attributes, "state")
  const scope = readStr(attributes, "scope")
  if (!report || report.type !== "key" || !state || !scope) return null
  // Only a wallet the app trusts can vouch. Anyone can write an entity that looks like this one.
  if (!TRUSTED.has(entity.creator.toLowerCase())) return null
  return { key: entity.key, report: String(report.value).toLowerCase(), state, scope, attester: entity.creator }
}

async function filteredCount(
  client: ReturnType<typeof makePublicClient>,
  options: FetchOptions,
  snapshot: bigint,
): Promise<number | null> {
  if (!options.district && !options.createdBy) return null
  const parts = [eq("project", str("underthetable")), eq("type", str("report"))]
  if (options.district) parts.push(eq("district", str(options.district)))
  if (options.createdBy) parts.push(eq("$creator", addr(options.createdBy)))
  if (options.minInr !== undefined) parts.push(gte("amount_inr", u64(BigInt(options.minInr))))
  if (!Number.isSafeInteger(Number(snapshot))) return null
  const request = client.request as unknown as (args: {
    method: "arkiv_getEntityCount"
    params: [{ query: string; block: number }]
  }) => Promise<unknown>
  const count = await request({
    method: "arkiv_getEntityCount",
    params: [{ query: render(and(...parts)), block: Number(snapshot) }],
  })
  if (typeof count !== "number" || !Number.isSafeInteger(count) || count < 0) return null
  return count
}

export async function fetchReports(options: FetchOptions): Promise<BoardLoad> {
  const cached = options.fresh ? null : readCache(options)
  if (cached) return cached

  const client = options.rpc ? makePublicClient(options.rpc) : sharedPublicClient()
  let requests = 0
  const scoped = Boolean(options.district || options.createdBy || options.minInr !== undefined)
  for (let attempt = 0; attempt < 2; attempt++) {
    const snapshot = options.atBlock ?? (await client.getBlockNumber({ cacheTime: 0 }))
    try {
      let builder = client
        .select({
          key: true,
          creator: true,
          owner: true,
          createdAt: true,
          expiresAt: true,
          attributes: true,
          payload: true,
        })
        .where(eq("project", str("underthetable")))
      // An unscoped read returns reports and their attestations in one query. A scoped read is reports only.
      if (scoped) builder = builder.where(eq("type", str("report")))
      if (options.district) builder = builder.where(eq("district", str(options.district)))
      if (options.minInr !== undefined) builder = builder.where(gte("amount_inr", u64(BigInt(options.minInr))))
      if (options.createdBy) builder = builder.createdBy(options.createdBy)

      if (requests >= MAX_PAGES) break
      requests += 1
      let page = await builder.atBlock(snapshot).limit(PAGE_LIMIT).fetch()
      if (page.blockNumber !== snapshot) throw new Error("The query page was not read at the pinned block.")
      const entities = [...page.entities]
      let truncated = false
      while (page.hasNextPage()) {
        if (requests >= MAX_PAGES) {
          truncated = true
          break
        }
        requests += 1
        page = await page.next()
        if (page.blockNumber !== snapshot) throw new Error("A later page left the pinned block.")
        entities.push(...page.entities)
      }

      let ignored = 0
      const rows: ReportRow[] = []
      const attestations: Attestation[] = []
      for (const entity of entities) {
        const row = toReportRow(entity)
        if (row) rows.push(row)
        else {
          const attestation = toAttestation(entity)
          if (attestation) attestations.push(attestation)
          else ignored += 1
        }
      }

      const [chainCount, matched] = options.light
        ? [null, null]
        : await Promise.all([
            client.getEntityCount().catch(() => null),
            filteredCount(client, options, snapshot).catch(() => null),
          ])

      const board: BoardLoad = {
        rows,
        attestations,
        blockNumber: snapshot,
        truncated,
        ignored,
        chainCount,
        filteredCount: matched,
        fromCache: false,
        via: "direct",
        savedAt: Date.now(),
      }
      writeCache(options, board)
      return board
    } catch (error) {
      if (error instanceof QueryError && error.kind === "cursor" && attempt === 0) continue
      throw error
    }
  }
  throw new Error("The district query could not be finished.")
}

export function readError(error: unknown, district?: string, minInr?: number): string {
  const message = error instanceof Error ? error.message : String(error)
  if (/json|unexpected token|anon|cost|429|rate|limit exceeded|timeout/i.test(message)) {
    const flags = [district ? `--district ${district}` : "", minInr !== undefined ? `--min-inr ${minInr}` : ""].filter(Boolean)
    const command = flags.length === 0 ? "npm run query" : `npm run query -- ${flags.join(" ")}`
    return `The public Arkiv node refused this read. Run ${command}`
  }
  return message
}

export function isShortLived(row: ReportRow): boolean {
  return row.expiresAt > row.createdAt && row.expiresAt - row.createdAt <= 2_000n
}

export type Box = { south: number; west: number; north: number; east: number }

/**
 * Pinned problems inside a map view, answered by Arkiv itself: four range predicates on the i32 attributes
 * lat_e5 and lon_e5. A flat file or a content hash cannot answer "what is inside this rectangle" without
 * a server that downloads everything first.
 */
export async function fetchInBox(box: Box, rpc?: string): Promise<{ rows: ReportRow[]; blockNumber: bigint; query: string }> {
  const client = rpc ? makePublicClient(rpc) : sharedPublicClient()
  const snapshot = await client.getBlockNumber({ cacheTime: 0 })
  const parts = [
    eq("project", str("underthetable")),
    eq("type", str("report")),
    gte("lat_e5", i32(Math.floor(box.south * 100_000))),
    lte("lat_e5", i32(Math.ceil(box.north * 100_000))),
    gte("lon_e5", i32(Math.floor(box.west * 100_000))),
    lte("lon_e5", i32(Math.ceil(box.east * 100_000))),
  ]
  const page = await client
    .select({ key: true, creator: true, owner: true, createdAt: true, expiresAt: true, attributes: true, payload: true })
    .where(...parts)
    .atBlock(snapshot)
    .limit(PAGE_LIMIT)
    .fetch()
  const rows: ReportRow[] = []
  for (const entity of page.entities) {
    const row = toReportRow(entity)
    if (row && row.expiresAt > snapshot) rows.push(row)
  }
  return { rows, blockNumber: snapshot, query: render(and(...parts)) }
}
