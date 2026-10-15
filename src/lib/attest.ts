import type { Hex } from "viem"
import type { Coarse } from "./geo"

/** The sentence the filing wallet signs. The server checks the signature against the report's `$creator`. */
export function attestMessage(entityKey: string): string {
  return `underthetable: location check for ${entityKey.toLowerCase()}`
}

type Signer = {
  account?: { address: Hex } | undefined
  signMessage: (args: { account: { address: Hex }; message: string }) => Promise<Hex>
}

/**
 * Asks the checker to write an attestation for a report this wallet just filed. Only the state comes back.
 * The position was already rounded on the device and is used once, then dropped by the server.
 */
export async function requestAttestation(client: Signer, entityKey: Hex, position: Coarse): Promise<{ state: string; attestationKey?: string; txHash?: string }> {
  const account = client.account
  if (!account) throw new Error("The signing account is missing.")
  const signature = await client.signMessage({ account, message: attestMessage(entityKey) })
  const response = await fetch("/api/attest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entityKey, lat: position.lat, lon: position.lon, signature }),
  }).catch(() => null)
  if (!response) throw new Error("The location checker could not be reached. The report is filed and not location-checked.")
  const body = (await response.json().catch(() => ({}))) as { error?: string; state?: string; attestationKey?: string; txHash?: string }
  if (!response.ok || !body.state) throw new Error(body.error ?? "The location check failed.")
  return { state: body.state, attestationKey: body.attestationKey, txHash: body.txHash }
}
