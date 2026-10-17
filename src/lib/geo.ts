import districts from "../../data/districts.json"
import { CENTROIDS, DOTS, DOT_GEO } from "./indiaDots"

export type Coarse = { lat: number; lon: number }

/** About 5 km. The browser rounds before anything leaves the device. */
const STEP = 0.05

/** One position fix, rounded on the device. Rejects with a sentence a person can act on. */
export function coarsePosition(): Promise<Coarse> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("This browser cannot share a location."))
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: Math.round(pos.coords.latitude / STEP) * STEP,
          lon: Math.round(pos.coords.longitude / STEP) * STEP,
        }),
      (error) =>
        reject(
          new Error(
            error.code === error.PERMISSION_DENIED
              ? "Location was not shared, so the report will not be location-checked."
              : "Your location could not be read, so the report will not be location-checked.",
          ),
        ),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    )
  })
}

/** Which state a point is in, from the half-degree dot grid. Good enough to warn about a wrong state, not to prove one. */
export function stateAt({ lat, lon }: Coarse): string | null {
  const col = Math.floor((lon - DOT_GEO.x0) / DOT_GEO.dx)
  const row = Math.floor((DOT_GEO.y1 - lat) / DOT_GEO.dy)
  const hit = DOTS.find(([c, r]) => c === col && r === row)
  return hit ? hit[2] : null
}

/** Is a point in, or one dot (about 50 km) from, the state? Used to refuse a pin that is nowhere near its state. */
export function nearState(point: Coarse, state: string): boolean {
  for (const dLat of [-DOT_GEO.dy, 0, DOT_GEO.dy]) {
    for (const dLon of [-DOT_GEO.dx, 0, DOT_GEO.dx]) {
      const here = stateAt({ lat: point.lat + dLat, lon: point.lon + dLon })
      if (here && sameArea(here, state)) return true
    }
  }
  return false
}

/** Ladakh is drawn apart from Jammu and Kashmir, but the location check treats them as one area. */
export function sameArea(a: string, b: string): boolean {
  const pair = new Set(["jk", "la"])
  return a === b || (pair.has(a) && pair.has(b))
}

export function stateName(slug: string): string {
  return districts.states.find((item) => item.slug === slug)?.label ?? slug
}

/** The middle of a state on the map, to open a pin map somewhere sensible. About 50 km accurate. */
export function stateCenter(state: string): Coarse {
  const dot = CENTROIDS[state] ?? CENTROIDS.mh
  return { lon: DOT_GEO.x0 + (dot[0] + 0.5) * DOT_GEO.dx, lat: DOT_GEO.y1 - (dot[1] + 0.5) * DOT_GEO.dy }
}
