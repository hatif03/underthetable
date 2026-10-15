import { AnimatePresence, motion } from "motion/react"
import { ArrowDownRight, ArrowUpRight, ExternalLink, Hourglass, Lock, Newspaper, Plus, Search, Users, Zap } from "lucide-react"
import { useState } from "react"
import districts from "../../data/districts.json"
import type { Bucket, ReportRow } from "../lib/aggregate"
import { entityUrl } from "../lib/client"
import { isDemoWallet } from "../lib/demo"
import { ago, stateLabel, until } from "../lib/derive"
import { measure, rupees, shortAddress } from "../lib/format"
import { departmentLabel, labelize } from "../lib/labels"
import { CENTROIDS, DOT_COLS, DOT_ROWS, DOTS } from "../lib/indiaDots"
import { t } from "../lib/i18n"
import type { Live } from "../state/useDerived"
import * as Switch from "@radix-ui/react-switch"
import { Badge, Checked, Counter, Pips, Tip } from "../ui/kit"
import { PressBadge, pressEntry } from "../ui/Press"
import { setShowDemo } from "../state/store"
import { kindMeta, OUTCOME_LABEL } from "../ui/meta"

export type Prefill = { kind?: string; state?: string; district?: string; department?: string; service?: string }

type Props = {
  live: Live
  closed: boolean
  onSearch: () => void
  onDistrict: (district: string) => void
  onReport: (prefill?: Prefill) => void
}

