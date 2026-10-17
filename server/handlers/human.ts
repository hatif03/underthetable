import { humanMode } from "../human.ts"

type Res = { status: (code: number) => { setHeader: (k: string, v: string) => void; json: (body: unknown) => void } }

/** Tells the page how a person is to be proven: Turnstile if the host has keys, a proof of work if not. */
export default function handler(_req: unknown, res: Res) {
  const out = res.status(200)
  out.setHeader("Cache-Control", "no-store")
  out.json(humanMode({ secret: process.env.HUMAN_SECRET || process.env.DRIP_KEY, turnstileSecret: process.env.TURNSTILE_SECRET, turnstileSite: process.env.TURNSTILE_SITEKEY }))
}
