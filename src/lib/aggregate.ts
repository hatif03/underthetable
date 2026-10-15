export type ReportRow = {
  key: string
  creator: string
  owner: string
  createdAt: bigint
  expiresAt: bigint
  state: string
  district: string
  department: string
  role: string
  service: string
  outcome: string
  week: string
  /** Legacy. New reports do not write a day; it re-identifies a reporter. */
  day?: string
  amountInr: number
  kind?: string
  /** Set when a trusted attester wallet vouched that the writer was inside the report's state. */
  verified?: string
  /** "press" when a trusted curator wrote it from a published article. It is not a citizen voice. */
  source?: string
}

export type QuotedBucket = {
  state: string
  district: string
  department: string
  service: string
  week: string
  voices: number
  medianInr: number
  outcomes: Record<string, number>
  creators: string[]
  kind: string
}

export type Aggregate = {
  quoted: QuotedBucket[]
  unquoted: ReportRow[]
}

function bucketKey(row: ReportRow): string {
  return [row.kind ?? "demand", row.state, row.district, row.department, row.service, row.week].join("|")
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 1) return sorted[mid]
  return Math.round((sorted[mid - 1] + sorted[mid]) / 2)
}

/** One amount per creator: the earliest report. Quoted at three distinct creators. */
export function aggregate(rows: ReportRow[]): Aggregate {
  const groups = new Map<string, ReportRow[]>()
  for (const row of rows) {
    const key = bucketKey(row)
    const list = groups.get(key) ?? []
    list.push(row)
    groups.set(key, list)
  }

  const quoted: QuotedBucket[] = []
  const unquoted: ReportRow[] = []

  for (const list of groups.values()) {
    const byCreator = new Map<string, ReportRow>()
    for (const row of list) {
      const current = byCreator.get(row.creator)
      if (!current || row.createdAt < current.createdAt) byCreator.set(row.creator, row)
    }
    const voices = [...byCreator.values()].sort((a, b) => Number(a.createdAt - b.createdAt))
    if (voices.length >= 3) {
      const outcomes: Record<string, number> = {}
      for (const voice of voices) outcomes[voice.outcome] = (outcomes[voice.outcome] ?? 0) + 1
      const first = voices[0]
      quoted.push({
        state: first.state,
        district: first.district,
        department: first.department,
        service: first.service,
        week: first.week,
        voices: voices.length,
        medianInr: median(voices.map((voice) => voice.amountInr)),
        outcomes,
        creators: voices.map((voice) => voice.creator),
        kind: first.kind ?? "demand",
      })
    } else {
      unquoted.push(...voices)
    }
  }

  quoted.sort((a, b) => b.voices - a.voices || b.medianInr - a.medianInr)
  return { quoted, unquoted }
}

export const QUOTE_AT = 3
export const BURST_BLOCKS = 300 // about ten minutes at 2 s

export type Bucket = {
  id: string
  kind: string
  state: string
  district: string
  department: string
  service: string
  week: string
  /** Distinct `$creator` values. One wallet writing five times is one voice. */
  voices: number
  quoted: boolean
  /** Only set once quoted. Below that the figure is not a figure. */
  medianInr: number | null
  outcomes: Record<string, number>
  creators: string[]
  /** Voices with a location check. Three of them make a desk corroborated. */
  verifiedVoices: number
  corroborated: boolean
  /** Lowest and highest of the one amount per wallet. A median alone hides a wide spread. */
  min: number
  max: number
  /** Keys of voices more than four times above, or four times below, the median (rupee desks, once quoted). */
  outlierKeys: string[]
  /** Three or more wallets whose first reports landed within about ten minutes of each other. One event, or one person: it is shown, not hidden. */
  bursty: boolean
  /** The one amount per creator (the earliest), sorted by creation block. */
  voiceRows: ReportRow[]
}

/** Every bucket, quoted or not, so a reader can see "2 of 3 wallets". Same rule as aggregate(). */
export function buckets(rows: ReportRow[]): Bucket[] {
  const groups = new Map<string, ReportRow[]>()
  for (const row of rows) {
    const key = bucketKey(row)
    groups.set(key, [...(groups.get(key) ?? []), row])
  }
  const out: Bucket[] = []
  for (const [id, list] of groups) {
    const byCreator = new Map<string, ReportRow>()
    for (const row of list) {
      const current = byCreator.get(row.creator)
      if (!current || row.createdAt < current.createdAt) byCreator.set(row.creator, row)
    }
    const voiceRows = [...byCreator.values()].sort((a, b) => Number(a.createdAt - b.createdAt))
    const first = voiceRows[0]
    const outcomes: Record<string, number> = {}
    for (const voice of voiceRows) outcomes[voice.outcome] = (outcomes[voice.outcome] ?? 0) + 1
    const quoted = voiceRows.length >= QUOTE_AT
    const checked = new Set(list.filter((row) => row.verified).map((row) => row.creator))
    const verifiedVoices = voiceRows.filter((voice) => checked.has(voice.creator)).length
    const amounts = voiceRows.map((voice) => voice.amountInr)
    const mid = median(amounts)
    const isRupees = (first.kind ?? "demand") === "demand"
    const outlierKeys = quoted && isRupees ? voiceRows.filter((voice) => voice.amountInr > mid * 4 || voice.amountInr * 4 < mid).map((voice) => voice.key) : []
    const span = Number(voiceRows[voiceRows.length - 1].createdAt - voiceRows[0].createdAt)
    const bursty = voiceRows.length >= QUOTE_AT && span <= BURST_BLOCKS
    out.push({
      id,
      kind: first.kind ?? "demand",
      state: first.state,
      district: first.district,
      department: first.department,
      service: first.service,
      week: first.week,
      voices: voiceRows.length,
      quoted,
      medianInr: quoted ? median(voiceRows.map((voice) => voice.amountInr)) : null,
      outcomes,
      creators: voiceRows.map((voice) => voice.creator),
      verifiedVoices,
      corroborated: verifiedVoices >= QUOTE_AT,
      min: Math.min(...amounts),
      max: Math.max(...amounts),
      outlierKeys,
      bursty,
      voiceRows,
    })
  }
  return out.sort((a, b) => Number(b.quoted) - Number(a.quoted) || b.voices - a.voices)
}
