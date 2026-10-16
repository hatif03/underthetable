// Builds the two boundary-derived files from DataMeet's state boundaries (CC BY 4.0, DataMeet India community):
//   src/lib/indiaDots.ts      the dot map on the Pulse page
//   server/geo/states.json    simplified polygons the location check uses on the server
// Usage: node scripts/build-geo.mjs [path-to-states.geojson]
// Without an argument the file is downloaded. It is parsed as JSON and never executed.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"

const URL = "https://raw.githubusercontent.com/datameet/maps/master/website/docs/data/geojson/states.geojson"
const SLUG = {
  "Andaman & Nicobar Island": "an", "Andhra Pradesh": "ap", "Arunanchal Pradesh": "ar", Assam: "as", Bihar: "br",
  Chandigarh: "ch", Chhattisgarh: "ct", "Dadara & Nagar Havelli": "dn", "Daman & Diu": "dn", Goa: "ga", Gujarat: "gj",
  Haryana: "hr", "Himachal Pradesh": "hp", "Jammu & Kashmir": "jk", Jharkhand: "jh", Karnataka: "ka", Kerala: "kl",
  Lakshadweep: "ld", "Madhya Pradesh": "mp", Maharashtra: "mh", Manipur: "mn", Meghalaya: "ml", Mizoram: "mz",
  Nagaland: "nl", "NCT of Delhi": "dl", Puducherry: "py", Punjab: "pb", Rajasthan: "rj", Sikkim: "sk", "Tamil Nadu": "tn",
  Telangana: "tg", Tripura: "tr", "Uttar Pradesh": "up", Uttarakhand: "uk", "West Bengal": "wb", Odisha: "or",
}
// The source has one Jammu & Kashmir polygon. The dot map splits Ladakh off it with a rough line. It is a drawing, not a boundary.
const isLadakh = (lon, lat) => lon >= 75.8 || (lon >= 75.4 && lat >= 34.6)

const raw = process.argv[2] ? readFileSync(process.argv[2], "utf8") : await (await fetch(URL)).text()
const geo = JSON.parse(raw)

function dp(points, tol) {
  if (points.length < 3) return points
  const [ax, ay] = points[0]
  const [bx, by] = points[points.length - 1]
  const len = Math.hypot(bx - ax, by - ay) || 1e-9
  let worst = 0
  let at = 0
  for (let i = 1; i < points.length - 1; i++) {
    const d = Math.abs((by - ay) * points[i][0] - (bx - ax) * points[i][1] + bx * ay - by * ax) / len
    if (d > worst) { worst = d; at = i }
  }
  if (worst <= tol) return [points[0], points[points.length - 1]]
  return [...dp(points.slice(0, at + 1), tol).slice(0, -1), ...dp(points.slice(at), tol)]
}

// A closed ring starts and ends at one point, so split it at the farthest vertex first.
function simplifyRing(ring, tol) {
  let far = 0
  let best = 0
  for (let i = 1; i < ring.length; i++) {
    const d = Math.hypot(ring[i][0] - ring[0][0], ring[i][1] - ring[0][1])
    if (d > best) { best = d; far = i }
  }
  if (far === 0) return ring
  return [...dp(ring.slice(0, far + 1), tol).slice(0, -1), ...dp(ring.slice(far), tol)]
}

const polys = [] // { slug, rings: [[lon,lat]...] } one ring per polygon, holes ignored
for (const feature of geo.features) {
  const slug = SLUG[feature.properties.ST_NM]
  if (!slug) throw new Error(`unmapped state ${feature.properties.ST_NM}`)
  const list = feature.geometry.type === "Polygon" ? [feature.geometry.coordinates] : feature.geometry.coordinates
  for (const polygon of list) polys.push({ slug, ring: simplifyRing(polygon[0], 0.02) })
}

function inRing(x, y, ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

// Dots
const X0 = 68, X1 = 97.6, Y0 = 6.4, Y1 = 37.2, DX = 0.56, DY = 0.5
const cols = Math.ceil((X1 - X0) / DX)
const rows = Math.ceil((Y1 - Y0) / DY)
const cell = new Map()
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const lon = X0 + (c + 0.5) * DX
    const lat = Y1 - (r + 0.5) * DY
    const hit = polys.find((p) => inRing(lon, lat, p.ring))
    if (!hit) continue
    cell.set(`${c},${r}`, hit.slug === "jk" && isLadakh(lon, lat) ? "la" : hit.slug)
  }
}
// Small states and territories can fall between dots. Give each one the dot nearest its centre.
const centre = {}
for (const p of polys) {
  const xs = p.ring.map((q) => q[0])
  const ys = p.ring.map((q) => q[1])
  const area = (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys))
  if (!centre[p.slug] || area > centre[p.slug].area) centre[p.slug] = { area, lon: (Math.min(...xs) + Math.max(...xs)) / 2, lat: (Math.min(...ys) + Math.max(...ys)) / 2 }
}
for (const slug of ["ch", "dl", "ga", "dn", "py", "ld", "an", "sk", "tr", "ml", "mz", "nl", "mn"]) {
  if ([...cell.values()].filter((value) => value === slug).length >= 1) continue
  const { lon, lat } = centre[slug]
  const c = Math.min(cols - 1, Math.max(0, Math.floor((lon - X0) / DX)))
  const r = Math.min(rows - 1, Math.max(0, Math.floor((Y1 - lat) / DY)))
  cell.set(`${c},${r}`, slug)
}
const dots = [...cell.entries()].map(([key, slug]) => [...key.split(",").map(Number), slug])
const cent = {}
for (const [c, r, slug] of dots) {
  cent[slug] ??= [0, 0, 0]
  cent[slug][0] += c
  cent[slug][1] += r
  cent[slug][2] += 1
}
const centroids = Object.fromEntries(Object.entries(cent).map(([slug, [x, y, n]]) => [slug, [+(x / n).toFixed(1), +(y / n).toFixed(1)]]))

const lines = [
  "// Generated by scripts/build-geo.mjs from DataMeet India state boundaries (CC BY 4.0, https://github.com/datameet/maps).",
  "// One dot per half degree inside India. The Ladakh split is a drawing, not a boundary. Do not edit.",
  `export const DOT_COLS = ${cols}`,
  `export const DOT_ROWS = ${rows}`,
  `export const DOT_GEO = ${JSON.stringify({ x0: X0, y1: Y1, dx: DX, dy: DY })}`,
  `export const DOTS: [col: number, row: number, state: string][] = ${JSON.stringify(dots)}`,
  `export const CENTROIDS: Record<string, [number, number]> = ${JSON.stringify(centroids)}`,
  "",
]
writeFileSync("src/lib/indiaDots.ts", lines.join("\n"))

// Server polygons, rounded to 3 decimals. Ladakh shares the Jammu & Kashmir polygon.
mkdirSync("server/geo", { recursive: true })
const out = polys.map((p) => ({ state: p.slug, ring: p.ring.map(([x, y]) => [+x.toFixed(3), +y.toFixed(3)]) }))
writeFileSync("server/geo/states.json", JSON.stringify({ source: "DataMeet India, CC BY 4.0", polygons: out }))
console.log(`dots ${dots.length}, grid ${cols}x${rows}, polygons ${out.length}, points ${out.reduce((n, p) => n + p.ring.length, 0)}`)
console.log("states with dots", Object.keys(centroids).length, "missing", Object.values(SLUG).filter((s) => !centroids[s] && s !== "la").join(",") || "none", "la" in centroids ? "la ok" : "la MISSING")
