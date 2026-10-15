import { createPublicClient } from "@arkiv-network/sdk"
import { tiramisu } from "@arkiv-network/sdk/chains"
import { http, webSocket } from "viem"

export const CHAIN_ID = 7738577
export const CHAIN_ID_HEX = "0x7614d1"
export const RPC_HTTP = "https://rpc.tiramisu.db-chain.testnet.arkiv.network"
export const RPC_WS = "wss://rpc.tiramisu.db-chain.testnet.arkiv.network"
export const EXPLORER = "https://tiramisu.explorer.arkiv.network"
export const DEAD = "0x000000000000000000000000000000000000dEaD" as const
export const PAGE_LIMIT = 200
export const MAX_PAGES = 5

// With VITE_RPC_RELAY=1 the page reads through /api/rpc, where an access key can live. Off by default.
const relayed = (import.meta as { env?: Record<string, string> }).env?.VITE_RPC_RELAY === "1" && typeof window !== "undefined"
const READ_RPC = relayed ? `${window.location.origin}/api/rpc` : RPC_HTTP

/**
 * The Arkiv Hub access key, from the environment of a server, a script or the dev server. It raises the RPC
 * budget (1,000,000 units a month per key). It is sent as the X-API-KEY header and only to an arkiv.network
 * host. It does not exist in the browser: there is no `process` there, and it is never in the bundle.
 */
function authHeaders(rpc: string): Record<string, string> {
  const key = typeof process !== "undefined" ? process.env?.ARKIV_ACCESS_KEY : undefined
  if (!key) return {}
  try {
    return new URL(rpc).hostname.endsWith("arkiv.network") ? { "X-API-KEY": key } : {}
  } catch {
    return {}
  }
}

/** An HTTP transport to the RPC that carries the access key when a server has one. */
export function keyedHttp(rpc: string = RPC_HTTP, timeout = 20_000) {
  return http(rpc, { timeout, retryCount: 0, fetchOptions: { cache: "no-store", redirect: "error", headers: authHeaders(rpc) } })
}

export function makePublicClient(rpc: string = READ_RPC) {
  return createPublicClient({
    chain: tiramisu,
    cacheTime: 0,
    transport: http(rpc, {
      timeout: 10_000,
      retryCount: 0,
      fetchOptions: { cache: "no-store", redirect: "error", headers: authHeaders(rpc) },
    }),
  })
}

export function makeSocketClient() {
  return createPublicClient({
    chain: tiramisu,
    cacheTime: 0,
    transport: webSocket(RPC_WS, { retryCount: 0, timeout: 10_000 }),
  })
}

let shared: ReturnType<typeof makePublicClient> | undefined

export function sharedPublicClient() {
  shared ??= makePublicClient()
  return shared
}

export function entityUrl(key: string): string {
  return `${EXPLORER}/entity/${key}`
}

export function txUrl(hash: string): string {
  return `${EXPLORER}/tx/${hash}`
}
