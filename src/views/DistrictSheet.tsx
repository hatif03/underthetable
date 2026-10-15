import { ExternalLink, Plus } from "lucide-react"
import type { Bucket } from "../lib/aggregate"
import { entityUrl } from "../lib/client"
import { isDemoWallet } from "../lib/demo"
import { stateLabel } from "../lib/derive"
import { measure, rupees, shortAddress } from "../lib/format"
import { departmentLabel, labelize } from "../lib/labels"
import type { Live } from "../state/useDerived"
import { Badge, Checked, Pips, Sheet } from "../ui/kit"
import { PressBadge } from "../ui/Press"
import { kindMeta, OUTCOME_LABEL } from "../ui/meta"
import type { Prefill } from "./Pulse"

export function DistrictSheet({ live, district, closed, onClose, onReport }: { live: Live; district: string | null; closed: boolean; onClose: () => void; onReport: (prefill: Prefill) => void }) {
  const desks = district ? live.d.desks.filter((desk) => desk.district === district) : []
  const press = district ? live.d.press.filter((row) => row.district === district) : []
  const state = desks[0]?.state ?? press[0]?.state ?? (district ? live.d.byDistrict.get(district)?.state : undefined)
  const quoted = desks.filter((desk) => desk.quoted)
  const waiting = desks.filter((desk) => !desk.quoted)
  const title = district ? labelize(district) : ""
  return (
    <Sheet open={district !== null} onOpenChange={(open) => !open && onClose()} title={title} description={state ? `${stateLabel(state)} · ${desks.length} citizen desk${desks.length === 1 ? "" : "s"} · ${press.length} press report${press.length === 1 ? "" : "s"}` : "No reports yet"}>
      {press.length > 0 ? <h3 className="sub">Reported in the press</h3> : null}
      {press.map((row) => (
        <article key={row.key} className="desk-row">
          <header>
            <div>
              <strong>
                {departmentLabel(row.department)} · {labelize(row.service)}
              </strong>
              <div className="muted small">
                {kindMeta(row.kind).label} · {row.week}
              </div>
            </div>
            <span className="big-sm num">{measure(row.kind, row.amountInr)}</span>
          </header>
          <PressBadge row={row} label="Press sources" />
        </article>
      ))}
      {desks.length === 0 && press.length === 0 ? (
        <div className="empty-block">
          <p>Nothing sealed for this district yet.</p>
          <p className="muted small">The CLI reads the same public RPC: <code>npm run query -- --district {district}</code></p>
        </div>
      ) : null}
      {quoted.length > 0 ? <h3 className="sub">Quoted</h3> : null}
      {quoted.map((desk) => (
        <DeskRow key={desk.id} desk={desk} trend={live.d.trend.get(desk.id) ?? null} closed={closed} onReport={onReport} />
      ))}
      {waiting.length > 0 ? <h3 className="sub">Waiting for 3 wallets</h3> : null}
      {waiting.map((desk) => (
        <DeskRow key={desk.id} desk={desk} trend={null} closed={closed} onReport={onReport} />
      ))}
      {district && state && !closed ? (
        <button type="button" className="btn primary wide" onClick={() => onReport({ state, district })}>
          <Plus size={18} /> Report in {title}
        </button>
      ) : null}
    </Sheet>
  )
}

function DeskRow({ desk, trend, closed, onReport }: { desk: Bucket; trend: number | null; closed: boolean; onReport: (prefill: Prefill) => void }) {
  const meta = kindMeta(desk.kind)
  const demand = desk.kind === "demand"
  return (
    <article className="desk-row">
      <header>
        <div>
          <strong>
            {departmentLabel(desk.department)} · {labelize(desk.service)}
          </strong>
          <div className="muted small">
            {meta.label} · {desk.week}
          </div>
        </div>
        {desk.quoted ? (
          <span className="big-sm num">{measure(desk.kind, desk.medianInr ?? 0)}</span>
        ) : (
          <Badge>{desk.voices} of 3 wallets</Badge>
        )}
      </header>
      <div className="wallets">
        <Pips voices={desk.voices} />
        <span className="small muted">
          {desk.quoted
            ? `median of ${desk.voices} wallets${trend ? ` · ${trend > 0 ? "up" : "down"} ${demand ? rupees(Math.abs(trend)) : Math.abs(trend)} on last week` : ""}`
            : "Not a figure yet. Each wallet counts once."}
        </span>
      </div>
      <ul className="voices">
        {desk.voiceRows.map((row) => (
          <li key={row.key}>
            <span className="num">{measure(row.kind, row.amountInr)}</span>
            <span className="muted small">{OUTCOME_LABEL[row.outcome] ?? row.outcome} {row.verified ? <Checked state={stateLabel(row.state)} /> : null} {desk.outlierKeys.includes(row.key) ? <span className="signal warn">outlier</span> : null}</span>
            <a href={entityUrl(row.key)} target="_blank" rel="noreferrer" className="link small">
              {shortAddress(row.creator)}
              {isDemoWallet(row.creator) ? " · demo" : ""} <ExternalLink size={11} />
            </a>
          </li>
        ))}
      </ul>
      {closed ? null : (
        <button type="button" className="btn ghost" onClick={() => onReport({ kind: desk.kind, state: desk.state, district: desk.district, department: desk.department, service: desk.service })}>
          Add your wallet to this desk
        </button>
      )}
    </article>
  )
}
