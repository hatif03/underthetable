import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { LocateFixed } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { stateCenter } from "../lib/geo"
import { t } from "../lib/i18n"

export type Pin = { lat: number; lon: number }

const round = (n: number) => Math.round(n * 100_000) / 100_000

function pinIcon() {
  return L.divIcon({ className: "pin-wrap", html: '<span class="pin pin-pick"></span>', iconSize: [28, 28], iconAnchor: [14, 26] })
}

/**
 * A small map with one draggable pin. Tiles come from OpenStreetMap, so the browser asks that server for the
 * tiles around the pin. Nothing about the report is sent to it. The pin is the place of the problem, not of the person.
 */
export default function PinPicker({ value, onChange, state }: { value: Pin | null; onChange: (pin: Pin | null) => void; state: string }) {
  const host = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const marker = useRef<L.Marker | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!host.current || map.current) return
    const centre = value ?? stateCenter(state)
    const instance = L.map(host.current, { zoomControl: true, attributionControl: true }).setView([centre.lat, centre.lon], value ? 17 : 7)
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, referrerPolicy: "origin", attribution: "© OpenStreetMap contributors" }).addTo(instance)
    map.current = instance
    const place = (lat: number, lon: number) => {
      const next = { lat: round(lat), lon: round(lon) }
      if (marker.current) marker.current.setLatLng([next.lat, next.lon])
      else {
        marker.current = L.marker([next.lat, next.lon], { draggable: true, icon: pinIcon() }).addTo(instance)
        marker.current.on("dragend", () => {
          const at = marker.current?.getLatLng()
          if (at) onChange({ lat: round(at.lat), lon: round(at.lng) })
        })
      }
      onChange(next)
    }
    instance.on("click", (event: L.LeafletMouseEvent) => place(event.latlng.lat, event.latlng.lng))
    if (value) place(value.lat, value.lon)
    return () => {
      instance.remove()
      map.current = null
      marker.current = null
    }
    // the map is created once; later changes arrive through the buttons below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function here() {
    setError(null)
    if (!navigator.geolocation) return setError("This browser cannot share a location.")
    setBusy(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBusy(false)
        const next = { lat: round(pos.coords.latitude), lon: round(pos.coords.longitude) }
        map.current?.setView([next.lat, next.lon], 18)
        if (marker.current) marker.current.setLatLng([next.lat, next.lon])
        else {
          marker.current = L.marker([next.lat, next.lon], { draggable: true, icon: pinIcon() }).addTo(map.current as L.Map)
          marker.current.on("dragend", () => {
            const at = marker.current?.getLatLng()
            if (at) onChange({ lat: round(at.lat), lon: round(at.lng) })
          })
        }
        onChange(next)
      },
      () => {
        setBusy(false)
        setError("Your location was not shared. Tap the map to drop the pin instead.")
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 0 },
    )
  }

  return (
    <div className="pinpicker">
      <div ref={host} className="pinmap" role="application" aria-label="Map to place the pin" />
      <div className="pin-actions">
        <button type="button" className="btn ghost compact" onClick={here} disabled={busy}>
          <LocateFixed size={14} /> {busy ? "…" : t("pin.use")}
        </button>
        {value ? (
          <>
            <code>
              {value.lat.toFixed(5)}, {value.lon.toFixed(5)}
            </code>
            <button
              type="button"
              className="link"
              onClick={() => {
                marker.current?.remove()
                marker.current = null
                onChange(null)
              }}
            >
              Remove the pin
            </button>
          </>
        ) : (
          <span className="muted small">{t("pin.none")}</span>
        )}
      </div>
      {error ? <p className="error small">{error}</p> : null}
    </div>
  )
}
