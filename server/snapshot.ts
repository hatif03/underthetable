import { boardToJson } from "../src/lib/query.ts"
import { fetchReports } from "../src/lib/query.ts"

/**
 * One read of Arkiv for everybody. The public RPC allows about 100 queries an hour per caller, so a page
 * that every visitor loads on their own breaks the moment a few judges open it. This route reads once,
 * validates with the same code as the page and the CLI, and serves the answer from memory for a few minutes.
 * If Arkiv refuses, it serves the last good answer, marked stale. The page can bypass it ("read directly").
 * ponytail: per-instance memory. A cold instance reads again; put the body in a KV store if traffic needs it.
 */
const FRESH_MS = 300_000
let last: { at: number; body: string } | null = null
let inFlight: Promise<string> | null = null

async function read(rpc: string): Promise<string> {
  const board = await fetchReports({ light: true, fresh: true, rpc })
  return boardToJson(board)
}

export async function snapshot(rpc: string): Promise<{ status: number; body: string; stale: boolean }> {
  if (last && Date.now() - last.at < FRESH_MS) return { status: 200, body: last.body, stale: false }
  try {
    inFlight ??= read(rpc).finally(() => {
      inFlight = null
    })
    const body = await inFlight
    last = { at: Date.now(), body }
    return { status: 200, body, stale: false }
  } catch (error) {
    if (last) return { status: 200, body: last.body, stale: true }
    return { status: 503, body: JSON.stringify({ error: error instanceof Error ? error.message : "Arkiv could not be read." }), stale: false }
  }
}
