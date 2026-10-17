import { AnimatePresence, motion } from "motion/react"
import * as Switch from "@radix-ui/react-switch"
import { ExternalLink, Lock, MapPin, ShieldCheck, Trash2 } from "lucide-react"
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react"
import districts from "../../data/districts.json"
import vocab from "../../data/vocab.json"
import { proveHuman } from "../lib/human"
import type { Pin } from "../ui/PinPicker"
import type { ReportRow } from "../lib/aggregate"
import { DEAD, entityUrl, makePublicClient, txUrl } from "../lib/client"
import { findPrivate, KINDS, redactText, sealReport, type ReportKind } from "../lib/guard"
import { departmentLabel, labelize } from "../lib/labels"
import { currentAddress, forgetIdentity, fundIdentity, getIdentity } from "../lib/identity"
import { departmentsFor, guess, rolesFor, servicesFor } from "../lib/parse"
import { rupees, shortAddress } from "../lib/format"
import { requestAttestation } from "../lib/attest"
import { coarsePosition, sameArea, stateAt, stateName, type Coarse } from "../lib/geo"
import { assertSameAccount, connectWallet, type Connection } from "../lib/wallet"
import { kolkataDay, weekChoices } from "../lib/week"
import { fileAsIdentity, fileReport, tryDelete, type SealReceipt } from "../lib/write"
import { addRow, reload } from "../state/store"
import { DistrictPicker } from "../ui/DistrictPicker"
import { FAUCET_URL, glm, MIN_WALLET_GLM, Reporter, walletProblem, type Who } from "../ui/Reporter"
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

type Phase = "idle" | "locating" | "human" | "gas" | "sealing" | "checking"
type Check = { ok: boolean; text: string; attestationKey?: string }

