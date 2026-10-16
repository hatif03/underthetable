import { relay } from "../rpc.ts"

type Req = { method?: string; body?: unknown }
type Res = { status: (code: number) => { setHeader: (k: string, v: string) => void; send: (body: string) => void } }

export default async function handler(req: Req, res: Res) {
  if (req.method !== "POST") return res.status(405).send(JSON.stringify({ error: "POST only." }))
  const upstream = process.env.ARKIV_RPC_URL || "https://rpc.tiramisu.db-chain.testnet.arkiv.network"
  const raw = typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {})
  const { status, body } = await relay(raw, upstream)
  const out = res.status(status)
  out.setHeader("Content-Type", "application/json")
  out.send(body)
}
