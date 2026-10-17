import { createWalletClient } from "@arkiv-network/sdk"
import { tiramisu } from "@arkiv-network/sdk/chains"
import { http, type Address, type Hex } from "viem"
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts"
import { RPC_HTTP } from "./client"

/**
 * A throwaway writer for people with no wallet. The key is made in the browser and kept in
 * localStorage. It holds a few cents of test GLM and signs nothing but underthetable reports.
 * "New identity" drops it, so one device's reports stop being linked by address.
 */
const STORAGE = "utt:identity"

export type Identity = { address: Address; client: ReturnType<typeof createWalletClient> }

function read(): Hex | null {
  try {
    const raw = localStorage.getItem(STORAGE)
    return raw && /^0x[0-9a-fA-F]{64}$/.test(raw) ? (raw as Hex) : null
  } catch {
    return null
  }
}

export function hasIdentity(): boolean {
  return read() !== null
}

export function currentAddress(): Address | null {
  const key = read()
  return key ? privateKeyToAccount(key).address : null
}

export function forgetIdentity() {
  try {
    localStorage.removeItem(STORAGE)
  } catch {
    // nothing stored, nothing to forget
  }
}

export function getIdentity(): Identity {
  let key = read()
  if (!key) {
    key = generatePrivateKey()
    try {
      localStorage.setItem(STORAGE, key)
    } catch {
      throw new Error("This browser blocks storage, so a throwaway identity cannot be kept. Use a wallet instead.")
    }
  }
  const account = privateKeyToAccount(key)
  return {
    address: account.address,
    client: createWalletClient({
      chain: tiramisu,
      account,
      transport: http(RPC_HTTP, { retryCount: 0, timeout: 20_000, fetchOptions: { cache: "no-store" } }),
    }),
  }
}

/** Ask the faucet route for gas. It sends once, and only when the address is nearly empty. */
export async function fundIdentity(address: Address, proof?: unknown): Promise<void> {
  const response = await fetch("/api/drip", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, proof }),
  }).catch(() => null)
  if (!response) throw new Error("The faucet could not be reached. Connect a wallet that holds test GLM instead.")
  const body = (await response.json().catch(() => ({}))) as { error?: string }
  if (!response.ok) throw new Error(body.error ?? "The faucet refused. Connect a wallet that holds test GLM instead.")
}
