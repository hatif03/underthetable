import districts from "../../data/districts.json"
import vocab from "../../data/vocab.json"
import type { ReportKind } from "./guard"

/** Fills the slip from a sentence, on the device. Nothing here touches the network. */
export type Guess = {
  kind?: ReportKind
  state?: string
  district?: string
  department?: string
  service?: string
  outcome?: string
  amountInr?: number
  weeksAgo?: number
}

type Rule = { re: RegExp; kind: ReportKind; department: string; service: string }

// Most specific first. The first rule that matches decides kind, department and service.
const RULES: Rule[] = [
  { re: /internet.*(shut|suspend|snapp?ed|cut|down|ban)|(shut|suspend|cut).*(internet|mobile data|broadband)|no (mobile )?(internet|data)/, kind: "restriction", department: "administration", service: "internet_shutdown" },
  { re: /(website|site|account|app|channel|handle)s?.*(blocked|withheld|banned|taken down)|(blocked|banned).*(website|account|channel)/, kind: "restriction", department: "administration", service: "content_blocked" },
  { re: /demolish|demolition|bulldoz/, kind: "restriction", department: "administration", service: "demolition_without_notice" },
  { re: /evict/, kind: "restriction", department: "administration", service: "forced_eviction" },
  { re: /custody|custodial|lock-?up.*(beat|tortur|hit)|(beat|tortur).*(lock-?up|police station)/, kind: "restriction", department: "police", service: "custodial_violence" },
  { re: /journalist|reporter|press (card|person)/, kind: "restriction", department: "police", service: "journalist_detained_or_attacked" },
  { re: /permission.*(denied|refused|rejected|not (given|granted))|(denied|refused|rejected).*permission/, kind: "restriction", department: "police", service: "assembly_permission_denied" },
  { re: /section 144|section 163|ban on (gatherings|assembly)|more than (five|5) people|gatherings? (banned|prohibited)/, kind: "restriction", department: "police", service: "gathering_ban_order" },
  { re: /barricad|metro (stations? )?(was |were )?closed|roads? (was |were )?(blocked|closed)/, kind: "restriction", department: "police", service: "barricades_or_closures" },
  { re: /lathi|tear ?gas|pellet|baton|water ?cannon|force.*(protest|march|rally|crowd)/, kind: "restriction", department: "police", service: "force_at_gathering" },
  { re: /detained|detention|picked up.*(protest|march|rally)/, kind: "restriction", department: "police", service: "detention_without_notice" },
  { re: /fir.*(not|refus|wouldn|won't|did ?n.t)|(refus|wouldn|won't).*\bfir\b/, kind: "restriction", department: "police", service: "fir_not_registered" },
  { re: /pothole/, kind: "failure", department: "municipal", service: "pothole" },
  { re: /street ?light/, kind: "failure", department: "municipal", service: "streetlight" },
  { re: /open drain|drain/, kind: "failure", department: "municipal", service: "open_drain" },
  { re: /garbage|waste pile|rubbish/, kind: "failure", department: "municipal", service: "garbage_pile" },
  { re: /broken road|road.*(damaged|broken)/, kind: "failure", department: "municipal", service: "broken_road" },
  { re: /water supply|no water|tap.*dry/, kind: "failure", department: "municipal", service: "water_supply" },
  { re: /power cut|no (power|electricity)|load ?shedding/, kind: "failure", department: "electricity", service: "power_cut" },
  { re: /medicine.*(short|less|partial)|(short|less).*medicine/, kind: "diversion", department: "health", service: "medicine_short" },
  { re: /no medicine|medicine.*(missing|out of stock|not available)/, kind: "absence", department: "health", service: "medicine_missing" },
  { re: /doctor.*(absent|not there|missing)|no doctor/, kind: "absence", department: "health", service: "doctor_absent" },
  { re: /teacher.*(absent|not there)|no teacher/, kind: "absence", department: "school", service: "teacher_absent" },
  { re: /(meal|mid.?day).*(short|less)/, kind: "diversion", department: "school", service: "meal_short" },
  { re: /(meal|mid.?day).*(missing|not (served|given))/, kind: "absence", department: "school", service: "meal_missing" },
  { re: /(grain|rice|wheat|ration).*(short|less|underweight|cut)|short.*(grain|ration)/, kind: "diversion", department: "ration", service: "grain_short" },
  { re: /fuel|kerosene/, kind: "diversion", department: "ration", service: "fuel_short" },
  { re: /ration shop.*(closed|shut)|shop closed/, kind: "absence", department: "ration", service: "shop_closed" },
  { re: /counter.*(closed|empty)|nobody at the counter/, kind: "absence", department: "municipal", service: "counter_closed" },
  { re: /driving licen[cs]e|\bdl\b|learner/, kind: "demand", department: "rto", service: "driving_licence" },
  { re: /vehicle registration|registration certificate|\brc\b/, kind: "demand", department: "rto", service: "vehicle_registration" },
  { re: /fitness certificate/, kind: "demand", department: "rto", service: "fitness_certificate" },
  { re: /\brto\b/, kind: "demand", department: "rto", service: "driving_licence" },
  { re: /challan|traffic (stop|police)|stopped (me|my)/, kind: "demand", department: "police", service: "traffic_stop" },
  { re: /\bnoc\b/, kind: "demand", department: "police", service: "noc" },
  { re: /police verification/, kind: "demand", department: "passport", service: "police_verification" },
  { re: /passport/, kind: "demand", department: "passport", service: "fresh_passport" },
  { re: /\bfir\b|police station|thana/, kind: "demand", department: "police", service: "fir_registration" },
  { re: /mutation|7\/12|land record|patwari|tehsil/, kind: "demand", department: "revenue", service: "mutation" },
  { re: /caste certificate/, kind: "demand", department: "revenue", service: "caste_certificate" },
  { re: /income certificate/, kind: "demand", department: "revenue", service: "income_certificate" },
  { re: /birth certificate/, kind: "demand", department: "municipal", service: "birth_certificate" },
  { re: /trade licen[cs]e/, kind: "demand", department: "municipal", service: "trade_licence" },
  { re: /building plan|map sanction/, kind: "demand", department: "municipal", service: "building_plan" },
  { re: /name transfer/, kind: "demand", department: "electricity", service: "name_transfer" },
  { re: /new connection|meter|lineman|electricity/, kind: "demand", department: "electricity", service: "new_connection" },
  { re: /\bgst\b.*refund|refund.*\bgst\b/, kind: "demand", department: "gst", service: "refund" },
  { re: /\bgst\b/, kind: "demand", department: "gst", service: "registration" },
  { re: /\bpan\b/, kind: "demand", department: "income_tax", service: "pan" },
  { re: /income tax|\bitr\b|tax refund/, kind: "demand", department: "income_tax", service: "refund" },
  { re: /food (licen[cs]e|safety)|\bfda\b/, kind: "demand", department: "fda", service: "licence" },
]

