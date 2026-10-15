import { AnimatePresence, motion } from "motion/react"
import * as Switch from "@radix-ui/react-switch"
import { ExternalLink, Lock, MapPin, RotateCcw, ShieldCheck, Trash2, UserRound, Wallet } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import districts from "../../data/districts.json"
import type { ReportRow } from "../lib/aggregate"
import { DEAD, entityUrl, txUrl } from "../lib/client"
import { findPrivate, KINDS, redactText, sealReport, type ReportKind } from "../lib/guard"
import { departmentLabel, labelize } from "../lib/labels"
import { currentAddress, forgetIdentity, fundIdentity, getIdentity } from "../lib/identity"
import { departmentsFor, guess, rolesFor, servicesFor } from "../lib/parse"
import { rupees, shortAddress } from "../lib/format"
import { requestAttestation } from "../lib/attest"
import { coarsePosition, sameArea, stateAt, stateName, type Coarse } from "../lib/geo"
import { connectWallet, type Connection } from "../lib/wallet"
import { kolkataDay, weekChoices } from "../lib/week"
import { fileAsIdentity, fileReport, tryDelete, type SealReceipt } from "../lib/write"
import { addRow, reload } from "../state/store"
import { DistrictPicker } from "../ui/DistrictPicker"
import { t } from "../lib/i18n"
import { Pick, Seg, Sheet } from "../ui/kit"
import { KIND_META, OUTCOME_LABEL } from "../ui/meta"
import type { Prefill } from "./Pulse"

const AMOUNTS = [200, 500, 1000, 2000, 5000, 10000]
const STORED = "utt:district"

function lastDistrict(): { state: string; district: string } {
  try {
    const saved = JSON.parse(localStorage.getItem(STORED) ?? "null") as { state: string; district: string } | null
    if (saved && districts.states.find((item) => item.slug === saved.state)?.districts.includes(saved.district)) return saved
  } catch {
    // no saved district
  }
  return { state: "mh", district: "nashik" }
}

type Phase = "idle" | "locating" | "gas" | "sealing" | "checking"
type Check = { ok: boolean; text: string; attestationKey?: string }

