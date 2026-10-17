import districts from "../../data/districts.json"
import { buckets, type Bucket, type ReportRow } from "./aggregate"
import { isDemoWallet } from "./demo"
import type { Attestation } from "./query"
import { addDays, isoWeek, kolkataDay, previousWeek, weekStart } from "./week"

export const BLOCK_MS = 2000

export type Derived = {
  /** Every visible report that has not expired: citizens and press. */
  live: ReportRow[]
  /** Written from published news by a curator wallet. Never counted as a citizen voice. */
  press: ReportRow[]
  /** Reports with an exact place on the map. */
  pinned: ReportRow[]
  /** Desks that have one or two citizen wallets and are waiting for a third. */
  open: Bucket[]
  /** Synthetic rows from the team's own wallets that are currently hidden. */
  demoHidden: number
  verifiedCount: number
  /** Press reports that match a citizen desk (same kind, district and service, within a week). Key is the desk id. */
  deskPress: Map<string, ReportRow[]>
  /** For each press report, how many citizen wallets reported the same kind, district and service within a week. */
  pressCitizens: Map<string, number>
  expired: ReportRow[]
  desks: Bucket[]
  quoted: Bucket[]
  wallets: number
  districtCount: number
  byState: Map<string, { count: number; wallets: Set<string>; quoted: number }>
  byDistrict: Map<string, { state: string; count: number; quoted: number }>
  feed: ReportRow[]
  daily: { day: string; count: number }[]
  trend: Map<string, number | null>
  expiring: { row: ReportRow; secondsLeft: number }[]
}

/** The wall-clock time a block was mined, estimated from the head. Tiramisu blocks are 2 s. */
export function blockTime(block: bigint, head: bigint, now: number): number {
  return now - Number(head - block) * BLOCK_MS
}

export function derive(rows: ReportRow[], head: bigint, now: number, attestations: Attestation[] = [], showDemo = false): Derived {
  const vouched = new Map(attestations.map((item) => [item.report, item]))
  const checked = rows.map((row) => {
    const proof = vouched.get(row.key.toLowerCase())
    return proof && proof.state === row.state ? { ...row, verified: proof.scope } : row
  })
  const visible = checked.filter((row) => showDemo || !isDemoWallet(row.creator))
  const demoHidden = checked.filter((row) => row.expiresAt > head && !showDemo && isDemoWallet(row.creator)).length
  const live = visible.filter((row) => row.expiresAt > head)
  const press = live.filter((row) => row.source === "press")
  const citizens = live.filter((row) => row.source !== "press")
  const expired = visible.filter((row) => row.expiresAt <= head && row.expiresAt - row.createdAt <= 2_000n)
  const desks = buckets(citizens)
  const quoted = desks.filter((desk) => desk.quoted)

  const byState = new Map<string, { count: number; wallets: Set<string>; quoted: number }>()
  const byDistrict = new Map<string, { state: string; count: number; quoted: number }>()
  for (const row of live) {
    const state = byState.get(row.state) ?? { count: 0, wallets: new Set<string>(), quoted: 0 }
    state.count += 1
    state.wallets.add(row.creator)
    byState.set(row.state, state)
    const district = byDistrict.get(row.district) ?? { state: row.state, count: 0, quoted: 0 }
    district.count += 1
    byDistrict.set(row.district, district)
  }
  for (const bucket of quoted) {
    const state = byState.get(bucket.state)
    if (state) state.quoted += 1
    const district = byDistrict.get(bucket.district)
    if (district) district.quoted += 1
  }

  // An independent check: does a published report agree with what citizens filed for the same place and week?
  const near = (a: string, b: string) => Math.abs(Date.parse(weekStart(a)) - Date.parse(weekStart(b))) <= 7 * 86_400_000
  const deskPress = new Map<string, ReportRow[]>()
  const pressCitizens = new Map<string, number>()
  for (const item of press) {
    const matching = desks.filter((desk) => desk.kind === (item.kind ?? "demand") && desk.district === item.district && desk.service === item.service && near(desk.week, item.week))
    pressCitizens.set(item.key, matching.reduce((sum, desk) => sum + desk.voices, 0))
    for (const desk of matching) deskPress.set(desk.id, [...(deskPress.get(desk.id) ?? []), item])
  }

  const feed = [...live].sort((a, b) => Number(b.createdAt - a.createdAt))

  const today = kolkataDay(new Date(now))
  const days = Array.from({ length: 14 }, (_, index) => addDays(today, index - 13))
  const counts = new Map(days.map((day) => [day, 0]))
  for (const row of live) {
    const day = kolkataDay(new Date(blockTime(row.createdAt, head, now)))
    if (counts.has(day)) counts.set(day, (counts.get(day) ?? 0) + 1)
  }
  const daily = days.map((day) => ({ day, count: counts.get(day) ?? 0 }))

  const medians = new Map(quoted.map((bucket) => [bucket.id, bucket.medianInr as number]))
  const trend = new Map<string, number | null>()
  for (const bucket of quoted) {
    const before = medians.get(bucket.id.replace(/[^|]+$/, previousWeek(bucket.week)))
    trend.set(bucket.id, before === undefined ? null : (bucket.medianInr as number) - before)
  }

  const expiring = [...live]
    .sort((a, b) => Number(a.expiresAt - b.expiresAt))
    .slice(0, 4)
    .map((row) => ({ row, secondsLeft: Number(row.expiresAt - head) * (BLOCK_MS / 1000) }))

  return {
    live,
    press,
    pinned: live.filter((row) => row.lat !== undefined && row.lon !== undefined),
    open: desks.filter((desk) => !desk.quoted),
    demoHidden,
    verifiedCount: live.filter((row) => row.verified).length,
    deskPress,
    pressCitizens,
    expired,
    desks,
    quoted,
    wallets: new Set(citizens.map((row) => row.creator)).size,
    districtCount: byDistrict.size,
    byState,
    byDistrict,
    feed,
    daily,
    trend,
    expiring,
  }
}

export function stateLabel(slug: string): string {
  return districts.states.find((item) => item.slug === slug)?.label ?? slug
}

export function thisWeek(now: number): string {
  return isoWeek(kolkataDay(new Date(now)))
}

export function ago(seconds: number): string {
  if (seconds < 60) return "just now"
  if (seconds < 3600) return `${Math.round(seconds / 60)} min ago`
  if (seconds < 86_400) return `${Math.round(seconds / 3600)} h ago`
  return `${Math.round(seconds / 86_400)} d ago`
}

export function until(seconds: number): string {
  if (seconds <= 0) return "expired"
  if (seconds < 3600) return `${Math.max(1, Math.round(seconds / 60))} min left`
  if (seconds < 86_400) return `${Math.round(seconds / 3600)} h left`
  return `${Math.round(seconds / 86_400)} days left`
}