const ALIASES: Record<string, string> = {
  bangalore: "bengaluru_urban",
  bengaluru: "bengaluru_urban",
  bombay: "mumbai",
  calcutta: "kolkata",
  madras: "chennai",
  delhi: "new_delhi",
  gurgaon: "gurugram",
  vizag: "visakhapatnam",
}

const places = districts.states.flatMap((state) =>
  state.districts.map((slug) => ({ state: state.slug, slug, name: slug.replaceAll("_", " ") })),
)

function findPlace(text: string): { state: string; district: string } | null {
  let best: { state: string; district: string; length: number } | null = null
  const candidates = [
    ...places.map((place) => ({ ...place, word: place.name })),
    ...Object.entries(ALIASES).flatMap(([word, slug]) => {
      const place = places.find((item) => item.slug === slug)
      return place ? [{ ...place, word }] : []
    }),
  ]
  for (const candidate of candidates) {
    if (new RegExp(`\\b${candidate.word}\\b`).test(text) && (!best || candidate.word.length > best.length)) {
      best = { state: candidate.state, district: candidate.slug, length: candidate.word.length }
    }
  }
  return best ? { state: best.state, district: best.district } : null
}

function findAmount(text: string): number | undefined {
  const marked =
    /(?:₹|rs\.?|inr|rupees?)\s*(\d[\d,]*(?:\.\d+)?)\s*(k|thousand|lakh)?/.exec(text) ??
    /(\d[\d,]*)\s*(k|thousand|lakh)?\s*(?:₹|rs\b\.?|inr|rupees?)/.exec(text) ??
    /\b(?:asked|demanded|wanted|paid|bribe of|bribe)\s+(?:for\s+)?(\d[\d,]*)\s*(k|thousand|lakh)?\b/.exec(text)
  if (!marked) return undefined
  let value = Number(marked[1].replaceAll(",", ""))
  if (marked[2] === "k" || marked[2] === "thousand") value *= 1000
  if (marked[2] === "lakh") value *= 100_000
  return Number.isFinite(value) && value >= 1 && value <= 10_000_000 ? Math.round(value) : undefined
}