export function Pulse({ live, closed, onSearch, onDistrict, onReport }: Props) {
  const { d, store } = live
  const [stateFilter, setStateFilter] = useState<string | null>(null)
  const [onlyChecked, setOnlyChecked] = useState(false)
  const loading = !store.board
  const desks = d.quoted.filter((desk) => (!stateFilter || desk.state === stateFilter) && (!onlyChecked || desk.corroborated))
  const feed = d.feed.filter((row) => !stateFilter || row.state === stateFilter).slice(0, 8)
  const pressRows = d.press.filter((row) => !stateFilter || row.state === stateFilter).sort((a, b) => b.week.localeCompare(a.week) || Number(b.createdAt - a.createdAt))
  const openDesks = d.open.filter((desk) => !stateFilter || desk.state === stateFilter)

  const pressSection =
    pressRows.length > 0 ? (
      <section className="stack tight">
        <header className="section-head">
          <h2>{t("press.title")}{stateFilter ? ` · ${stateLabel(stateFilter)}` : ""}</h2>
          <p className="muted small">
            Incidents in news reports from the last week, written to Arkiv by a curator wallet with the same closed lists. They are not citizen reports and never count toward a 3-wallet figure. Each links to its articles. If you were there, add your own.
          </p>
        </header>
        <div className="desk-grid">
          {pressRows.slice(0, 12).map((row, index) => (
            <PressCard key={row.key} row={row} citizens={d.pressCitizens.get(row.key) ?? 0} index={index} closed={closed} onDistrict={onDistrict} onReport={onReport} />
          ))}
        </div>
        {pressRows.length > 12 ? <p className="muted small">{pressRows.length - 12} more in the Record.</p> : null}
      </section>
    ) : null

  const openSection =
    openDesks.length > 0 ? (
      <section className="stack tight">
        <header className="section-head">
          <h2>{t("open.title")}</h2>
          <p className="muted small">One or two citizen wallets have reported these desks. A figure appears at 3.</p>
        </header>
        <div className="desk-grid">
          {openDesks.slice(0, 6).map((desk) => (
            <article key={desk.id} className="card desk">
              <strong>
                {departmentLabel(desk.department)} · {labelize(desk.service)}
              </strong>
              <span className="muted small">
                {labelize(desk.district)}, {stateLabel(desk.state)} · {desk.week}
              </span>
              <span className="wallets">
                <Pips voices={desk.voices} /> <span className="small">{desk.voices} of 3 wallets</span>
              </span>
              {(d.deskPress.get(desk.id)?.length ?? 0) > 0 ? (
                <span className="signals">
                  <span className="signal good">
                    <Newspaper size={12} /> Also in the press
                  </span>
                </span>
              ) : null}
              {closed ? null : (
                <button type="button" className="btn ghost wide" onClick={() => onReport({ kind: desk.kind, state: desk.state, district: desk.district, department: desk.department, service: desk.service })}>
                  Add your wallet
                </button>
              )}
            </article>
          ))}
        </div>
      </section>
    ) : null

  return (
    <div className="stack">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">{t("hero.eyebrow")}</p>
          <h1>{t("hero.title")}</h1>
          <p className="lede">{t("hero.lede")}</p>
          <div className="hero-actions">
            <button type="button" className="search-trigger" onClick={onSearch}>
              <Search size={18} />
              <span>{t("hero.search")}</span>
              <kbd>Ctrl K</kbd>
            </button>
            {closed ? null : (
              <button type="button" className="btn primary" onClick={() => onReport()}>
                <Plus size={18} /> {t("nav.report")}
              </button>
            )}
          </div>
        </div>
        <div className="hero-side">
        <div className="stats">
          <Stat label={t("stat.sealed")} value={d.live.length} loading={loading} />
          <Stat label={t("stat.districts")} value={d.districtCount} loading={loading} />
          <Stat label={t("stat.press")} value={d.press.length} loading={loading} hint="Written by a curator wallet from a published news report. Not a citizen voice." />
          <Stat label={t("stat.wallets")} value={d.wallets} loading={loading} hint="Distinct citizen creators. A wallet is not a person." />
        </div>
          {!loading ? (
            <label className="toggle-row small">
              <Switch.Root className="switch" checked={store.showDemo} onCheckedChange={setShowDemo} aria-label="Show demo rows">
                <Switch.Thumb className="switch-thumb" />
              </Switch.Root>
              <span className="muted">{store.showDemo ? t("demo.showing") : `${t("demo.hiding")} (${d.demoHidden})`}</span>
            </label>
          ) : null}
        </div>
      </section>

      <section className="grid-2">
        <article className="card">
          <header className="card-head">
            <h2>{t("map.title")}</h2>
            {stateFilter ? (
              <button type="button" className="link" onClick={() => setStateFilter(null)}>
                {stateLabel(stateFilter)} · clear
              </button>
            ) : (
              <span className="muted small">{t("map.tap")}</span>
            )}
          </header>
          <DotMap live={live} selected={stateFilter} onSelect={(state) => setStateFilter((current) => (current === state ? null : state))} />
        </article>

        <article className="card">
          <header className="card-head">
            <h2>
              <span className="live-dot" aria-hidden /> {t("feed.title")}
            </h2>
            <span className="muted small">{store.live === "on" ? "live" : "refreshes every 2 min"}</span>
          </header>
          <Feed live={live} rows={feed} onDistrict={onDistrict} loading={loading} />
        </article>
      </section>

      {d.quoted.length === 0 ? pressSection : null}

      <section className="stack tight">
        <header className="section-head">
          <h2>{t("desks.title")}{stateFilter ? ` · ${stateLabel(stateFilter)}` : ""}</h2>
          <p className="muted small">{t("desks.sub")}</p>
          <label className="toggle-row">
            <Switch.Root className="switch" checked={onlyChecked} onCheckedChange={setOnlyChecked} aria-label="Only corroborated desks">
              <Switch.Thumb className="switch-thumb" />
            </Switch.Root>
            <span className="small">Only desks where 3 wallets were location-checked <span className="muted">({d.quoted.filter((desk) => desk.corroborated).length} now, {d.verifiedCount} of {d.live.length} reports checked)</span></span>
          </label>
        </header>
        {loading ? (
          <div className="desk-grid">
            {[0, 1, 2].map((item) => (
              <div key={item} className="card skeleton tall" />
            ))}
          </div>
        ) : desks.length === 0 ? (
          <div className="card empty">
            <Lock size={20} />
            <p>{onlyChecked ? "No desk has 3 location-checked wallets yet. Demo rows are never location-checked." : `No desk has 3 wallets${stateFilter ? " in this state" : ""} yet. One wallet reporting five times still counts once.`}</p>
            {closed ? null : (
              <button type="button" className="btn" onClick={() => onReport()}>
                Be the next wallet
              </button>
            )}
          </div>
        ) : (
          <div className="desk-grid">
            {desks.slice(0, 9).map((desk, index) => (
              <DeskCard key={desk.id} desk={desk} trend={d.trend.get(desk.id) ?? null} matches={d.deskPress.get(desk.id) ?? []} index={index} closed={closed} onDistrict={onDistrict} onReport={onReport} />
            ))}
          </div>
        )}
      </section>

      {d.quoted.length > 0 ? pressSection : null}
      {openSection}

      <section className="grid-2">
        <article className="card">
          <header className="card-head">
            <h2>{t("chart.title")}</h2>
            <span className="muted small">reports sealed per day</span>
          </header>
          <Bars series={d.daily} />
        </article>
        <article className="card">
          <header className="card-head">
            <h2>
              <Hourglass size={16} /> {t("expiry.title")}
            </h2>
            <span className="muted small">180 days, then it leaves queries</span>
          </header>
          <Expiry live={live} />
        </article>
      </section>
    </div>
  )
}

