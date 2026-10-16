import { attest } from "../attest.ts"

type Req = { method?: string; body?: Record<string, unknown>; headers: Record<string, string | string[] | undefined> }
type Res = { status: (code: number) => { json: (body: unknown) => void } }

export default async function handler(req: Req, res: Res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only." })
  const forwarded = req.headers["x-forwarded-for"]
  const client = String(Array.isArray(forwarded) ? forwarded[0] : (forwarded ?? "unknown")).split(",")[0].trim()
  try {
    res.status(200).json(await attest(req.body ?? {}, client, { key: process.env.ATTEST_KEY, rpc: process.env.ARKIV_RPC_URL }))
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "The location check failed." })
  }
}
