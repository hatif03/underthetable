import { privateTextProblem, redactText, sealReport, type ReportInput, type ReportKind } from "../src/lib/guard.ts"
import { kolkataDay } from "../src/lib/week.ts"
import vocab from "../data/vocab.json"
import districts from "../data/districts.json"

export const IFM_MODEL = "IFM/K2-Horizon-375B-A23B"

function ifmUrl(): string {
  const base = (process.env.IFM_BASE_URL || "https://api.ifm.ai/v1").replace(/\/$/, "")
  return `${base}/chat/completions`
}

function jsonObjects(content: string): Partial<ReportInput>[] {
  const marker = "</ifm|think>"
  const after = content.includes(marker) ? content.slice(content.lastIndexOf(marker) + marker.length) : content
  const found: Partial<ReportInput>[] = []
  let depth = 0
  let start = -1
  let inString = false
  let escape = false
  for (let index = 0; index < after.length; index += 1) {
    const char = after[index]
    if (inString) {
      if (escape) escape = false
      else if (char === "\\") escape = true
      else if (char === "\"") inString = false
      continue
    }
    if (char === "\"") inString = true
    else if (char === "{") {
      if (depth === 0) start = index
      depth += 1
    } else if (char === "}") {
      depth -= 1
      if (depth === 0 && start !== -1) {
        try {
          found.push(JSON.parse(after.slice(start, index + 1)) as Partial<ReportInput>)
        } catch {
          // A later object may still be the slip.
        }
        start = -1
      }
    }
  }
  return found
}

function readJsonObject(content: string): Partial<ReportInput> {
  const objects = jsonObjects(content)
  const slip = [...objects].reverse().find((item) => item.state || item.district || item.amountInr || item.department)
  if (!slip) throw new Error("That didn't match the lists. Pick the fields yourself.")
  return slip
}

function asSlug(value: string): string {
  return value.trim().toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")
}

function closestSlug(value: string, allowed: string[]): string {
  const slug = asSlug(value)
  if (!slug) return ""
  if (allowed.includes(slug)) return slug
  const hits = allowed.filter((item) => item.includes(slug) || slug.includes(item))
  return hits.length === 1 ? hits[0] : slug
}

function matchState(value: string): string {
  const slug = asSlug(value)
  const exact = districts.states.find((item) => item.slug === slug || asSlug(item.label) === slug)
  if (exact) return exact.slug
  return closestSlug(value, districts.states.map((item) => item.slug))
}

export async function suggestSlip(text: string, apiKey: string): Promise<ReportInput> {
  const cleaned = redactText(text)
  text = cleaned.text
  const problem = privateTextProblem(text)
  if (problem) throw new Error(problem)
  const trimmed = text.trim()
  if (trimmed.length < 8) throw new Error("Say a little more about the place, the desk, and the amount.")
  if (trimmed.length > 500) throw new Error("Keep it to a few sentences. Names and phone numbers are not needed.")

  const today = kolkataDay()
  let parsed: Partial<ReportInput> | null = null
  for (let attempt = 0; attempt < 2 && !parsed; attempt += 1) {
    const response = await fetch(ifmUrl(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.IFM_MODEL || IFM_MODEL,
        temperature: 0,
        max_tokens: 900,
        response_format: { type: "json_object" },
        chat_template_kwargs: { reasoning_effort: "low" },
        messages: [
          {
            role: "system",
            content:
              "Reply with one JSON object and no explanation. Use only slugs from the lists. " +
              "Do not repeat any name, phone number, or office. " +
              `Today in Asia/Kolkata is ${today}. If no date is given, use that day. ` +
              "kind is demand, failure, absence, or diversion. A demand uses outcome asked, paid, or refused, and amountInr is rupees. " +
              "The other kinds use role public, outcome noted, worsened, or cleared, and amountInr is a severity from 1 to 5. " +
              "Keys: kind, state, district, department, role, service, outcome, amountInr, day.",
          },
          {
            role: "user",
            content: `${JSON.stringify({ states: districts.states, departments: vocab.departments, roles: vocab.roles, services: vocab.services, conditions: vocab.conditions, outcomes: vocab.outcomes })}\n\n${trimmed}`,
          },
        ],
      }),
      signal: AbortSignal.timeout(40_000),
    })
    if (!response.ok) throw new Error("The form assistant is not answering right now. You can fill the slip yourself.")
    const body = (await response.json()) as {
      choices?: { message?: { content?: string; reasoning?: string } }[]
    }
    const message = body.choices?.[0]?.message
    const content = `${message?.content ?? ""}\n${message?.reasoning ?? ""}`
    try {
      parsed = readJsonObject(content)
    } catch {
      parsed = null
    }
  }
  if (!parsed) throw new Error("That didn't match the lists. Pick the fields yourself.")
  const departments = vocab.departments.map((item) => item.slug)
  const department = closestSlug(String(parsed.department ?? ""), departments)
  const kind = closestSlug(String(parsed.kind ?? "demand"), ["demand", "failure", "absence", "diversion"]) as ReportKind
  const serviceList = kind === "demand"
    ? (vocab.services as Record<string, string[]>)[department] ?? []
    : (vocab.conditions as Record<string, Record<string, string[]>>)[kind]?.[department] ?? []
  const roleList = kind === "demand" ? (vocab.roles as Record<string, string[]>)[department] ?? [] : ["public"]
  const outcomeList = kind === "demand" ? ["asked", "paid", "refused"] : ["noted", "worsened", "cleared"]
  const stateSlug = matchState(String(parsed.state ?? ""))
  const state = districts.states.find((item) => item.slug === stateSlug)
  return sealReport({
    state: stateSlug,
    district: closestSlug(String(parsed.district ?? ""), state?.districts ?? []),
    department,
    role: closestSlug(String(parsed.role ?? ""), roleList),
    service: closestSlug(String(parsed.service ?? ""), serviceList),
    outcome: closestSlug(String(parsed.outcome ?? ""), outcomeList),
    amountInr: Number(parsed.amountInr),
    day: String(parsed.day ?? today),
    today,
    kind,
  })
}
