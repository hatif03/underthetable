import vocab from "../../data/vocab.json"
import districts from "../../data/districts.json"
import { nearState } from "./geo"
import { incidentWindow, isoWeek, kolkataDay } from "./week"

export const PAYLOAD_TEXT = '{"v":1}'
export const PAYLOAD_BYTES = new TextEncoder().encode(PAYLOAD_TEXT)

export type ReportKind = "demand" | "failure" | "absence" | "diversion" | "restriction"
export const KINDS: ReportKind[] = ["demand", "failure", "absence", "diversion", "restriction"]

export type ReportInput = {
  state: string
  district: string
  department: string
  role: string
  service: string
  outcome: string
  amountInr: number
  /** The incident date. Only used to compute the ISO week. It is never written to Arkiv. */
  day: string
  today?: string
  kind?: ReportKind
  /** Only the press curator writes this. A report from a news article, not from a citizen. */
  source?: "press"
  /** The exact place of a public-infrastructure problem. Never of a person, and never for a bribe or a rights report. */
  geo?: { lat: number; lon: number }
}

export type SealedReport = ReportInput & {
  project: "underthetable"
  type: "report"
  kind: ReportKind
  week: string
  amount_inr: bigint
  /** Degrees times 100,000, as whole numbers (about 1 m). Only when geo was given. */
  lat_e5?: number
  lon_e5?: number
}

const roles = vocab.roles as Record<string, string[]>
const services = vocab.services as Record<string, string[]>
const conditions = vocab.conditions as Record<string, Record<string, string[]>>
const DEMAND_OUTCOMES = ["asked", "paid", "refused"]
const CONDITION_OUTCOMES = ["noted", "worsened", "cleared"]

export function privateTextProblem(raw: string): string | null {
  const value = normalizeForScan(raw)
  if (value.includes("@") || value.includes("+91")) return "Leave out phone numbers and email addresses."
  if (/(?:\d[\s\-.()/]{0,2}){10,}/.test(value)) return "Leave out long numbers such as phone numbers."
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(value)) return "Leave out email addresses."
  return null
}

type Pattern = { re: RegExp; note: string }

const TITLES =
  "Mr|Mrs|Ms|Shri|Sri|Smt|Dr|Prof|SI|ASI|DSP|ACP|DCP|SP|IPS|Inspector|Sub-Inspector|Constable|Officer|Sir|Madam|mr|mrs|ms|shri|sri|smt|dr|inspector|constable|officer|sir|madam"
const NAME = "[A-Z][a-z]+(?:\\s+[A-Z][a-z]+)?"

