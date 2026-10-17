import "./load-env.ts"
import { readFileSync, writeFileSync } from "node:fs"

/**
 * An independent second reader for press-sourced records. For each record it fetches the cited articles,
 * gives a language model the article text and the record's structured claim, and asks one narrow question:
 * does the article support this claim? It reads and prints. It writes nothing to Arkiv and decides nothing.
 *
 *   npm run ai:check -- --limit 8              the first 8 records
 *   npm run ai:check -- --id dl-w41-shutdown   one record
 *   npm run ai:check -- --out docs/ai-check.md also write the table to a file
 *
 * Why this and not a chatbot: the curator wallet is one party reading one article. A model with no stake in the
 * outcome, a different failure mode from ours, and the same fixed question is a cheap second reader. It can
 * disagree, and a disagreement is a reason for a person to look again. It cannot approve anything.
 * Needs IFM_API_KEY in .env. Articles behind paywalls or bot checks come back "unreadable", which is reported
 * as such, never as agreement.
 */
type Source = { outlet: string; url: string; title: string }
type PressRecord = { id: string; kind: string; state: string; district: string; department: string; service: string; outcome: string; amountInr: number; eventDate: string; sources: Source[]; note: string }

const args = process.argv.slice(2)
const flag = (name: string) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined)
const limit = Number(flag("--limit") ?? 5)
const only = flag("--id")
const out = flag("--out")
// Test the checker against a claim you know is wrong: --note "..." --severity 4 replaces what the record says.
const noteOverride = flag("--note")
const severityOverride = flag("--severity")

const key = process.env.IFM_API_KEY
if (!key) throw new Error("IFM_API_KEY is not set in .env. This check is optional; the rest of the project does not need it.")
const base = (process.env.IFM_BASE_URL || "https://api.ifm.ai/v1").replace(/\/$/, "")
const model = process.env.IFM_MODEL || "IFM/K2-Horizon-375B-A23B"

function plain(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
}

async function article(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (compatible; underthetable-ai-check)" }, signal: AbortSignal.timeout(20_000) })
    if (!res.ok) return null
    const text = plain(await res.text())
    return text.length > 400 ? text.slice(0, 14_000) : null
  } catch {
    return null
  }
}

type Verdict = { supported: "yes" | "partly" | "no"; problems: string[]; severity_view: number | null }

async function ask(record: PressRecord, text: string): Promise<Verdict> {
  const claim = {
    kind: record.kind,
    place: `${record.district}, ${record.state}`,
    desk: `${record.department} / ${record.service}`,
    outcome: record.outcome,
    [record.kind === "demand" ? "rupees_taken" : "severity_1_to_5"]: severityOverride ? Number(severityOverride) : record.amountInr,
    date: record.eventDate,
    summary: noteOverride ?? record.note,
  }
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: 0,
      max_tokens: 8000,
      response_format: { type: "json_object" },
      chat_template_kwargs: { reasoning_effort: "low" },
      messages: [
        {
          role: "system",
          content:
            "You check one claim against one news article. Use only the article text. Reply with one JSON object: " +
            '{"supported":"yes|partly|no","problems":[string],"severity_view":number|null}. ' +
            "supported=yes only if the place, the kind of incident, the date within two days, and every number in the summary appear in the article. " +
            "List each unsupported or contradicted detail in problems, quoting the summary's words. " +
            "severity_view is your own 1 to 5 reading (1 minor, 3 clearly reported local impact, 5 a death) or null for a rupee claim. " +
            "Do not use outside knowledge and do not repeat any person's name.",
        },
        { role: "user", content: `CLAIM:\n${JSON.stringify(claim)}\n\nARTICLE:\n${text}` },
      ],
    }),
    signal: AbortSignal.timeout(90_000),
  })
  if (!res.ok) throw new Error(`The model API answered ${res.status}`)
  const body = (await res.json()) as { choices?: { message?: { content?: string; reasoning?: string } }[] }
  const content = `${body.choices?.[0]?.message?.content ?? ""}`
  if (process.env.AI_DEBUG) console.error(JSON.stringify(body.choices?.[0]?.message).slice(0, 1500))
  const after = content.includes("</ifm|think>") ? content.slice(content.lastIndexOf("</ifm|think>") + 12) : content
  // The reply can echo the template before the answer, so take the last balanced object that parses and has "supported".
  const found: Verdict[] = []
  let depth = 0
  let start = -1
  let inString = false
  let escape = false
  for (let i = 0; i < after.length; i++) {
    const c = after[i]
    if (inString) {
      if (escape) escape = false
      else if (c === "\\") escape = true
      else if (c === '"') inString = false
      continue
    }
    if (c === '"') inString = true
    else if (c === "{") {
      if (depth++ === 0) start = i
    } else if (c === "}" && --depth === 0 && start !== -1) {
      try {
        const v = JSON.parse(after.slice(start, i + 1)) as Verdict
        if (v && ["yes", "partly", "no"].includes(v.supported)) found.push(v)
      } catch {
        // an echoed template is not JSON
      }
      start = -1
    }
  }
  const last = found[found.length - 1]
  if (!last) throw new Error("The model did not return a verdict")
  return last
}

const records = (JSON.parse(readFileSync("data/press-records.json", "utf8")) as PressRecord[]).filter((r) => (only ? r.id === only : true)).slice(only ? 0 : -limit)
const rows: string[] = ["| Record | Source | Model says | Problems it found | Its severity | Ours |", "| --- | --- | --- | --- | --- | --- |"]
for (const record of records) {
  for (const source of record.sources) {
    const text = await article(source.url)
    if (!text) {
      rows.push(`| ${record.id} | ${source.outlet} | unreadable | the page could not be fetched or had no article text | | ${record.kind === "demand" ? "₹" + record.amountInr : record.amountInr} |`)
      continue
    }
    try {
      const verdict = await ask(record, text)
      rows.push(`| ${record.id} | ${source.outlet} | ${verdict.supported} | ${(verdict.problems ?? []).join("; ").replace(/\|/g, "/") || "none"} | ${verdict.severity_view ?? ""} | ${record.kind === "demand" ? "₹" + record.amountInr : record.amountInr} |`)
    } catch (error) {
      rows.push(`| ${record.id} | ${source.outlet} | error | ${error instanceof Error ? error.message : String(error)} | | |`)
    }
  }
}
const table = rows.join("\n")
console.log(table)
if (out) writeFileSync(out, `# Independent reading of press records by a language model\n\nProduced by \`npm run ai:check\`. A model read each cited article and answered one question: does this article support this claim? It decides nothing and writes nothing to Arkiv. "Unreadable" means the page could not be fetched; it is never agreement.\n\n${table}\n`)