function Stat({ label, value, loading, hint }: { label: string; value: number; loading: boolean; hint?: string }) {
  const body = (
    <div className="stat">
      <span className="stat-value">{loading ? <span className="skeleton inline" /> : <Counter value={value} />}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
  return hint ? <Tip label={hint}>{body}</Tip> : body
}

function DotMap({ live, selected, onSelect }: { live: Live; selected: string | null; onSelect: (state: string) => void }) {
  const [hover, setHover] = useState<string | null>(null)
  const active = hover ?? selected
  const heat = (slug: string) => {
    const count = live.d.byState.get(slug)?.count ?? 0
    return count === 0 ? 0 : count < 3 ? 1 : count < 8 ? 2 : 3
  }
  const withReports = districts.states
    .map((state) => ({ slug: state.slug, label: state.label, info: live.d.byState.get(state.slug) }))
    .filter((item) => item.info)
    .sort((a, b) => (b.info?.count ?? 0) - (a.info?.count ?? 0))
  const shown = active ? districts.states.find((item) => item.slug === active) : null
  const shownInfo = active ? live.d.byState.get(active) : undefined
  const freshStates = new Set(live.d.live.filter((row) => live.store.fresh.has(row.key)).map((row) => row.state))
  return (
    <div className="dotmap-wrap">
      <svg className="dotmap" viewBox={`0 0 ${DOT_COLS} ${DOT_ROWS}`} role="img" aria-label="Map of India, one dot per half degree, coloured by reports per state" onPointerLeave={() => setHover(null)}>
        {DOTS.map(([col, row, slug]) => (
          <circle
            key={`${col}-${row}`}
            cx={col + 0.5}
            cy={row + 0.5}
            r={0.4}
            className={`dot heat-${heat(slug)}${active === slug ? " on" : active ? " dim" : ""}`}
            style={{ animationDelay: `${(col + row) * 9}ms` }}
            onPointerEnter={() => setHover(slug)}
            onClick={() => onSelect(slug)}
          />
        ))}
        {withReports.map(({ slug }) => {
          const centre = CENTROIDS[slug]
          if (!centre) return null
          return (
            <g key={slug} className="dot-label" pointerEvents="none">
              {freshStates.has(slug) ? <circle className="ripple" cx={centre[0] + 0.5} cy={centre[1] + 0.5} r={1.2} /> : null}
              <text x={centre[0] + 0.5} y={centre[1] + 0.5} textAnchor="middle" dominantBaseline="central">{slug.toUpperCase()}</text>
            </g>
          )
        })}
      </svg>
      <p className="dotmap-read" aria-live="polite">
        {shown ? (
          <>
            <strong>{shown.label}</strong>
            <span className="muted">
              {shownInfo ? ` · ${shownInfo.count} report${shownInfo.count === 1 ? "" : "s"} · ${shownInfo.wallets.size} wallet${shownInfo.wallets.size === 1 ? "" : "s"} · ${shownInfo.quoted} quoted desk${shownInfo.quoted === 1 ? "" : "s"}` : " · nothing sealed yet"}
            </span>
          </>
        ) : (
          <span className="muted">Hover or tap a state. Each dot is about 50 km.</span>
        )}
      </p>
      <div className="chips">
        {withReports.map(({ slug, label, info }) => (
          <button key={slug} type="button" className={selected === slug ? "chip on" : "chip"} onClick={() => onSelect(slug)} aria-pressed={selected === slug}>
            {label} <b>{info?.count}</b>
          </button>
        ))}
      </div>
    </div>
  )
}

function Feed({ live, rows, onDistrict, loading }: { live: Live; rows: ReportRow[]; onDistrict: (district: string) => void; loading: boolean }) {
  if (loading) {
    return (
      <div className="feed">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="skeleton row" />
        ))}
      </div>
    )
  }
  if (rows.length === 0) return <p className="muted pad">Nothing sealed here yet.</p>
  return (
    <ul className="feed">
      <AnimatePresence initial={false}>
        {rows.map((row) => {
          const meta = kindMeta(row.kind)
          const fresh = live.store.fresh.has(row.key)
          return (
            <motion.li
              key={row.key}
              layout
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
              className={fresh ? "feed-row fresh" : "feed-row"}
            >
              <span className="feed-icon">{meta.icon}</span>
              <button type="button" className="feed-main" onClick={() => onDistrict(row.district)}>
                <strong>
                  {departmentLabel(row.department)} · {labelize(row.service)} {row.verified ? <Checked state={stateLabel(row.state)} /> : null}
                </strong>
                <span className="muted small">
                  {labelize(row.district)}, {stateLabel(row.state)} · {meta.label.toLowerCase()} · {OUTCOME_LABEL[row.outcome] ?? row.outcome}
                </span>
              </button>
              <span className="feed-side">
                <span className="num">{measure(row.kind, row.amountInr)}</span>
                {row.source === "press" ? <PressBadge row={row} /> : null}
                <span className="muted small">
                  {ago(live.ageSeconds(row.createdAt))}
                  {isDemoWallet(row.creator) ? " · demo" : ""}
                </span>
              </span>
            </motion.li>
          )
        })}
      </AnimatePresence>
    </ul>
  )
}