// Order matters: specific shapes first so a phone is not read as a plain digit run.
const PRIVATE_PATTERNS: Pattern[] = [
  { re: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, note: "an email address" },
  { re: /\b\d{4}[\s-]\d{4}[\s-]\d{4}\b/g, note: "an Aadhaar number" },
  { re: /(?:\+91[\s-]?)?\b[6-9]\d{4}[\s-]?\d{5}\b/g, note: "a phone number" },
  { re: /(?:\d[\s\-.()/]{0,2}){10,}/g, note: "a long number" },
  { re: /\b[\w.-]{2,}\s*@\s*[a-z]{2,}\b/gi, note: "an email or UPI handle" },
  { re: /\b[\w.-]{2,}\s*[([]?\s*at\s*[)\]]?\s*[\w-]{2,}\s*[([]?\s*dot\s*[)\]]?\s*[a-z]{2,}\b/gi, note: "an email written out in words" },
  { re: /\b[A-Z]{2}[\s-]?\d{1,2}[\s-]?[A-Z]{1,3}[\s-]?\d{4}\b/g, note: "a vehicle number" },
  { re: /\b(?:fir|f\.i\.r\.?|case|crime)\s*(?:no\.?|number)?\s*#?\s*\d+(?:\/\d+)?\b/gi, note: "a case number" },
  { re: /\b(?:pin(?:code)?|zip)\s*:?\s*\d{6}\b/gi, note: "a PIN code" },
  { re: new RegExp(`\\b(?:${TITLES})\\.?\\s+${NAME}`, "g"), note: "a name" },
  { re: new RegExp(`\\b(?:[Mm]y name is|I am|named)\\s+${NAME}`, "g"), note: "a name" },
  { re: /(?:श्रीमान|श्रीमती|सुश्री|श्री|डॉ\.?)\s+[\p{L}\p{M}]+(?:\s+[\p{L}\p{M}]+)?/gu, note: "a name" },
  { re: /\b(?:room|ward|office|thana|shop|house|flat|plot)\s*(?:no\.?|number)?\s*#?\s*\d{1,6}\b/gi, note: "an office or house number" },
]

/**
 * The same text with every digit written as 0 to 9 (Devanagari, Arabic-Indic and full-width digits would
 * otherwise slip past a digit pattern), and with dates and clock times blanked so they are not read as a
 * long number. Positions are unchanged, so a hit in this text is a hit in the original.
 */
export function normalizeForScan(value: string): string {
  const ascii = value.replace(/[\u0660-\u0669\u06F0-\u06F9\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0BE6-\u0BEF\u0C66-\u0C6F\u0CE6-\u0CEF\u0D66-\u0D6F\uFF10-\uFF19]/g, (ch) => {
    const cp = ch.charCodeAt(0)
    // Arabic-Indic, Persian and full-width digits end in 0 to 9; the Indic scripts' digits run from ...66 to ...6F.
    const arabicOrFullWidth = cp <= 0x06f9 || cp >= 0xff10
    return String(arabicOrFullWidth ? cp & 0xf : (cp & 0xf) - 6)
  })
  return ascii
    .replace(/\b\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}\b/g, (m) => "_".repeat(m.length))
    .replace(/\b\d{1,2}:\d{2}(?::\d{2})?\b/g, (m) => "_".repeat(m.length))
}

/** What a sentence contains that must never be kept. The form uses this live to strike it out. */
export function findPrivate(input: string): { start: number; end: number; note: string }[] {
  const value = normalizeForScan(input)
  const hits: { start: number; end: number; note: string }[] = []
  for (const { re, note } of PRIVATE_PATTERNS) {
    for (const match of value.matchAll(new RegExp(re.source, re.flags))) {
      const start = match.index ?? 0
      const end = start + match[0].length
      if (!hits.some((hit) => start < hit.end && end > hit.start)) hits.push({ start, end, note })
    }
  }
  return hits.sort((a, b) => a.start - b.start)
}

export function redactText(value: string): { text: string; removed: string[] } {
  const hits = findPrivate(value)
  let text = value
  for (const hit of [...hits].reverse()) text = text.slice(0, hit.start) + " " + text.slice(hit.end)
  text = text.replace(/\s{2,}/g, " ").trim()
  return { text, removed: [...new Set(hits.map((hit) => hit.note))] }
}

export function assertPayload(bytes: Uint8Array): void {
  const text = new TextDecoder().decode(bytes)
  if (text !== PAYLOAD_TEXT) {
    throw new Error("The payload must be exactly {\"v\":1}.")
  }
}

export function sealReport(input: ReportInput): SealedReport {
  const today = input.today ?? kolkataDay()
  const fields = [
    input.state,
    input.district,
    input.department,
    input.role,
    input.service,
    input.outcome,
    input.day,
  ]
  for (const field of fields) {
    const problem = privateTextProblem(field)
    if (problem) throw new Error(problem)
  }

  const state = districts.states.find((item) => item.slug === input.state)
  if (!state) throw new Error("Pick a state from the list.")
  if (!state.districts.includes(input.district)) throw new Error("Pick a district from the list.")
  if (!vocab.departments.some((item) => item.slug === input.department)) {
    throw new Error("Pick a department from the list.")
  }
  const kind = input.kind ?? "demand"
  if (!KINDS.includes(kind)) throw new Error("Pick what kind of report this is.")
  if (kind === "demand") {
    if (!roles[input.department]?.includes(input.role)) throw new Error("Pick a role from the list.")
    if (!services[input.department]?.includes(input.service)) throw new Error("Pick a service from the list.")
    if (!DEMAND_OUTCOMES.includes(input.outcome)) throw new Error("Pick an outcome from the list.")
    if (!Number.isInteger(input.amountInr) || input.amountInr < 1 || input.amountInr > 10_000_000) {
      throw new Error("Enter a whole amount from 1 to 10000000 rupees.")
    }
  } else {
    if (input.role !== "public") throw new Error("This report uses the public role. It does not name a person.")
    if (!conditions[kind]?.[input.department]?.includes(input.service)) {
      throw new Error("Pick a service from the list.")
    }
    if (!CONDITION_OUTCOMES.includes(input.outcome)) throw new Error("Pick an outcome from the list.")
    if (!Number.isInteger(input.amountInr) || input.amountInr < 1 || input.amountInr > 5) {
      throw new Error("Enter a severity from 1 to 5.")
    }
  }
  const dateError = incidentWindow(input.day, today)
  if (dateError) throw new Error(dateError)

  if (input.source !== undefined && input.source !== "press") throw new Error("The source must be press, or left out.")
  let lat_e5: number | undefined
  let lon_e5: number | undefined
  if (input.geo) {
    const allowed = (vocab as { geoServices?: Record<string, string[]> }).geoServices ?? {}
    if (kind !== "failure" || !allowed[input.department]?.includes(input.service)) {
      throw new Error("A pin is only for a broken road, light, drain or pile of garbage. Bribes and rights reports stay at district level.")
    }
    const { lat, lon } = input.geo
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < 6 || lat > 38 || lon < 68 || lon > 98) throw new Error("That pin is not in India.")
    if (!nearState({ lat, lon }, input.state)) throw new Error("That pin is not in the state you chose. Move it, or change the district.")
    lat_e5 = Math.round(lat * 100_000)
    lon_e5 = Math.round(lon * 100_000)
  }
  assertPayload(PAYLOAD_BYTES)

  return {
    ...input,
    project: "underthetable",
    type: "report",
    kind,
    week: isoWeek(input.day),
    amount_inr: BigInt(input.amountInr),
    ...(lat_e5 !== undefined && lon_e5 !== undefined ? { lat_e5, lon_e5 } : {}),
  }
}
