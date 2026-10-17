import { useEffect, useMemo, useState } from "react"
import { BLOCK_MS, derive, type Derived } from "../lib/derive"
import { useStore, type Store } from "./store"

export type Live = { store: Store; d: Derived; head: bigint; now: number; ageSeconds: (block: bigint) => number }

/** The snapshot, derived once per read, plus a clock that ticks so "3 min ago" stays true. */
export function useLive(): Live {
  const store = useStore()
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 10_000)
    return () => window.clearInterval(timer)
  }, [])
  const board = store.board
  const d = useMemo(() => derive(board?.rows ?? [], board?.blockNumber ?? 0n, board?.savedAt ?? Date.now(), board?.attestations ?? [], store.showDemo), [board, store.showDemo])
  const head = board?.blockNumber ?? 0n
  const saved = board?.savedAt ?? now
  // Seconds since a block was mined. The head was current when the board was read.
  const ageSeconds = (block: bigint) => Math.max(0, (now - saved) / 1000 + (Number(head - block) * BLOCK_MS) / 1000)
  return { store, d, head, now, ageSeconds }
}
