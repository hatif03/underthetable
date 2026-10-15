import { ExpirationTime, jsonToPayload } from "@arkiv-network/sdk"
import { str, u64 } from "@arkiv-network/sdk/attr"
import type { Hex } from "viem"
import { DEAD, makePublicClient, sharedPublicClient } from "./client"
import { assertPayload, PAYLOAD_BYTES, type SealedReport } from "./guard"
import { assertSameAccount, type Connection } from "./wallet"

export type SealReceipt = {
  entityKey: Hex
  txHash: Hex
  owner: Hex
  creator: Hex
  expiresAt: bigint
}

let pending = false

function rejected(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === 4001
}

export async function submitReport(
  wallet: Connection["client"],
  report: SealedReport,
  hours = false,
  reader: ReturnType<typeof makePublicClient> = sharedPublicClient(),
  readBack = true,
): Promise<SealReceipt> {
  const owner = wallet.account?.address
  if (!owner) throw new Error("The signing account is missing.")
  const payload = jsonToPayload({ v: 1 })
  assertPayload(payload)
  if (payload.length !== PAYLOAD_BYTES.length || payload.some((byte, index) => byte !== PAYLOAD_BYTES[index])) {
    throw new Error("The payload must be exactly {\"v\":1}.")
  }

  const attributes = {
    project: str(report.project),
    type: str(report.type),
    state: str(report.state),
    district: str(report.district),
    department: str(report.department),
    role: str(report.role),
    service: str(report.service),
    outcome: str(report.outcome),
    kind: str(report.kind),
    week: str(report.week),
    amount_inr: u64(report.amount_inr),
    ...(report.source ? { source: str(report.source) } : {}),
  }
  const expires = hours ? ExpirationTime.fromHours(1) : ExpirationTime.fromDays(180)
  const flags = { readonly: true as const, permissionlessExtension: false as const }

  let [predicted] = await reader.predictEntityKeys({ owner, count: 1 })
  let result
  try {
    result = await wallet.executeBatch({
      creates: [{ payload, contentType: "application/json", attributes, expires, flags, salt: predicted.salt }],
      ownershipChanges: [{ entityKey: predicted.key, newOwner: DEAD }],
    })
  } catch (error) {
    if (rejected(error)) throw new Error("The wallet cancelled the request.")
    ;[predicted] = await reader.predictEntityKeys({ owner, count: 1 })
    result = await wallet.executeBatch({
      creates: [{ payload, contentType: "application/json", attributes, expires, flags, salt: predicted.salt }],
      ownershipChanges: [{ entityKey: predicted.key, newOwner: DEAD }],
    })
  }

  const entityKey = result.createdEntities[0]
  if (!entityKey || entityKey.toLowerCase() !== predicted.key.toLowerCase()) {
    throw new Error("The batch sealed a different key than the one it transferred. It was not recorded as filed.")
  }

  if (!readBack) {
    return { entityKey, txHash: result.txHash, owner: DEAD, creator: owner, expiresAt: 0n }
  }

  let entity
  try {
    entity = await reader.getEntity(entityKey)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Transaction ${result.txHash} created ${entityKey}, and reading it back failed: ${message}`)
  }
  if (!entity.owner || entity.owner.toLowerCase() !== DEAD.toLowerCase()) {
    throw new Error("The entity was created, but its owner is not the dead address.")
  }
  if (!entity.creator || entity.expiresAt === undefined) {
    throw new Error("The entity came back without a creator or an expiry block.")
  }
  return {
    entityKey,
    txHash: result.txHash,
    owner: entity.owner,
    creator: entity.creator,
    expiresAt: entity.expiresAt,
  }
}

export async function fileReport(connection: Connection, report: SealedReport, hours = false): Promise<SealReceipt> {
  if (pending) throw new Error("This wallet already has a write in flight.")
  pending = true
  try {
    await assertSameAccount(connection)
    return await submitReport(connection.client, report, hours)
  } finally {
    pending = false
  }
}

/** The creator tries to delete a sealed report. It must fail. The revert text is the proof. */
export async function tryDelete(client: Connection["client"], entityKey: Hex): Promise<string> {
  try {
    const result = await client.deleteEntity({ entityKey })
    return `deleteEntity was accepted in ${result.txHash}. The seal did not hold.`
  } catch (error) {
    if (rejected(error)) return "The wallet cancelled the seal check."
    return error instanceof Error ? error.message : String(error)
  }
}

export async function sealCheck(connection: Connection, entityKey: Hex): Promise<string> {
  await assertSameAccount(connection)
  return tryDelete(connection.client, entityKey)
}

/** File from the throwaway identity. Same batch, same guard, one write in flight. */
export async function fileAsIdentity(client: Connection["client"], report: SealedReport): Promise<SealReceipt> {
  if (pending) throw new Error("This wallet already has a write in flight.")
  pending = true
  try {
    return await submitReport(client, report)
  } finally {
    pending = false
  }
}
