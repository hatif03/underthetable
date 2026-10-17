import { useSyncExternalStore } from "react"
import type { ReportRow } from "../lib/aggregate"
import { makeSocketClient, sharedPublicClient } from "../lib/client"
import { boardFromJson, fetchReports, readCache, readError, toReportRow, type BoardLoad } from "../lib/query"

/**
 * One snapshot of every underthetable report still on Tiramisu. Every view reads it.
 * The anonymous RPC budget is about 100 queries an hour, so the page makes one read on load,
 * shows the last read at once, and refreshes at most every REFRESH_MS while the tab is open.
 */
export type Status = "loading" | "ready" | "refreshing" | "stale"

export type Store = {
  board: BoardLoad | null
  status: Status
  error: string | null
  live: "off" | "connecting" | "on"
  /** Keys that arrived over the socket since the page opened. Used to animate the feed. */
  fresh: Set<string>
  /** Show the team's synthetic rows. Off by default. */
  showDemo: boolean
  /** Read Arkiv from this browser instead of through the snapshot route. */
  direct: boolean
}

const FRESH_MS = 60_000
const REFRESH_MS = 120_000
const EVENT_GAP_MS = 5_000
const LIFETIME_BLOCKS = 7_776_000
function savedDemo(): boolean {
  try {
    return localStorage.getItem("utt:demo") === "1"
  } catch {
    return false
  }
}

let state: Store = { board: null, status: "loading", error: null, live: "off", fresh: new Set(), showDemo: savedDemo(), direct: savedDirect() }

function savedDirect(): boolean {
  try {
    return localStorage.getItem("utt:direct") === "1"
  } catch {
    return false
  }
}

export function setDirect(next: boolean) {
  try {
    localStorage.setItem("utt:direct", next ? "1" : "0")
  } catch {
    // the choice still holds for this tab
  }
  set({ direct: next })
  void refresh(true)
}

/** Our server's snapshot first (one shared read), then the browser's own read if that fails. */
async function load(): Promise<BoardLoad> {
  if (!state.direct) {
    try {
      const response = await fetch("/api/snapshot", { cache: "no-store" })
      if (response.ok) return boardFromJson(await response.text())
    } catch {
      // no snapshot route here (a plain static host), or it failed: read directly
    }
  }
  return fetchReports({ light: true, fresh: true })
}

export function setShowDemo(next: boolean) {
  try {
    localStorage.setItem("utt:demo", next ? "1" : "0")
  } catch {
    // the choice still holds for this tab
  }
  set({ showDemo: next })
}
const listeners = new Set<() => void>()
let started = false
let inFlight: Promise<void> | null = null

function set(next: Partial<Store>) {
  state = { ...state, ...next }
  for (const listener of listeners) listener()
}

export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useStore(): Store {
  return useSyncExternalStore(subscribe, () => state, () => state)
}

export async function refresh(force = false): Promise<void> {
  if (inFlight) return inFlight
  const age = state.board ? Date.now() - state.board.savedAt : Infinity
  if (!force && age < FRESH_MS) return
  set({ status: state.board ? "refreshing" : "loading" })
  inFlight = load()
    .then((board) => set({ board, status: "ready", error: null }))
    .catch((error: unknown) => set({ status: state.board ? "stale" : "loading", error: readError(error) }))
    .finally(() => {
      inFlight = null
    })
  return inFlight
}

/** Add one row the socket told us about, without a second full read. */
export function addRow(row: ReportRow) {
  const board = state.board
  if (!board || board.rows.some((item) => item.key === row.key)) return
  set({
    board: { ...board, rows: [...board.rows, { ...row, createdAt: row.createdAt || board.blockNumber }], fromCache: false },
    fresh: new Set([...state.fresh, row.key]),
  })
  window.setTimeout(() => {
    const next = new Set(state.fresh)
    next.delete(row.key)
    set({ fresh: next })
  }, FRESH_MS)
}

function watch() {
  const socket = makeSocketClient()
  const queue: string[] = []
  let draining = false
  async function drain() {
    if (draining) return
    draining = true
    while (queue.length > 0) {
      const key = queue.shift() as `0x${string}`
      try {
        const entity = await sharedPublicClient().getEntity(key)
        const project = entity.attributes?.project
        if (project && project.type === "str" && project.value === "underthetable") {
          const row = toReportRow(entity)
          if (row) addRow(row)
        }
      } catch {
        // one failed read must not stop the feed; the next refresh catches up
      }
      await new Promise((resolve) => setTimeout(resolve, EVENT_GAP_MS))
    }
    draining = false
  }
  set({ live: "connecting" })
  socket.watchEntityEvents({
    onEntityCreated: (event) => {
      // The chain is shared with every other team: about 0.8 creates a second when measured, and
      // a read costs budget. A report of ours is readonly, not extendable, and lives 180 days
      // (7,776,000 blocks of 2 s). Everything else is skipped before it costs a query.
      const flags = event.creationFlags
      if (!flags.readonly || flags.permissionlessExtension) return
      if (Math.abs(Number(event.expiresAt - event.blockNumber) - LIFETIME_BLOCKS) > 2_000) return
      if (queue.length < 8) queue.push(event.entityKey)
      void drain()
    },
    onError: () => set({ live: "off" }),
  })
  set({ live: "on" })
}

export function start() {
  if (started) return
  started = true
  const cached = readCache({}, Infinity)
  if (cached) set({ board: cached, status: "stale" })
  void refresh(true).then(() => {
    if (typeof WebSocket !== "undefined") {
      try {
        watch()
      } catch {
        set({ live: "off" })
      }
    }
  })
  window.setInterval(() => {
    if (document.visibilityState === "visible") void refresh()
  }, REFRESH_MS)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void refresh()
  })
}

export function reload(): Promise<void> {
  return refresh(true)
}
