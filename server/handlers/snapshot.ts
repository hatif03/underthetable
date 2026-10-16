import { snapshot } from "../snapshot.ts"

type Res = { status: (code: number) => { setHeader: (k: string, v: string) => void; send: (body: string) => void } }

export default async function handler(_req: unknown, res: Res) {
  const { status, body, stale } = await snapshot(process.env.ARKIV_RPC_URL || "https://rpc.tiramisu.db-chain.testnet.arkiv.network")
  const out = res.status(status)
  out.setHeader("Content-Type", "application/json")
  out.setHeader("X-Snapshot", stale ? "stale" : "fresh")
  out.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300")
  out.send(body)
}
