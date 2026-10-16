import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);

// server/rpc.ts
var ALLOWED = /* @__PURE__ */ new Set([
  "arkiv_query",
  "arkiv_getEntityCount",
  "eth_blockNumber",
  "eth_chainId",
  "eth_getBalance"
]);
var cache = /* @__PURE__ */ new Map();
async function relay(raw, upstream) {
  let call;
  try {
    call = JSON.parse(raw);
  } catch {
    return { status: 400, body: JSON.stringify({ error: "Send one JSON-RPC call." }) };
  }
  if (typeof call.method !== "string" || !ALLOWED.has(call.method)) {
    return { status: 403, body: JSON.stringify({ error: "That method is not relayed. Reads only." }) };
  }
  const hit = cache.get(raw);
  if (hit && Date.now() - hit.at < 4e3) return { status: 200, body: hit.body };
  const key = process.env.ARKIV_ACCESS_KEY;
  const response = await fetch(upstream, { method: "POST", headers: { "Content-Type": "application/json", ...key ? { "X-API-KEY": key } : {} }, body: raw });
  const body = await response.text();
  if (response.ok) cache.set(raw, { at: Date.now(), body });
  if (cache.size > 200) cache.clear();
  return { status: response.status, body };
}

// server/handlers/rpc.ts
async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send(JSON.stringify({ error: "POST only." }));
  const upstream = process.env.ARKIV_RPC_URL || "https://rpc.tiramisu.db-chain.testnet.arkiv.network";
  const raw = typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {});
  const { status, body } = await relay(raw, upstream);
  const out = res.status(status);
  out.setHeader("Content-Type", "application/json");
  out.send(body);
}
export {
  handler as default
};
