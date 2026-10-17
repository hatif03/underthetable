import { ExternalLink, RefreshCw } from "lucide-react"
import { useState } from "react"
import vocab from "../../data/vocab.json"
import { entityUrl } from "../lib/client"
import { isDemoWallet } from "../lib/demo"
import { ago, stateLabel } from "../lib/derive"
import { measure, shortAddress } from "../lib/format"
import { departmentLabel, labelize } from "../lib/labels"
import { fetchReports } from "../lib/query"
import { derive } from "../lib/derive"
import { reload } from "../state/store"
import type { Live } from "../state/useDerived"
import { DistrictPicker } from "../ui/DistrictPicker"
import { Badge, Checked, Pick, Seg } from "../ui/kit"
import { PressBadge } from "../ui/Press"
import { kindMeta, KIND_META, OUTCOME_LABEL } from "../ui/meta"

/** Every report still on Tiramisu, from the same snapshot as the Pulse. No second read. */
export function Record({ live, onDistrict }: { live: Live; onDistrict: (district: string) => void }) {
  const [district, setDistrict] = useState("")
  const [department, setDepartment] = useState("all")
  const [kind, setKind] = useState("all")
  const [asOf, setAsOf] = useState("now")
  const [then, setThen] = useState<{ block: bigint; count: number; stillThere: number; error?: string } | null>(null)
  const [reading, setReading] = useState(false)

  // Because a sealed entity cannot be edited, the board at an earlier block is a subset of the board now.
  // This asks Arkiv for the board at that block (a historical query) and checks that claim against today.
  async function travel(next: string) {
    setAsOf(next)
    if (next === "now") return setThen(null)
    const hours = Number(next)
    setReading(true)
    try {
      const block = live.head - BigInt(Math.round((hours * 3600) / 2))
      const board = await fetchReports({ light: true, fresh: true, atBlock: block > 0n ? block : 1n })
      const past = derive(board.rows, board.blockNumber, Date.now(), board.attestations, true).live
      // Compare with every row the chain returns now, demo rows included, whatever the page is hiding.
      const now = new Set((live.store.board?.rows ?? []).filter((row) => row.expiresAt > live.head).map((row) => row.key))
      setThen({ block: board.blockNumber, count: past.length, stillThere: past.filter((row) => now.has(row.key)).length })
    } catch (error) {
      setThen({ block: 0n, count: 0, stillThere: 0, error: error instanceof Error ? error.message : String(error) })
    } finally {
      setReading(false)
    }
  }
  const rows = live.d.live.filter(
    (row) => (!district || row.district === district) && (department === "all" || row.department === department) && (kind === "all" || (row.kind ?? "demand") === kind),
  )
  const weeks = [...new Set(rows.map((row) => row.week))].sort().reverse()
  return (
    <div className="stack">
      <header className="section-head">
        <h2>The record</h2>
        <p className="muted small">
          Every report still on Tiramisu: {live.d.live.length} now. A report leaves this list when its Entity Expiration passes. Nothing here can be edited.
        </p>
      </header>
      <section className="card filters">
        <DistrictPicker value={district} allowAll onChange={(_state, next) => setDistrict(next)} />
        <Pick
          label="Department"
          value={department}
          onChange={setDepartment}
          options={[{ value: "all", label: "All departments" }, ...vocab.departments.map((item) => ({ value: item.slug, label: item.label }))]}
        />
        <Seg label="Kind" value={kind} onChange={setKind} options={[{ value: "all", label: "All" }, ...Object.entries(KIND_META).map(([value, meta]) => ({ value, label: meta.label }))]} />
        <button type="button" className="btn ghost" onClick={() => void reload()} disabled={live.store.status === "refreshing"}>
          <RefreshCw size={14} /> {live.store.status === "refreshing" ? "Reading" : "Read again"}
        </button>
      </section>
      <section className="card">
        <div className="two">
          <Pick
            label="Look back"
            value={asOf}
            onChange={(next) => void travel(next)}
            options={[
              { value: "now", label: "As it is now" },
              { value: "1", label: "As of 1 hour ago" },
              { value: "6", label: "As of 6 hours ago" },
              { value: "24", label: "As of yesterday" },
            ]}
          />
          <p className="muted small">
            {reading
              ? "Asking Arkiv for the chain at that block…"
              : then?.error
                ? then.error
                : then
                  ? `At block ${then.block.toLocaleString("en-IN")} the chain held ${then.count} valid reports (synthetic demo rows included). ${then.stillThere} of them are on the chain today, unchanged: nothing was edited or removed in between. Anything missing has expired.`
                  : "Sealed entities cannot be edited, so the past is a provable subset of the present. Pick a time to check it against Arkiv's own history."}
          </p>
        </div>
      </section>
      {rows.length === 0 ? <p className="muted pad">Nothing here matches.</p> : null}
      {weeks.map((week) => (
        <section key={week} className="card flush">
          <h3 className="week">{week}</h3>
          <ul className="record-list">
            {rows
              .filter((row) => row.week === week)
              .sort((a, b) => Number(b.createdAt - a.createdAt))
              .map((row) => (
                <li key={row.key}>
                  <span className="rec-kind">{kindMeta(row.kind).icon}</span>
                  <button type="button" className="rec-main" onClick={() => onDistrict(row.district)}>
                    <strong>
                      {departmentLabel(row.department)} · {labelize(row.service)}
                    </strong>
                    <span className="muted small">
                      {labelize(row.district)}, {stateLabel(row.state)} · {OUTCOME_LABEL[row.outcome] ?? row.outcome}
                    </span>
                  </button>
                  <span className="num">{measure(row.kind, row.amountInr)}</span>
                  <span className="rec-meta">
                    <a href={entityUrl(row.key)} target="_blank" rel="noreferrer" className="link small">
                      {shortAddress(row.creator)} <ExternalLink size={11} />
                    </a>
                    <span className="muted small">{ago(live.ageSeconds(row.createdAt))}</span>
                    {isDemoWallet(row.creator) ? <Badge tone="demo">demo</Badge> : null}
                    {row.verified ? <Checked state={stateLabel(row.state)} /> : null}
                    {row.source === "press" ? <PressBadge row={row} /> : null}
                  </span>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