export function FileSheet({ open, onOpenChange, prefill }: { open: boolean; onOpenChange: (open: boolean) => void; prefill?: Prefill }) {
  const today = kolkataDay()
  const weeks = useMemo(() => weekChoices(today), [today])
  const start = lastDistrict()
  const [kind, setKind] = useState<ReportKind>("demand")
  const [stateSlug, setStateSlug] = useState(start.state)
  const [district, setDistrict] = useState(start.district)
  const [department, setDepartment] = useState("rto")
  const [service, setService] = useState("driving_licence")
  const [role, setRole] = useState("motor_vehicle_inspector")
  const [outcome, setOutcome] = useState("asked")
  const [amountText, setAmountText] = useState("500")
  const [severity, setSeverity] = useState("3")
  const [weekMode, setWeekMode] = useState("0")
  const [older, setOlder] = useState("2")
  const [words, setWords] = useState("")
  const [filled, setFilled] = useState<string[]>([])
  const [removed, setRemoved] = useState<string[]>([])
  const [phase, setPhase] = useState<Phase>("idle")
  const [error, setError] = useState<string | null>(null)
  const [receipt, setReceipt] = useState<(SealReceipt & { delete: () => Promise<string>; check: Check | null }) | null>(null)
  const [verify, setVerify] = useState(true)
  const [sealText, setSealText] = useState<string | null>(null)
  const [mode, setMode] = useState<"identity" | "wallet">("identity")
  const [connection, setConnection] = useState<Connection | null>(null)
  const [address, setAddress] = useState(currentAddress())

  function chooseKind(next: ReportKind, keepDesk?: { department: string; service: string }) {
    setKind(next)
    const desks = departmentsFor(next)
    const department2 = keepDesk && servicesFor(next, keepDesk.department).includes(keepDesk.service) ? keepDesk.department : desks[0]?.slug
    if (!department2) return
    const service2 = keepDesk && department2 === keepDesk.department && servicesFor(next, department2).includes(keepDesk.service) ? keepDesk.service : servicesFor(next, department2)[0]
    setDepartment(department2)
    setService(service2)
    setRole(rolesFor(next, department2)[0])
    setOutcome(next === "demand" ? "asked" : "noted")
  }

  // A desk card or a district sheet opens the slip with the desk already set.
  useEffect(() => {
    if (!open || !prefill) return
    const nextKind = (prefill.kind && KINDS.includes(prefill.kind as ReportKind) ? prefill.kind : "demand") as ReportKind
    if (prefill.department && prefill.service) chooseKind(nextKind, { department: prefill.department, service: prefill.service })
    else chooseKind(nextKind)
    if (prefill.state && prefill.district) {
      setStateSlug(prefill.state)
      setDistrict(prefill.district)
    }
    setReceipt(null)
    setError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, prefill])

  // The sentence is parsed here, on this device. Nothing about it is sent anywhere.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const { text, removed: gone } = redactText(words)
      setRemoved(gone)
      if (text.length < 6) return setFilled([])
      const g = guess(text)
      const got: string[] = []
      if (g.kind) {
        chooseKind(g.kind, g.department && g.service ? { department: g.department, service: g.service } : undefined)
        got.push("kind", "desk")
      }
      if (g.district && g.state) {
        setStateSlug(g.state)
        setDistrict(g.district)
        got.push("district")
      }
      if (g.outcome) {
        setOutcome(g.outcome)
        got.push("outcome")
      }
      if (g.amountInr !== undefined) {
        if ((g.kind ?? "demand") === "demand") setAmountText(String(g.amountInr))
        else setSeverity(String(Math.min(5, g.amountInr)))
        got.push("amount")
      }
      if (g.weeksAgo !== undefined) {
        if (g.weeksAgo <= 1) setWeekMode(String(g.weeksAgo))
        else {
          setWeekMode("older")
          setOlder(String(Math.min(11, g.weeksAgo)))
        }
        got.push("week")
      }
      setFilled(got)
    }, 350)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words])

  const state = districts.states.find((item) => item.slug === stateSlug) ?? districts.states[0]
  const weekIndex = weekMode === "older" ? Number(older) : Number(weekMode)
  const demand = kind === "demand"
  const amount = demand ? Number(amountText.replaceAll(",", "")) : Number(severity)
  const roles = rolesFor(kind, department)

  const deskOptions = departmentsFor(kind).flatMap((item) =>
    servicesFor(kind, item.slug).map((slug) => ({ value: `${item.slug}:${slug}`, label: labelize(slug), group: departmentLabel(item.slug) })),
  )

  async function onFile() {
    setError(null)
    let sealed
    try {
      sealed = sealReport({ state: stateSlug, district, department, role, service, outcome, amountInr: amount, day: weeks[weekIndex].day, today, kind })
    } catch (problem) {
      return setError(problem instanceof Error ? problem.message : String(problem))
    }
    try {
      try {
        localStorage.setItem(STORED, JSON.stringify({ state: stateSlug, district }))
      } catch {
        // remembering the district is a convenience
      }
      // Ask for the location first, so the permission prompt is part of pressing File and not a surprise afterwards.
      let position: Coarse | null = null
      let check: Check | null = null
      if (verify) {
        setPhase("locating")
        try {
          position = await coarsePosition()
          const here = stateAt(position)
          if (here && !sameArea(here, sealed.state)) {
            return setError(`You seem to be in ${stateName(here)}, and this report is for ${stateName(sealed.state)}. Change the district, or turn the location check off. The report counts either way, but only a checked one is marked as checked.`)
          }
        } catch (problem) {
          check = { ok: false, text: problem instanceof Error ? problem.message : String(problem) }
          position = null
        }
      }
      let filed: SealReceipt
      let remove: () => Promise<string>
      let signer: Parameters<typeof requestAttestation>[0]
      if (mode === "identity") {
        const identity = getIdentity()
        setAddress(identity.address)
        setPhase("gas")
        await fundIdentity(identity.address)
        setPhase("sealing")
        filed = await fileAsIdentity(identity.client as Connection["client"], sealed)
        signer = identity.client as unknown as typeof signer
        remove = () => tryDelete(identity.client as Connection["client"], filed.entityKey)
      } else {
        let wallet = connection
        if (!wallet) {
          if (!window.ethereum) throw new Error("This browser has no wallet. Use the throwaway identity instead.")
          wallet = await connectWallet(window.ethereum)
          setConnection(wallet)
        }
        setPhase("sealing")
        filed = await fileReport(wallet, sealed)
        const used = wallet
        signer = wallet.client as unknown as typeof signer
        remove = () => tryDelete(used.client, filed.entityKey)
      }
      const row: ReportRow = {
        key: filed.entityKey,
        creator: filed.creator,
        owner: filed.owner,
        createdAt: 0n,
        expiresAt: filed.expiresAt,
        state: sealed.state,
        district: sealed.district,
        department: sealed.department,
        role: sealed.role,
        service: sealed.service,
        outcome: sealed.outcome,
        week: sealed.week,
        amountInr: sealed.amountInr,
        kind: sealed.kind,
      }
      if (position) {
        setPhase("checking")
        try {
          const done = await requestAttestation(signer, filed.entityKey, position)
          check = { ok: true, text: `Inside ${stateName(done.state)} when you filed.`, attestationKey: done.attestationKey }
        } catch (problem) {
          check = { ok: false, text: problem instanceof Error ? problem.message : String(problem) }
        }
      } else if (!verify) {
        check = { ok: false, text: "Skipped. This report counts as a wallet, and is not marked location-checked." }
      }
      setReceipt({ ...filed, delete: remove, check })
      setSealText(null)
      setWords("")
      setFilled([])
      addRow(row)
      window.setTimeout(() => void reload(), check?.ok ? 3000 : 6000)
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : String(problem))
    } finally {
      setPhase("idle")
    }
  }

  const busy = phase !== "idle"
  const label = { idle: t("form.file"), locating: t("form.locating"), gas: t("form.gas"), sealing: t("form.sealing"), checking: t("form.checking") }[phase]

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!busy) onOpenChange(next)
      }}
      title={receipt ? t("receipt.sealed") : t("form.title")}
      description={receipt ? undefined : t("form.sub")}
      wide
    >
      <AnimatePresence mode="wait" initial={false}>
        {receipt ? (
          <Receipt
            key="receipt"
            receipt={receipt}
            check={receipt.check}
            sealText={sealText}
            onDelete={async () => setSealText(await receipt.delete())}
            onAnother={() => {
              setReceipt(null)
              setSealText(null)
            }}
            onClose={() => onOpenChange(false)}
          />
        ) : (
          <motion.div key="form" className="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <label className="field">
              <span className="field-label">{t("form.sentence")}</span>
              <textarea
                value={words}
                rows={3}
                maxLength={400}
                placeholder="Last week in Nashik the RTO asked 700 for a driving licence. I didn't pay."
                onChange={(event) => setWords(event.target.value)}
              />
              <span className="muted small field-note">
                <Lock size={12} /> {t("form.sentenceNote")}
                {filled.length > 0 ? <b className="hit"> Filled: {[...new Set(filled)].join(", ")}.</b> : null}
              </span>
              {findPrivate(words).length > 0 ? (
                <span className="warn small field-note">
                  Taken out of what was read: {removed.join(", ")}.{" "}
                  <button type="button" className="link" onClick={() => setWords(redactText(words).text)}>
                    Remove from the box
                  </button>
                </span>
              ) : null}
            </label>

            <Seg
              label={t("form.what")}
              value={kind}
              onChange={(next) => chooseKind(next as ReportKind)}
              options={KINDS.map((item) => ({ value: item, label: KIND_META[item].label, icon: KIND_META[item].icon }))}
            />
            <p className="muted small tight">{KIND_META[kind].blurb}.</p>

            <div className="two">
              <DistrictPicker
                label={t("form.district")}
                value={district}
                onChange={(nextState, nextDistrict) => {
                  setStateSlug(nextState)
                  setDistrict(nextDistrict)
                }}
              />
              <Pick
                label={kind === "demand" ? t("form.desk") : t("form.whatShort")}
                value={`${department}:${service}`}
                options={deskOptions}
                onChange={(next) => {
                  const [nextDepartment, nextService] = next.split(":")
                  setDepartment(nextDepartment)
                  setService(nextService)
                  setRole(rolesFor(kind, nextDepartment)[0])
                }}
              />
            </div>
            {demand && roles.length > 1 ? (
              <Seg label="Who handled it (role only)" value={role} onChange={setRole} options={roles.map((slug) => ({ value: slug, label: labelize(slug) }))} />
            ) : null}

            {demand ? (
              <div className="field">
                <span className="field-label">{t("form.amount")}</span>
                <div className="chips">
                  {AMOUNTS.map((value) => (
                    <button key={value} type="button" className={Number(amountText) === value ? "chip on" : "chip"} onClick={() => setAmountText(String(value))}>
                      {rupees(value)}
                    </button>
                  ))}
                  <input className="chip-input" inputMode="numeric" aria-label="Amount in rupees" value={amountText} onChange={(event) => setAmountText(event.target.value.replace(/[^\d,]/g, ""))} />
                </div>
              </div>
            ) : (
              <Seg label={t("form.severity")} value={severity} onChange={setSeverity} options={["1", "2", "3", "4", "5"].map((value) => ({ value, label: value }))} />
            )}

            <Seg
              label={t("form.outcome")}
              value={outcome}
              onChange={setOutcome}
              options={(demand ? ["asked", "paid", "refused"] : ["noted", "worsened", "cleared"]).map((value) => ({ value, label: OUTCOME_LABEL[value] ?? value }))}
            />

            <div className="two">
              <Seg
                label={t("form.when")}
                value={weekMode}
                onChange={setWeekMode}
                options={[
                  { value: "0", label: t("form.thisWeek") },
                  { value: "1", label: t("form.lastWeek") },
                  { value: "older", label: t("form.earlier") },
                ]}
              />
              {weekMode === "older" ? (
                <Pick label="How long ago" value={older} onChange={setOlder} options={weeks.slice(2).map((item, index) => ({ value: String(index + 2), label: item.label }))} />
              ) : null}
            </div>

            <aside className="public-box">
              <header>
                <ShieldCheck size={16} /> {t("form.public")}
              </header>
              <p>
                {KIND_META[kind].label} · {labelize(district)}, {state.label} · {departmentLabel(department)}
                {demand ? ` · ${labelize(role)}` : ""} · {labelize(service)} · {OUTCOME_LABEL[outcome]} · {demand ? (Number.isFinite(amount) ? rupees(amount) : "—") : `severity ${amount}`} · {weeks[weekIndex]?.week}
              </p>
              <p className="muted small">{t("form.notStored")}</p>
            </aside>

            <div className="verify">
              <div className="verify-head">
                <span className="verify-title">
                  <MapPin size={16} /> {t("form.loc")}
                </span>
                <Switch.Root className="switch" checked={verify} onCheckedChange={setVerify} aria-label="Check my location">
                  <Switch.Thumb className="switch-thumb" />
                </Switch.Root>
              </div>
              <p className="muted small">
                {verify ? t("form.locOn") : t("form.locOff")}
              </p>
            </div>

            <div className="identity">
              <span className="identity-who">
                {mode === "identity" ? <UserRound size={16} /> : <Wallet size={16} />}
                {mode === "identity" ? (
                  <span>
                    {t("form.asThrowaway")} {address ? <code>{shortAddress(address)}</code> : <span className="muted">(made on your first report)</span>}
                  </span>
                ) : (
                  <span>Reporting from your wallet {connection ? <code>{shortAddress(connection.address)}</code> : <span className="muted">(connects when you file)</span>}</span>
                )}
              </span>
              <span className="identity-actions">
                {mode === "identity" && address ? (
                  <button
                    type="button"
                    className="link"
                    onClick={() => {
                      forgetIdentity()
                      setAddress(null)
                    }}
                  >
                    <RotateCcw size={12} /> {t("form.newIdentity")}
                  </button>
                ) : null}
                <button type="button" className="link" onClick={() => setMode(mode === "identity" ? "wallet" : "identity")}>
                  {mode === "identity" ? t("form.useWallet") : t("form.useThrowaway")}
                </button>
              </span>
            </div>

            {error ? <p className="error" role="alert">{error}</p> : null}
            <button type="button" className="btn primary wide big-btn" disabled={busy} onClick={() => void onFile()}>
              {busy ? <span className="spinner" aria-hidden /> : null}
              {label}
            </button>
            <p className="muted small tight center">{t("form.footnote")}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </Sheet>
  )
}