// The map is only downloaded when someone is reporting a pinnable problem.
const PinPicker = lazy(() => import("../ui/PinPicker"))
const GEO = (vocab as { geoServices?: Record<string, string[]> }).geoServices ?? {}

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
  // A wallet is the main path. A person with no wallet extension starts on the one-tap key.
  const [mode, setMode] = useState<Who>(() => {
    try {
      const saved = localStorage.getItem("utt:who")
      if (saved === "wallet" || saved === "identity") return saved === "wallet" && !window.ethereum ? "identity" : saved
    } catch {
      // no saved choice
    }
    return window.ethereum ? "wallet" : "identity"
  })
  const [balance, setBalance] = useState<bigint | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [connection, setConnection] = useState<Connection | null>(null)
  const [address, setAddress] = useState(currentAddress())
  const [pin, setPin] = useState<Pin | null>(null)
  const [human, setHuman] = useState<string | null>(null)
  const humanSlot = useRef<HTMLDivElement>(null)

  function chooseWho(next: Who) {
    setMode(next)
    setError(null)
    try {
      localStorage.setItem("utt:who", next)
    } catch {
      // remembering the choice is a convenience
    }
  }

  async function connect() {
    setError(null)
    setConnecting(true)
    try {
      if (!window.ethereum) throw new Error("No wallet found in this browser. Install a wallet extension, or use the one-tap key.")
      const wallet = await connectWallet(window.ethereum)
      setConnection(wallet)
      setBalance(await makePublicClient().getBalance({ address: wallet.address }).catch(() => null))
    } catch (problem) {
      setError(walletProblem(problem))
    } finally {
      setConnecting(false)
    }
  }

  // A wallet that switches account or network is a different reporter: connect again.
  useEffect(() => {
    const provider = window.ethereum
    if (!provider?.on) return
    const drop = () => {
      setConnection(null)
      setBalance(null)
    }
    provider.on("accountsChanged", drop)
    provider.on("chainChanged", drop)
  }, [])

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
  const pinnable = kind === "failure" && Boolean(GEO[department]?.includes(service))
  const geo = pinnable ? (pin ?? undefined) : undefined

  const deskOptions = departmentsFor(kind).flatMap((item) =>
    servicesFor(kind, item.slug).map((slug) => ({ value: `${item.slug}:${slug}`, label: labelize(slug), group: departmentLabel(item.slug) })),
  )

  async function onFile() {
    setError(null)
    setHuman(null)
    let sealed
    try {
      sealed = sealReport({ state: stateSlug, district, department, role, service, outcome, amountInr: amount, day: weeks[weekIndex].day, today, kind, geo })
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
        // Only the faucet needs a person; a wallet that already holds test GLM skips this.
        setPhase("human")
        const proof = await proveHuman(humanSlot.current)
        setHuman(proof.label)
        setPhase("gas")
        await fundIdentity(identity.address, proof)
        setPhase("sealing")
        filed = await fileAsIdentity(identity.client as Connection["client"], sealed)
        signer = identity.client as unknown as typeof signer
        remove = () => tryDelete(identity.client as Connection["client"], filed.entityKey)
      } else {
        let wallet = connection
        if (!wallet) {
          if (!window.ethereum) throw new Error("This browser has no wallet. Use the one-tap key instead.")
          wallet = await connectWallet(window.ethereum)
          setConnection(wallet)
        }
        await assertSameAccount(wallet)
        // The balance check is a courtesy. If the public node will not answer it, let the wallet decide.
        const held = await makePublicClient().getBalance({ address: wallet.address }).catch(() => null)
        setBalance(held)
        if (held !== null && held < MIN_WALLET_GLM) {
          throw new Error(`This wallet holds ${glm(held)} test GLM, too little to pay for a report. Get test GLM at ${FAUCET_URL} and try again.`)
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
        lat: sealed.lat_e5 === undefined ? undefined : sealed.lat_e5 / 100_000,
        lon: sealed.lon_e5 === undefined ? undefined : sealed.lon_e5 / 100_000,
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
      setPin(null)
      setSealText(null)
      setWords("")
      setFilled([])
      addRow(row)
      window.setTimeout(() => void reload(), check?.ok ? 3000 : 6000)
    } catch (problem) {
      setError(walletProblem(problem))
    } finally {
      setPhase("idle")
    }
  }

  const busy = phase !== "idle"
  const label = { idle: t("form.file"), locating: t("form.locating"), human: t("human.title"), gas: t("form.gas"), sealing: t("form.sealing"), checking: t("form.checking") }[phase]

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
            human={human}
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

            {pinnable ? (
              <div className="field">
                <span className="field-label">{t("pin.title")} <span className="muted small">(optional)</span></span>
                <Suspense fallback={<div className="pinmap" />}>
                  <PinPicker key={`${stateSlug}:${district}`} value={pin} onChange={setPin} state={stateSlug} />
                </Suspense>
                <span className="muted small field-note">
                  <MapPin size={12} /> {t("pin.hint")}
                </span>
              </div>
            ) : null}

            <aside className="public-box">
              <header>
                <ShieldCheck size={16} /> {t("form.public")}
              </header>
              <p>
                {KIND_META[kind].label} · {labelize(district)}, {state.label} · {departmentLabel(department)}
                {demand ? ` · ${labelize(role)}` : ""} · {labelize(service)} · {OUTCOME_LABEL[outcome]} · {demand ? (Number.isFinite(amount) ? rupees(amount) : "—") : `severity ${amount}`} · {weeks[weekIndex]?.week}
                {geo ? ` · pin ${geo.lat.toFixed(5)}, ${geo.lon.toFixed(5)}` : ""}
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

            <Reporter
              who={mode}
              onWho={chooseWho}
              connection={connection}
              balance={balance}
              connecting={connecting}
              onConnect={() => void connect()}
              onDisconnect={() => {
                setConnection(null)
                setBalance(null)
              }}
              identity={address}
              onNewIdentity={() => {
                forgetIdentity()
                setAddress(null)
              }}
              hasProvider={Boolean(window.ethereum)}
            />

            <div id="human-slot" ref={humanSlot} hidden />
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

function Receipt({ receipt, check, human, sealText, onDelete, onAnother, onClose }: { receipt: SealReceipt; check: Check | null; human: string | null; sealText: string | null; onDelete: () => Promise<void>; onAnother: () => void; onClose: () => void }) {
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
          <dt>Human check</dt>
          <dd>{human ? <span className="hit">✓ {human}</span> : <span className="muted">Not needed: your own wallet paid its own gas.</span>}</dd>
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
