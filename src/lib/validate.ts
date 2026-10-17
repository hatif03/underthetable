import districts from "../../data/districts.json"
import vocab from "../../data/vocab.json"
import type { Attributes } from "@arkiv-network/sdk"
import { DEAD } from "./client"
import { nearState } from "./geo"
import { KINDS } from "./guard"
import { addDays, kolkataDay, weekStart } from "./week"

/**
 * The one definition of a valid underthetable report. The guard in the browser stops our own page from
 * writing anything else, but a modified client can write whatever it likes to a public chain, and nobody
 * can delete it. So every reader (the page, the CLI, the audit) applies this before it counts or shows
 * a row. A row that fails is ignored, never displayed, never counted.
 */
export const REPORT_ATTRIBUTES = new Set(["project", "type", "state", "district", "department", "role", "service", "outcome", "kind", "week", "day", "amount_inr", "source", "lat_e5", "lon_e5"])
export const ATTESTATION_ATTRIBUTES = new Set(["project", "type", "report", "method", "scope", "state"])

const roles = vocab.roles as Record<string, string[]>
const services = vocab.services as Record<string, string[]>
const conditions = vocab.conditions as Record<string, Record<string, string[]>>
const DEMAND_OUTCOMES = ["asked", "paid", "refused"]
const CONDITION_OUTCOMES = ["noted", "worsened", "cleared"]

export type RawEntity = {
  key?: string
  creator?: string
  owner?: string
  createdAt?: bigint
  expiresAt?: bigint
  attributes?: Attributes
  payload?: Uint8Array
}

function text(attributes: Attributes, name: string): string | null {
  const cell = attributes[name]
  return cell && cell.type === "str" ? (cell.value as string) : null
}

function weekPlausible(week: string, today: string): boolean {
  if (!/^\d{4}-W(0[1-9]|[1-4]\d|5[0-3])$/.test(week)) return false
  const start = weekStart(week)
  return start <= today && start >= addDays(today, -400)
}

export function payloadProblem(payload: Uint8Array | undefined): string | null {
  if (!payload) return "no payload was read"
  return new TextDecoder().decode(payload) === '{"v":1}' ? null : "the payload is not exactly {\"v\":1}"
}

/** Returns null when the entity is a valid, sealed underthetable report, or the reason it is not. */
export function reportProblem(entity: RawEntity, today = kolkataDay()): string | null {
  const attributes = entity.attributes
  if (!attributes) return "no attributes"
  for (const name of Object.keys(attributes)) if (!REPORT_ATTRIBUTES.has(name)) return `an attribute outside the schema: ${name}`
  if (text(attributes, "project") !== "underthetable" || text(attributes, "type") !== "report") return "not an underthetable report"
  const payload = payloadProblem(entity.payload)
  if (payload) return payload
  if (!entity.owner || entity.owner.toLowerCase() !== DEAD.toLowerCase()) return "not sealed: the owner is not the dead address, so its writer could still delete it"

  const state = districts.states.find((item) => item.slug === text(attributes, "state"))
  if (!state) return "a state that is not on the list"
  const district = text(attributes, "district")
  if (!district || !state.districts.includes(district)) return "a district that is not on the list for that state"
  const department = text(attributes, "department")
  if (!department || !vocab.departments.some((item) => item.slug === department)) return "a department that is not on the list"
  const kind = text(attributes, "kind") ?? "demand"
  if (!KINDS.includes(kind as never)) return "a kind that is not on the list"
  const role = text(attributes, "role")
  const service = text(attributes, "service")
  const outcome = text(attributes, "outcome")
  if (!role || !service || !outcome) return "a missing role, service or outcome"
  const amount = attributes.amount_inr
  if (!amount || amount.type !== "u64") return "an amount that is not a u64"
  const figure = Number(amount.value)
  if (kind === "demand") {
    if (!roles[department]?.includes(role)) return "a role that is not on the list for that department"
    if (!services[department]?.includes(service)) return "a service that is not on the list for that department"
    if (!DEMAND_OUTCOMES.includes(outcome)) return "an outcome that is not on the list"
    if (!Number.isSafeInteger(figure) || figure < 1 || figure > 10_000_000) return "an amount outside 1 to 10,000,000 rupees"
  } else {
    if (role !== "public") return "a role other than public on a condition report"
    if (!conditions[kind]?.[department]?.includes(service)) return "a service that is not on the list for that kind"
    if (!CONDITION_OUTCOMES.includes(outcome)) return "an outcome that is not on the list"
    if (!Number.isSafeInteger(figure) || figure < 1 || figure > 5) return "a severity outside 1 to 5"
  }
  const week = text(attributes, "week")
  if (!week || !weekPlausible(week, today)) return "a week that is malformed, in the future, or more than a year old"
  const day = attributes.day
  if (day !== undefined && (day.type !== "str" || !/^\d{4}-\d{2}-\d{2}$/.test(day.value as string))) return "a malformed legacy day"
  const lat = attributes.lat_e5
  const lon = attributes.lon_e5
  if (lat !== undefined || lon !== undefined) {
    if (!lat || !lon || lat.type !== "i32" || lon.type !== "i32") return "a pin that is not two i32 numbers"
    const geoServices = (vocab as { geoServices?: Record<string, string[]> }).geoServices ?? {}
    if (kind !== "failure" || !geoServices[department]?.includes(service)) return "a pin on something that is not public infrastructure"
    const [la, lo] = [Number(lat.value) / 100_000, Number(lon.value) / 100_000]
    if (la < 6 || la > 38 || lo < 68 || lo > 98) return "a pin outside India"
    if (!nearState({ lat: la, lon: lo }, state.slug)) return "a pin that is not in its state"
  }
  const source = attributes.source
  if (source !== undefined && !(source.type === "str" && source.value === "press")) return "a source other than press"
  return null
}

/** Returns null when the entity is a valid, sealed attestation, or the reason it is not. */
export function attestationProblem(entity: RawEntity): string | null {
  const attributes = entity.attributes
  if (!attributes) return "no attributes"
  for (const name of Object.keys(attributes)) if (!ATTESTATION_ATTRIBUTES.has(name)) return `an attribute outside the schema: ${name}`
  if (text(attributes, "project") !== "underthetable" || text(attributes, "type") !== "attestation") return "not an underthetable attestation"
  const payload = payloadProblem(entity.payload)
  if (payload) return payload
  if (!entity.owner || entity.owner.toLowerCase() !== DEAD.toLowerCase()) return "not sealed"
  const report = attributes.report
  if (!report || report.type !== "key" || !/^0x[0-9a-fA-F]{64}$/.test(String(report.value))) return "a report reference that is not a key"
  if (text(attributes, "method") !== "geo" || text(attributes, "scope") !== "state") return "a method or scope that is not geo and state"
  if (!districts.states.some((item) => item.slug === text(attributes, "state"))) return "a state that is not on the list"
  return null
}
