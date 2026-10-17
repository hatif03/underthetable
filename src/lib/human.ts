import { leadingZeroBits, sha256 } from "./sha256"

export type HumanProof = { mode: "pow"; challenge: string; nonce: string } | { mode: "turnstile"; token: string }

type Mode = { mode: "turnstile"; sitekey: string } | { mode: "pow"; challenge: string; bits: number }

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: { sitekey: string; callback: (token: string) => void; "error-callback"?: () => void; theme?: string }) => string
      remove?: (id: string) => void
    }
  }
}

function loadTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("The human check could not load. Check your connection."))
    document.head.append(script)
  })
}

/** Work until a number is found, giving the page back to the browser every few thousand tries. */
async function work(challenge: string, bits: number): Promise<string> {
  const encoder = new TextEncoder()
  for (let nonce = 0; ; nonce++) {
    if (leadingZeroBits(sha256(encoder.encode(`${challenge}:${nonce}`))) >= bits) return String(nonce)
    if (nonce % 4000 === 3999) await new Promise((resolve) => setTimeout(resolve))
  }
}

/**
 * Asks the server how it wants a person proven, and proves it. With Turnstile configured the visitor sees
 * Cloudflare's widget in the slot. Without it the browser does a second of proof of work and says so.
 */
export async function proveHuman(slot: HTMLElement | null): Promise<HumanProof & { label: string }> {
  const response = await fetch("/api/human", { cache: "no-store" }).catch(() => null)
  if (!response || !response.ok) throw new Error("The human check is not available here. Connect a wallet that holds test GLM instead.")
  const mode = (await response.json()) as Mode
  if (mode.mode === "turnstile") {
    if (!slot) throw new Error("The human check has nowhere to show.")
    await loadTurnstile()
    const token = await new Promise<string>((resolve, reject) => {
      slot.hidden = false
      window.turnstile?.render(slot, { sitekey: mode.sitekey, callback: resolve, "error-callback": () => reject(new Error("The human check failed.")) })
    })
    slot.hidden = true
    return { mode: "turnstile", token, label: "Cloudflare Turnstile" }
  }
  const nonce = await work(mode.challenge, mode.bits)
  return { mode: "pow", challenge: mode.challenge, nonce, label: "proof of work" }
}