function findSeverity(text: string): number | undefined {
  const digit = /severity\s*([1-5])\b/.exec(text)
  if (digit) return Number(digit[1])
  if (/\b(very (bad|serious)|severe|terrible|dangerous|deadly|worst)\b/.test(text)) return 5
  if (/\b(bad|serious|badly)\b/.test(text)) return 4
  if (/\b(small|minor|slight)\b/.test(text)) return 2
  return undefined
}

function findWeeksAgo(text: string): number | undefined {
  if (/\blast week\b/.test(text)) return 1
  const ago = /\b(\d{1,2}|two|three|four)\s+weeks?\s+ago\b/.exec(text)
  if (ago) {
    const words: Record<string, number> = { two: 2, three: 3, four: 4 }
    return words[ago[1]] ?? Number(ago[1])
  }
  if (/\b(today|yesterday|this week|this morning|tonight)\b/.test(text)) return 0
  return undefined
}

export function guess(sentence: string): Guess {
  const text = sentence.toLowerCase()
  const out: Guess = {}
  const rule = RULES.find((item) => item.re.test(text))
  if (rule) {
    out.kind = rule.kind
    out.department = rule.department
    out.service = rule.service
  }
  const place = findPlace(text)
  if (place) {
    out.state = place.state
    out.district = place.district
  }
  const kind = out.kind ?? "demand"
  if (kind === "demand") {
    out.amountInr = findAmount(text)
    if (/\b(refus|said no|did ?n.t pay|did not pay|didn.t give)\w*/.test(text) && /\b(i|we) (refused|said no)\b/.test(text)) out.outcome = "refused"
    else if (/\b(paid|gave|had to pay|handed)\b/.test(text) && !/\b(did ?n.t|did not|never|not) (pay|paid|give)\b/.test(text)) out.outcome = "paid"
    else if (/\b(asked|demanded|wanted|expect)/.test(text)) out.outcome = "asked"
  } else {
    out.amountInr = findSeverity(text)
    if (/\b(worse|worsened|getting worse)\b/.test(text)) out.outcome = "worsened"
    else if (/\b(fixed|repaired|resolved|cleared|reopened|back now)\b/.test(text)) out.outcome = "cleared"
    else out.outcome = "noted"
  }
  out.weeksAgo = findWeeksAgo(text)
  return out
}

/** A slip's choices for a kind, from the closed lists. */
export function servicesFor(kind: string, department: string): string[] {
  const services = vocab.services as Record<string, string[]>
  const conditions = vocab.conditions as Record<string, Record<string, string[]>>
  return kind === "demand" ? (services[department] ?? []) : (conditions[kind]?.[department] ?? [])
}

export function departmentsFor(kind: string) {
  return vocab.departments.filter((item) => servicesFor(kind, item.slug).length > 0)
}

export function rolesFor(kind: string, department: string): string[] {
  const roles = vocab.roles as Record<string, string[]>
  return kind === "demand" ? (roles[department] ?? []) : ["public"]
}
