import * as Tabs from "@radix-ui/react-tabs"
import * as Tooltip from "@radix-ui/react-tooltip"
import { Plus, RefreshCw } from "lucide-react"
import { lazy, Suspense, useEffect, useState } from "react"
import { ago } from "./lib/derive"
import { setLang, t, useLang } from "./lib/i18n"
import { reload, setDirect, start } from "./state/store"
import { useLive } from "./state/useDerived"
import { DistrictSheet } from "./views/DistrictSheet"
import { FileSheet } from "./views/FileSheet"
import { Office } from "./views/Office"
import { Palette } from "./views/Palette"
import { Pulse, type Prefill } from "./views/Pulse"
import { Record } from "./views/Record"
import { Sealed } from "./views/Sealed"

// Leaflet is only downloaded when the map tab is opened.
const MapView = lazy(() => import("./views/MapView").then((m) => ({ default: m.MapView })))

const closed = new URLSearchParams(window.location.search).get("mode") === "closed"
const VIEWS = ["pulse", "map", "office", "record", "sealed"] as const
type View = (typeof VIEWS)[number]

function viewFromHash(): View {
  const hash = window.location.hash.replace("#", "")
  return (VIEWS as readonly string[]).includes(hash) ? (hash as View) : "pulse"
}

export function App() {
  const live = useLive()
  const lang = useLang()
  const [view, setView] = useState<View>(viewFromHash)
  const [district, setDistrict] = useState<string | null>(null)
  const [palette, setPalette] = useState(false)
  const [filing, setFiling] = useState(false)
  const [prefill, setPrefill] = useState<Prefill | undefined>()

  useEffect(() => {
    start()
    const onHash = () => setView(viewFromHash())
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setPalette((open) => !open)
      }
    }
    window.addEventListener("hashchange", onHash)
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("hashchange", onHash)
      window.removeEventListener("keydown", onKey)
    }
  }, [])

  function go(next: View) {
    window.location.hash = next === "pulse" ? "" : next
    setView(next)
    window.scrollTo({ top: 0 })
  }

  function report(next?: Prefill) {
    setPrefill(next)
    setDistrict(null)
    setFiling(true)
  }

  const { store, now } = live
  const board = store.board
  const age = board ? Math.max(0, (now - board.savedAt) / 1000) : null

  return (
    <Tooltip.Provider>
      <Tabs.Root value={view} onValueChange={(next) => go(next as View)} className="shell">
        <header className="top">
          <a className="brand" href="#" onClick={(event) => { event.preventDefault(); go("pulse") }}>
            <i aria-hidden /> under the table
          </a>
          <Tabs.List className="nav" aria-label="Views">
            <Tabs.Trigger value="pulse">{t("nav.pulse")}</Tabs.Trigger>
            <Tabs.Trigger value="map">{t("nav.map")}</Tabs.Trigger>
            <Tabs.Trigger value="office">{t("nav.office")}</Tabs.Trigger>
            <Tabs.Trigger value="record">{t("nav.record")}</Tabs.Trigger>
            <Tabs.Trigger value="sealed">{t("nav.sealed")}</Tabs.Trigger>
          </Tabs.List>
          <div className="top-right">
            <button type="button" className="pill lang" aria-label="Language" onClick={() => setLang(lang === "en" ? "hi" : "en")}>
              {lang === "en" ? "हिन्दी" : "English"}
            </button>
            <span className={`pill ${store.status === "stale" ? "warn" : ""}`} title="Tiramisu, chain 7738577">
              <i className={store.live === "on" && store.status !== "stale" ? "live-dot" : "dot"} aria-hidden />
              {board ? `block ${board.blockNumber.toLocaleString("en-IN")}` : "reading"}
            </span>
            {closed ? (
              <span className="pill" title="Submissions are closed. The board still reads the chain.">{t("nav.closed")}</span>
            ) : (
              <button type="button" className="btn primary compact" onClick={() => report()}>
                <Plus size={16} /> {t("nav.report")}
              </button>
            )}
          </div>
        </header>

        {store.error ? (
          <div className="banner" role="status">
            <span>
              {board ? `Showing the last read, ${ago(age ?? 0)}. ` : ""}
              {store.error}
            </span>
            <button type="button" className="link" onClick={() => void reload()}>
              <RefreshCw size={12} /> Try again
            </button>
          </div>
        ) : null}

        <main>
          <Tabs.Content value="pulse" tabIndex={-1}>
            <Pulse live={live} closed={closed} onSearch={() => setPalette(true)} onDistrict={setDistrict} onReport={report} />
          </Tabs.Content>
          <Tabs.Content value="map" tabIndex={-1}>
            {view === "map" ? (
              <Suspense fallback={<p className="muted">Loading the map…</p>}>
                <MapView live={live} closed={closed} onReport={report} />
              </Suspense>
            ) : null}
          </Tabs.Content>
          <Tabs.Content value="office" tabIndex={-1}>
            {view === "office" ? <Office live={live} onDistrict={setDistrict} /> : null}
          </Tabs.Content>
          <Tabs.Content value="record" tabIndex={-1}>
            <Record live={live} onDistrict={setDistrict} />
          </Tabs.Content>
          <Tabs.Content value="sealed" tabIndex={-1}>
            <Sealed live={live} />
          </Tabs.Content>
        </main>

        <footer className="foot">
          <span>Citizen reports, not findings. A district or desk named here is not an accusation against any person or office.</span>
          <span>
            {board ? `Read from Tiramisu ${ago(age ?? 0)}${board.via === "snapshot" ? ", through our snapshot cache" : ", directly"}. ` : ""}
            {board ? (
              <button type="button" className="link" onClick={() => setDirect(!store.direct)}>
                {store.direct ? "Use the snapshot cache" : "Read directly instead"}
              </button>
            ) : null}
          </span>
        </footer>
      </Tabs.Root>

      <Palette open={palette} onOpenChange={setPalette} live={live} closed={closed} onDistrict={setDistrict} onReport={report} />
      <DistrictSheet live={live} district={district} closed={closed} onClose={() => setDistrict(null)} onReport={report} />
      {closed ? null : <FileSheet open={filing} onOpenChange={setFiling} prefill={prefill} />}
    </Tooltip.Provider>
  )
}