function Receipt({ receipt, check, sealText, onDelete, onAnother, onClose }: { receipt: SealReceipt; check: Check | null; sealText: string | null; onDelete: () => Promise<void>; onAnother: () => void; onClose: () => void }) {
  const [trying, setTrying] = useState(false)
  return (
    <motion.div key="receipt" className="receipt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="stamp" initial={{ scale: 2.4, opacity: 0, rotate: -24 }} animate={{ scale: 1, opacity: 1, rotate: -8 }} transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }} aria-hidden>
        <span>SEALED</span>
        <small>on Arkiv</small>
      </motion.div>
      <p className="lede">{t("receipt.line")}</p>
      <dl className="facts">
        <div>
          <dt>Entity</dt>
          <dd>
            <a href={entityUrl(receipt.entityKey)} target="_blank" rel="noreferrer">
              {shortAddress(receipt.entityKey)} <ExternalLink size={12} />
            </a>
          </dd>
        </div>
        <div>
          <dt>Transaction</dt>
          <dd>
            <a href={txUrl(receipt.txHash)} target="_blank" rel="noreferrer">
              {shortAddress(receipt.txHash)} <ExternalLink size={12} />
            </a>
          </dd>
        </div>
        <div>
          <dt>$creator</dt>
          <dd>
            <code>{shortAddress(receipt.creator)}</code> <span className="muted small">counts as one wallet</span>
          </dd>
        </div>
        <div>
          <dt>$owner</dt>
          <dd>
            <code>{receipt.owner.toLowerCase() === DEAD.toLowerCase() ? "0x…dEaD" : shortAddress(receipt.owner)}</code> <span className="muted small">nobody holds this key</span>
          </dd>
        </div>
        <div>
          <dt>Location check</dt>
          <dd>
            {check ? (
              <span className={check.ok ? "hit" : "muted"}>
                {check.ok ? "✓ " : ""}
                {check.text}{" "}
                {check.attestationKey ? (
                  <a href={entityUrl(check.attestationKey)} target="_blank" rel="noreferrer">
                    attestation <ExternalLink size={12} />
                  </a>
                ) : null}
              </span>
            ) : (
              <span className="muted">Not requested.</span>
            )}
          </dd>
        </div>
        <div>
          <dt>Leaves queries at block</dt>
          <dd>{receipt.expiresAt.toString()}</dd>
        </div>
      </dl>
      <button
        type="button"
        className="btn ghost wide"
        disabled={trying}
        onClick={async () => {
          setTrying(true)
          await onDelete()
          setTrying(false)
        }}
      >
        <Trash2 size={16} /> {trying ? "…" : t("receipt.delete")}
      </button>
      {sealText ? (
        <motion.pre initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="revert">
          {sealText}
        </motion.pre>
      ) : null}
      <div className="two">
        <button type="button" className="btn" onClick={onAnother}>
          {t("receipt.another")}
        </button>
        <button type="button" className="btn primary" onClick={onClose}>
          {t("receipt.back")}
        </button>
      </div>
    </motion.div>
  )
}
