import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { ExternalLink, Search } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { entityUrl } from "../lib/client"
import { isDemoWallet } from "../lib/demo"
import { stateLabel } from "../lib/derive"
import { shortAddress } from "../lib/format"
import { t } from "../lib/i18n"
import { departmentLabel, labelize } from "../lib/labels"
import { fetchInBox } from "../lib/query"
import type { ReportRow } from "../lib/aggregate"
import { setShowDemo } from "../state/store"
import type { Live } from "../state/useDerived"
import { PotholeCar } from "../ui/illustrations"
import { CopyLine } from "../ui/kit"
import type { Prefill } from "./Pulse"

function marker(row: ReportRow): L.Marker {
  const severity = Math.min(5, Math.max(1, row.amountInr))
  const icon = L.divIcon({ className: "pin-wrap", html: `<span class="pin sev-${severity}"></span>`, iconSize: [28, 28], iconAnchor: [14, 26] })
  const node = document.createElement("div")
  node.className = "pin-pop"
  const title = document.createElement("strong")
  title.textContent = `${departmentLabel(row.department)} · ${labelize(row.service)}`
  const line = document.createElement("div")
  line.textContent = `${labelize(row.district)}, ${stateLabel(row.state)} · ${row.week} · severity ${row.amountInr}${isDemoWallet(row.creator) ? " · demo" : ""}`
  const link = document.createElement("a")
  link.href = entityUrl(row.key)
  link.target = "_blank"
  link.rel = "noreferrer"
  link.textContent = `${shortAddress(row.creator)} on the explorer`
  node.append(title, line, link)
  return L.marker([row.lat as number, row.lon as number], { icon }).bindPopup(node)
}

/** Pinned public-infrastructure problems on a street map, and the Arkiv range query behind "this view". */
export function MapView({ live, closed, onReport }: { live: Live; closed: boolean; onReport: (prefill?: Prefill) => void }) {
  const host = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const layer = useRef<L.LayerGroup | null>(null)
  const [found, setFound] = useState<{ count: number; query: string; block: bigint } | null>(null)
  const [reading, setReading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pinned = live.d.pinned

  useEffect(() => {
    if (!host.current || map.current) return
    const instance = L.map(host.current).setView([22.5, 79], 5)
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap contributors" }).addTo(instance)
    layer.current = L.layerGroup().addTo(instance)
    map.current = instance
    return () => {
      instance.remove()
      map.current = null
      layer.current = null
    }
  }, [])

  useEffect(() => {
    if (!map.current || !layer.current) return
    layer.current.clearLayers()
    for (const row of pinned) marker(row).addTo(layer.current)
    if (pinned.length > 0) map.current.fitBounds(L.latLngBounds(pinned.map((row) => [row.lat as number, row.lon as number] as [number, number])).pad(0.5), { maxZoom: 15 })
  }, [pinned])

  async function searchHere() {
    if (!map.current) return
    setReading(true)
    setError(null)
    try {
      const b = map.current.getBounds()
      const result = await fetchInBox({ south: b.getSouth(), west: b.getWest(), north: b.getNorth(), east: b.getEast() })
      const rows = result.rows.filter((row) => live.store.showDemo || !isDemoWallet(row.creator))
      layer.current?.clearLayers()
      for (const row of rows) marker(row).addTo(layer.current as L.LayerGroup)
      setFound({ count: rows.length, query: result.query, block: result.blockNumber })
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setReading(false)
    }
  }

  return (
    <div className="stack tight">
      <header className="section-head">
        <h2>{t("map.heading")}</h2>
        <p className="muted small">
          Broken roads, lights, drains and garbage that people pinned to the exact place. Only public infrastructure can carry a pin. A bribe, a detention or a shutdown never does: an exact place and a week could identify a person.
        </p>
      </header>
      <div className="mapframe">
        <div ref={host} className="bigmap" role="application" aria-label="Map of pinned problems" />
        {pinned.length === 0 ? (
          <div className="map-empty card">
            <PotholeCar />
            <p>No pinned problem to show yet.</p>
            <p className="muted small">
              {live.store.showDemo ? "Be the first to pin one." : `The only pins on Arkiv today are synthetic demo rows, which are hidden.`}
            </p>
            <span className="map-empty-actions">
              {live.store.showDemo ? null : (
                <button type="button" className="btn ghost compact" onClick={() => setShowDemo(true)}>
                  Show the demo pin
                </button>
              )}
              {closed ? null : (
                <button type="button" className="btn primary compact" onClick={() => onReport({ kind: "failure", state: "mh", district: "nashik", department: "municipal", service: "pothole" })}>
                  Pin a pothole
                </button>
              )}
            </span>
          </div>
        ) : null}
      </div>
      <div className="card box-card">
        <div className="box-head">
          <button type="button" className="btn" onClick={() => void searchHere()} disabled={reading}>
            <Search size={14} /> {reading ? "Asking Arkiv…" : "Search this view on Arkiv"}
          </button>
          <span className="muted small">
            {error
              ? error
              : found
                ? `Arkiv returned ${found.count} pinned problem${found.count === 1 ? "" : "s"} in this view at block ${found.block.toLocaleString("en-IN")}.`
                : "Four range predicates on the i32 attributes lat_e5 and lon_e5 answer \"what is inside this rectangle\" without downloading the rest."}
          </span>
        </div>
        {found ? <CopyLine text={found.query} /> : null}
        <p className="muted small">
          <ExternalLink size={12} /> Street map data © OpenStreetMap contributors. The map tiles are fetched from OpenStreetMap by your browser; nothing about a report is sent to it.
        </p>
      </div>
    </div>
  )
}
