import { Lock, MapPin } from "lucide-react"
import { lazy, Suspense, useEffect, useMemo, useState } from "react"
import { measure } from "../lib/format"
import { departmentLabel, labelize } from "../lib/labels"
import type { Live } from "../state/useDerived"
import { GameErrorBoundary } from "../scene/game/GameErrorBoundary"
import { setPublicLine } from "../scene/lib/events"

// Phaser is about 1.2 MB. It loads only when this tab opens, so the Pulse stays light.
const PhaserGame = lazy(() => import("../scene/game/PhaserGame"))

const FALLBACK = [
  "A figure is quoted after 3 different wallets.",
  "Nobody here has a name. Only the district, the desk and the week.",
  "Once a report is sealed, not even the office can take it down.",
]

/** The public office. Its residents repeat figures that are already on Tiramisu, never what anyone typed. */
export function Office({ live, onDistrict }: { live: Live; onDistrict: (district: string) => void }) {
  const lines = useMemo(() => {
    const fromDesks = live.d.quoted.map((desk) => ({
      district: desk.district,
      text: `${labelize(desk.district)} · ${departmentLabel(desk.department)} · ${labelize(desk.service)} · ${measure(desk.kind, desk.medianInr ?? 0)} · ${desk.voices} wallets`,
    }))
    return fromDesks.length > 0 ? fromDesks : FALLBACK.map((text) => ({ district: null as string | null, text }))
  }, [live.d.quoted])
  const [index, setIndex] = useState(0)
  const [art, setArt] = useState<"checking" | "yes" | "no">("checking")

  // The team holds the LimeZu licence (docs/assets.md). If the files are missing from a checkout, show a note, not a broken canvas.
  useEffect(() => {
    fetch("/characters/Premade_Character_48x48_02.png", { method: "HEAD" })
      .then((response) => setArt(response.ok && (response.headers.get("content-type") ?? "").startsWith("image/") ? "yes" : "no"))
      .catch(() => setArt("no"))
  }, [])

  useEffect(() => {
    const line = lines[index % lines.length]
    setPublicLine(line.text)
    const timer = window.setTimeout(() => setIndex((current) => current + 1), 7000)
    return () => window.clearTimeout(timer)
  }, [index, lines])

  const current = lines[index % lines.length]
  return (
    <div className="stack tight">
      <header className="section-head">
        <h2>The office</h2>
        <p className="muted small">
          A made-up public office. The people in it are not real, and the desks are not real offices. Tap a figure to hear a line that is already on the board.
        </p>
      </header>
      <div className="stage" aria-label="Pixel office">
        {art === "yes" ? (
          <GameErrorBoundary>
            <Suspense fallback={<div className="skeleton stage-fill" />}>
              <PhaserGame />
            </Suspense>
          </GameErrorBoundary>
        ) : art === "no" ? (
          <div className="stage-fill stage-missing">
            <Lock size={20} />
            <p>The office art files are missing from this checkout. They are LimeZu's, licensed to the team. See docs/assets.md.</p>
          </div>
        ) : (
          <div className="skeleton stage-fill" />
        )}
      </div>
      <div className="card office-line" aria-live="polite">
        <span>{current.text}</span>
        {current.district ? (
          <button type="button" className="btn ghost compact" onClick={() => onDistrict(current.district as string)}>
            <MapPin size={14} /> Open {labelize(current.district)}
          </button>
        ) : null}
      </div>
      <p className="muted small">Art: LimeZu, Modern Interiors and Modern Office series (itch.io), used under the team's licence, credited here as the licence asks. Office scene code adapted from an MIT-licensed project, see THIRD_PARTY_NOTICES.md and docs/assets.md.</p>
    </div>
  )
}
