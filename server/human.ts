import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto"

/**
 * "Is a person asking?" before a new browser key is funded, so a script cannot mint wallets for free.
 *
 * Two modes, chosen by the host's environment, and said plainly in the interface:
 *  - Cloudflare Turnstile, a real CAPTCHA, when TURNSTILE_SITEKEY and TURNSTILE_SECRET are set.
 *  - Otherwise a proof of work: the browser finds a number whose SHA-256 with a server-signed challenge starts
 *    with 16 zero bits (about a second in a browser). It prices a flood. It does not prove a person: a script can
 *    also do the work, it just cannot do it for free at scale.
 *
 * ponytail: the proof-of-work challenge is stateless (an HMAC over a timestamp); replay protection is an
 * in-memory set per instance. The faucet is also limited per address, per network address and per day.
 */
export const POW_BITS = 16
const WINDOW_MS = 5 * 60_000
const used = new Set<string>()

type Env = { secret?: string; turnstileSecret?: string; turnstileSite?: string }

function key(env: Env): string {
  return env.secret || "underthetable-dev-only"
}

function sign(env: Env, body: string): string {
  return createHmac("sha256", key(env)).update(body).digest("hex")
}

export function humanMode(env: Env): { mode: "turnstile"; sitekey: string } | { mode: "pow"; challenge: string; bits: number } {
  if (env.turnstileSecret && env.turnstileSite) return { mode: "turnstile", sitekey: env.turnstileSite }
  const body = `${Date.now()}.${randomBytes(8).toString("hex")}`
  return { mode: "pow", challenge: `${body}.${sign(env, body)}`, bits: POW_BITS }
}

function leadingZeroBits(digest: Buffer): number {
  let bits = 0
  for (const byte of digest) {
    if (byte === 0) {
      bits += 8
      continue
    }
    bits += Math.clz32(byte) - 24
    break
  }
  return bits
}

export type Proof = { mode?: string; challenge?: string; nonce?: string; token?: string }

export async function checkHuman(proof: Proof | undefined, env: Env, client: string): Promise<void> {
  if (env.turnstileSecret && env.turnstileSite) {
    if (!proof?.token) throw new Error("Prove you are a person first.")
    const form = new URLSearchParams({ secret: env.turnstileSecret, response: proof.token })
    if (client && client !== "unknown" && client !== "local") form.set("remoteip", client)
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form })
    const result = (await response.json().catch(() => ({}))) as { success?: boolean }
    if (!result.success) throw new Error("The human check failed. Reload and try again.")
    return
  }
  if (!proof?.challenge || typeof proof.nonce !== "string" || proof.nonce.length > 40) throw new Error("Prove you are a person first.")
  const parts = proof.challenge.split(".")
  if (parts.length !== 3) throw new Error("The human check is malformed. Reload and try again.")
  const [stamp, random, signature] = parts
  const expected = sign(env, `${stamp}.${random}`)
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) throw new Error("The human check was not issued here.")
  const age = Date.now() - Number(stamp)
  if (!Number.isFinite(age) || age < 0 || age > WINDOW_MS) throw new Error("The human check expired. Reload and try again.")
  if (used.has(proof.challenge)) throw new Error("That human check was already used.")
  const digest = createHash("sha256").update(`${proof.challenge}:${proof.nonce}`).digest()
  if (leadingZeroBits(digest) < POW_BITS) throw new Error("The human check was not solved.")
  used.add(proof.challenge)
  if (used.size > 2000) used.clear()
}
