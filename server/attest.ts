import { createWalletClient, ExpirationTime, jsonToPayload } from "@arkiv-network/sdk"
import { key, str } from "@arkiv-network/sdk/attr"
import { tiramisu } from "@arkiv-network/sdk/chains"
import { eq } from "@arkiv-network/sdk/query"
import { isHex, verifyMessage, type Hex } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { attestMessage } from "../src/lib/attest.ts"
import { DEAD, keyedHttp, makePublicClient } from "../src/lib/client.ts"
import { reportProblem } from "../src/lib/validate.ts"
import states from "./geo/states.json" with { type: "json" }

/**
 * The location check. The browser sends the key of a report it just filed, a signature from the wallet that
 * filed it, and its position rounded to about 5 km. If the position is inside the state on the report, this
 * wallet (the attester) writes a second Arkiv entity, type "attestation", that points at the report.
 * The position is used for the comparison and is not stored or logged. The attestation names only the state.
 * It is a hint against remote trolls, not proof: a phone can fake a position.
 */
type Ring = [number, number][]
const polygons = states.polygons as { state: string; ring: Ring }[]
const WINDOW_BLOCKS = 900 // about 30 minutes at 2 s
const MARGIN = 0.05 // the position was rounded to 0.05 and the polygons were simplified to 0.02
const hits = new Map<string, number[]>()

function inRing(x: number, y: number, ring: Ring): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

/** Inside the state, or within one rounding step of it. Ladakh shares the Jammu and Kashmir polygon. */
export function insideState(lat: number, lon: number, state: string): boolean {
  const slugs = state === "la" || state === "jk" ? ["jk", "la"] : [state]
  const rings = polygons.filter((p) => slugs.includes(p.state)).map((p) => p.ring)
  const probes: [number, number][] = [[0, 0], [MARGIN, 0], [-MARGIN, 0], [0, MARGIN], [0, -MARGIN], [MARGIN, MARGIN], [-MARGIN, -MARGIN], [MARGIN, -MARGIN], [-MARGIN, MARGIN]]
  return probes.some(([dx, dy]) => rings.some((ring) => inRing(lon + dx, lat + dy, ring)))
}

export async function attest(
  body: { entityKey?: unknown; lat?: unknown; lon?: unknown; signature?: unknown },
  client: string,
  env: { key?: string; rpc?: string },
) {
  if (!env.key || !/^0x[0-9a-fA-F]{64}$/.test(env.key)) throw new Error("The location checker is not configured on this host.")
  const { entityKey, lat, lon, signature } = body
  if (typeof entityKey !== "string" || !isHex(entityKey, { strict: true }) || entityKey.length !== 66) throw new Error("That is not a report key.")
  if (typeof signature !== "string" || !isHex(signature)) throw new Error("The request was not signed.")
  if (typeof lat !== "number" || typeof lon !== "number" || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    throw new Error("That is not a position.")
  }

  const now = Date.now()
  const recent = (hits.get(client) ?? []).filter((time) => now - time < 3_600_000)
  if (recent.length >= 6) throw new Error("The location checker is resting. Try again in an hour.")

  const rpc = env.rpc || tiramisu.rpcUrls.default.http[0]
  const reader = makePublicClient(rpc)
  const [report, head] = await Promise.all([reader.getEntity(entityKey as Hex), reader.getBlockNumber({ cacheTime: 0 })])
  const attrs = report.attributes ?? {}
  const text = (name: string) => (attrs[name]?.type === "str" ? (attrs[name].value as string) : null)
  if (text("project") !== "underthetable" || text("type") !== "report") throw new Error("That entity is not an underthetable report.")
  const invalid = reportProblem(report)
  if (invalid) throw new Error(`That report is outside the schema (${invalid}), so it will not be vouched for.`)
  if (!report.creator || report.createdAt === undefined) throw new Error("The report has no creator yet. Try again in a moment.")
  if (head - report.createdAt > BigInt(WINDOW_BLOCKS)) throw new Error("A location check has to happen within 30 minutes of filing.")
  const valid = await verifyMessage({ address: report.creator, message: attestMessage(entityKey), signature: signature as Hex })
  if (!valid) throw new Error("The request was not signed by the wallet that filed this report.")

  const state = text("state")
  if (!state) throw new Error("The report has no state.")
  if (!insideState(lat, lon, state)) throw new Error("Your position is not inside the state on this report, so it was not location-checked.")

  const existing = await reader
    .select({ key: true })
    .where(eq("project", str("underthetable")), eq("type", str("attestation")), eq("report", key(entityKey as Hex)))
    .limit(1)
    .fetch()
  if (existing.entities.length > 0) return { scope: "state", state, already: true }

  const account = privateKeyToAccount(env.key as Hex)
  const wallet = createWalletClient({ account, chain: tiramisu, transport: keyedHttp(rpc) })
  const [predicted] = await reader.predictEntityKeys({ owner: account.address, count: 1 })
  const result = await wallet.executeBatch({
    creates: [
      {
        payload: jsonToPayload({ v: 1 }),
        contentType: "application/json",
        attributes: { project: str("underthetable"), type: str("attestation"), report: key(entityKey as Hex), method: str("geo"), scope: str("state"), state: str(state) },
        expires: ExpirationTime.fromDays(180),
        flags: { readonly: true, permissionlessExtension: false },
        salt: predicted.salt,
      },
    ],
    ownershipChanges: [{ entityKey: predicted.key, newOwner: DEAD }],
  })
  hits.set(client, [...recent, now])
  return { scope: "state", state, txHash: result.txHash, attestationKey: result.createdEntities[0] }
}