const OUTCOME_COLOR: Record<string, string> = {
  asked: "var(--warn)",
  paid: "var(--accent)",
  refused: "var(--ok)",
  noted: "var(--muted)",
  worsened: "var(--accent)",
  cleared: "var(--ok)",
}

function DeskCard({ desk, trend, matches, index, closed, onDistrict, onReport }: { desk: Bucket; trend: number | null; matches: ReportRow[]; index: number; closed: boolean; onDistrict: (district: string) => void; onReport: (prefill?: Prefill) => void }) {
  const meta = kindMeta(desk.kind)
  const demand = desk.kind === "demand"
  const median = desk.medianInr ?? 0
  const demo = desk.creators.every(isDemoWallet)
  return (
    <motion.article
      className="card desk"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: (index % 3) * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
    >
      <header className="desk-head">
        <Badge>
          {meta.icon} {meta.label}
        </Badge>
        {demo ? (
          <Tip label="Every wallet on this desk is one of the team's four demo wallets. Synthetic data.">
            <span>
              <Badge tone="demo">demo data</Badge>
            </span>
          </Tip>
        ) : null}
      </header>
      <button type="button" className="desk-title" onClick={() => onDistrict(desk.district)}>
        <strong>
          {departmentLabel(desk.department)} · {labelize(desk.service)}
        </strong>
        <span className="muted small">
          {labelize(desk.district)}, {stateLabel(desk.state)} · {desk.week}
        </span>
      </button>
      <div className="desk-figure">
        <span className="big num">{demand ? <Counter value={median} format={(n) => rupees(Math.round(n))} /> : <>{median}<small>/5</small></>}</span>
        <span className="muted small">{demand ? "median asked" : "median severity"}{desk.min !== desk.max ? ` · range ${demand ? `${rupees(desk.min)} to ${rupees(desk.max)}` : `${desk.min} to ${desk.max}`}` : ""}</span>
      </div>
      <div className="outcome-bar" role="img" aria-label={Object.entries(desk.outcomes).map(([name, count]) => `${count} ${name}`).join(", ")}>
        {Object.entries(desk.outcomes).map(([name, count]) => (
          <i key={name} style={{ flex: count, background: OUTCOME_COLOR[name] ?? "var(--muted)" }} />
        ))}
      </div>
      <p className="muted small">{Object.entries(desk.outcomes).map(([name, count]) => `${count} ${OUTCOME_LABEL[name] ?? name}`).join(" · ")}</p>
      {(matches.length > 0 || desk.bursty) ? (
        <div className="signals">
          {matches.length > 0 ? (
            <Tip label="A published news report describes the same kind of incident in this district within a week of these citizen reports.">
              <span className="signal good">
                <Newspaper size={12} /> Also in the press
              </span>
            </Tip>
          ) : null}
          {desk.bursty ? (
            <Tip label="The first reports from these wallets arrived within about ten minutes. That is what a real event looks like, and also what one person with several wallets looks like. Read the figure with that in mind.">
              <span className="signal warn">
                <Zap size={12} /> Filed in a burst
              </span>
            </Tip>
          ) : null}
        </div>
      ) : null}
      <footer className="desk-foot">
        <span className="wallets">
          <Pips voices={desk.voices} /> <span className="small">{desk.voices} wallets</span>
          {desk.verifiedVoices > 0 ? (
            <span className={desk.corroborated ? "small hit" : "small muted"}>
              <Checked /> {desk.verifiedVoices} checked{desk.corroborated ? " · corroborated" : ""}
            </span>
          ) : null}
        </span>
        {trend === null ? (
          <span className="muted small">first week on record</span>
        ) : trend === 0 ? (
          <span className="muted small">same as last week</span>
        ) : (
          <span className={trend > 0 ? "trend up" : "trend down"}>
            {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {demand ? rupees(Math.abs(trend)) : Math.abs(trend)} vs last week
          </span>
        )}
      </footer>
      {closed ? null : (
        <button type="button" className="btn ghost wide" onClick={() => onReport({ kind: desk.kind, state: desk.state, district: desk.district, department: desk.department, service: desk.service })}>
          {t("card.reportDesk")}
        </button>
      )}
    </motion.article>
  )
}

function PressCard({ row, citizens, index, closed, onDistrict, onReport }: { row: ReportRow; citizens: number; index: number; closed: boolean; onDistrict: (district: string) => void; onReport: (prefill?: Prefill) => void }) {
  const meta = kindMeta(row.kind)
  const entry = pressEntry(row.key)
  return (
    <motion.article
      className="card desk"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: (index % 3) * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <header className="desk-head">
        <Badge>
          {meta.icon} {meta.label}
        </Badge>
        <PressBadge row={row} label={entry ? `${entry.sources.length} source${entry.sources.length === 1 ? "" : "s"}` : "Press"} />
      </header>
      <button type="button" className="desk-title" onClick={() => onDistrict(row.district)}>
        <strong>
          {departmentLabel(row.department)} · {labelize(row.service)}
        </strong>
        <span className="muted small">
          {labelize(row.district)}, {stateLabel(row.state)} · {row.week}
        </span>
      </button>
      <div className="desk-figure">
        <span className="big num">
          {row.kind === "demand" ? rupees(row.amountInr) : (
            <>
              {row.amountInr}
              <small>/5</small>
            </>
          )}
        </span>
        <span className="muted small">{row.kind === "demand" ? (OUTCOME_LABEL[row.outcome] ?? row.outcome) : `severity, ${OUTCOME_LABEL[row.outcome] ?? row.outcome}`}</span>
      </div>
      {entry?.note ? <p className="muted small">{entry.note}</p> : null}
      {citizens > 0 ? (
        <p className="small hit">
          <Users size={13} /> {citizens} citizen wallet{citizens === 1 ? "" : "s"} reported the same
        </p>
      ) : (
        <p className="muted small">No citizen has reported this yet.</p>
      )}
      {closed ? null : (
        <button type="button" className="btn ghost wide" onClick={() => onReport({ kind: row.kind, state: row.state, district: row.district, department: row.department, service: row.service })}>
          {t("card.wereYouThere")}
        </button>
      )}
    </motion.article>
  )
}

function Bars({ series }: { series: { day: string; count: number }[] }) {
  const max = Math.max(1, ...series.map((item) => item.count))
  const total = series.reduce((sum, item) => sum + item.count, 0)
  return (
    <div>
      <div className="bars" role="img" aria-label={`${total} reports in the last 14 days`}>
        {series.map((item, index) => (
          <Tip key={item.day} label={`${item.day} · ${item.count}`}>
            <motion.i
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.03, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: `${Math.max(6, (item.count / max) * 100)}%`, opacity: item.count === 0 ? 0.25 : 1, transformOrigin: "bottom" }}
            />
          </Tip>
        ))}
      </div>
      <p className="muted small pad-top">
        {total} sealed in 14 days. Day is the day the transaction was mined, not the day of the incident, which is never stored.
      </p>
    </div>
  )
}

