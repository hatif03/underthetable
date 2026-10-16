/**
 * A read-only relay for the public RPC. It exists so an Arkiv access key can live on the server
 * and not in the bundle. It forwards read methods only and shares one answer between identical
 * bodies for four seconds. Without a key it is no better than the browser calling direct.
 */
const ALLOWED = new Set([
  "arkiv_query",
  "arkiv_getEntityCount",
  "eth_blockNumber",
  "eth_chainId",
  "eth_getBalance",
])
const cache = new Map<string, { at: number; body: string }>()

export async function relay(raw: string, upstream: string): Promise<{ status: number; body: string }> {
  let call: { method?: unknown }
  try {
    call = JSON.parse(raw)
  } catch {
    return { status: 400, body: JSON.stringify({ error: "Send one JSON-RPC call." }) }
  }
  if (typeof call.method !== "string" || !ALLOWED.has(call.method)) {
    return { status: 403, body: JSON.stringify({ error: "That method is not relayed. Reads only." }) }
  }
  const hit = cache.get(raw)
  if (hit && Date.now() - hit.at < 4000) return { status: 200, body: hit.body }
  const key = process.env.ARKIV_ACCESS_KEY
  const response = await fetch(upstream, { method: "POST", headers: { "Content-Type": "application/json", ...(key ? { "X-API-KEY": key } : {}) }, body: raw })
  const body = await response.text()
  if (response.ok) cache.set(raw, { at: Date.now(), body })
  if (cache.size > 200) cache.clear()
  return { status: response.status, body }
}
