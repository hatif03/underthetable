import type { Hex } from "viem"

const VALID = /^0x[0-9a-fA-F]{64}$/

/**
 * The server wallets for one job, from NAME, NAME_2, NAME_3 and so on. More than one wallet spreads the load: a wallet
 * can only have one transaction in flight without a nonce collision, so each wallet is also used one at a time.
 */
export function keysFrom(env: Record<string, string | undefined>, name: string): Hex[] {
  const found: Hex[] = []
  for (const variable of [name, ...Array.from({ length: 8 }, (_, index) => `${name}_${index + 2}`)]) {
    const value = env[variable]
    if (value && VALID.test(value) && !found.includes(value as Hex)) found.push(value as Hex)
  }
  return found
}

const lanes = new Map<string, Promise<unknown>>()

/** Runs jobs for one wallet strictly one after another, within this server instance. */
export function inLane<T>(wallet: string, job: () => Promise<T>): Promise<T> {
  const run = (lanes.get(wallet) ?? Promise.resolve()).then(job, job)
  lanes.set(wallet, run.catch(() => undefined))
  return run
}

/** Wallets in a random order, so load spreads and a failing one does not always go first. */
export function shuffled<T>(items: T[]): T[] {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[other]] = [copy[other], copy[index]]
  }
  return copy
}

/** Errors that mean "try another wallet": a nonce collision, a stuck transaction or an empty wallet. */
export function walletBusy(error: unknown): boolean {
  return /nonce|underpriced|replacement|insufficient|already known/i.test(error instanceof Error ? error.message : String(error))
}