function Expiry({ live }: { live: Live }) {
  const { d, now, store } = live
  const saved = store.board?.savedAt ?? now
  const drift = (now - saved) / 1000
  if (d.live.length === 0 && d.expired.length === 0) return <p className="muted pad">Nothing to expire yet.</p>
  return (
    <ul className="expiry">
      {d.expired.map((row) => (
        <li key={row.key}>
          <span>
            <strong>
              {labelize(row.district)} · {labelize(row.service)}
            </strong>
            <span className="muted small"> left every query. Nobody deleted it.</span>
          </span>
          <a href={entityUrl(row.key)} target="_blank" rel="noreferrer" className="link small">
            creation tx <ExternalLink size={12} />
          </a>
        </li>
      ))}
      {d.expiring.map(({ row, secondsLeft }) => {
        const left = secondsLeft - drift
        const life = Number(row.expiresAt - row.createdAt)
        const used = Math.min(1, Math.max(0, 1 - Number(row.expiresAt - live.head) / life))
        return (
          <li key={row.key}>
            <span>
              <strong>
                {labelize(row.district)} · {labelize(row.service)}
              </strong>
              <span className="muted small"> by {shortAddress(row.creator)}</span>
            </span>
            <span className="expiry-side">
              <span className="small">{until(left)}</span>
              <span className="life" aria-hidden>
                <i style={{ width: `${used * 100}%` }} />
              </span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}
