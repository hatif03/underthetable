/**
 * Small animated drawings, original to this project, one per kind of report. Plain SVG driven by CSS
 * keyframes (see "Illustrations" in styles.css): no library, no image files, and they stop under
 * prefers-reduced-motion. They take their colour from the page, so they follow light and dark.
 */
type Props = { className?: string; label?: string }

function Frame({ children, label, className }: Props & { children: React.ReactNode }) {
  return (
    <svg className={`ill ${className ?? ""}`} viewBox="0 0 120 90" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  )
}

/** A demand: an envelope slides under the table while the ledger on top stays clean. */
export function EnvelopeUnderTable({ className, label }: Props) {
  return (
    <Frame className={className} label={label}>
      <path d="M14 42h92" />
      <path d="M24 42v36M96 42v36" />
      <rect x="40" y="26" width="30" height="16" rx="2" className="soft" />
      <path d="M45 32h20M45 37h14" className="faint" />
      <g className="ill-envelope">
        <rect x="14" y="58" width="22" height="14" rx="2" className="acc" />
        <path d="M14 59l11 8 11-8" className="acc" />
      </g>
      <circle cx="90" cy="30" r="5" className="faint" />
      <path d="M83 42v-5a7 7 0 0 1 14 0v5" className="faint" />
    </Frame>
  )
}

/** A failure: a car goes over a pothole, bounces, and leaves dust. */
export function PotholeCar({ className, label }: Props) {
  return (
    <Frame className={className} label={label}>
      <path d="M6 70h108" className="faint" />
      <ellipse cx="62" cy="72" rx="13" ry="3.5" className="acc ill-hole" />
      <g className="ill-car">
        <path d="M14 62v-9a3 3 0 0 1 3-3h10l6-8h18l5 8h8a3 3 0 0 1 3 3v9" />
        <circle cx="26" cy="64" r="5.5" className="soft" />
        <circle cx="64" cy="64" r="5.5" className="soft" />
      </g>
      <circle cx="56" cy="62" r="2" className="ill-dust d1" />
      <circle cx="68" cy="60" r="1.6" className="ill-dust d2" />
      <circle cx="62" cy="57" r="2.4" className="ill-dust d3" />
    </Frame>
  )
}

/** An absence: the third bottle on the shelf keeps disappearing. */
export function EmptyShelf({ className, label }: Props) {
  return (
    <Frame className={className} label={label}>
      <path d="M12 66h96" />
      <path d="M16 66v10M104 66v10" className="faint" />
      <rect x="24" y="44" width="14" height="22" rx="3" />
      <path d="M27 44v-5h8v5" />
      <rect x="52" y="44" width="14" height="22" rx="3" />
      <path d="M55 44v-5h8v5" />
      <g className="ill-gone">
        <rect x="80" y="44" width="14" height="22" rx="3" className="acc" />
        <path d="M83 44v-5h8v5" className="acc" />
      </g>
      <rect x="80" y="44" width="14" height="22" rx="3" strokeDasharray="3 4" className="faint ill-ghost" />
    </Frame>
  )
}

/** A diversion: grain leaves the sack and never reaches the bowl. */
export function LeakingSack({ className, label }: Props) {
  return (
    <Frame className={className} label={label}>
      <path d="M14 40c0-8 8-12 14-12s14 4 14 12l2 28H12z" />
      <path d="M20 28l-3-6 7 3 4-5 4 5 7-3-3 6" className="faint" />
      <path d="M78 66h28l-4 10H82z" />
      <circle cx="30" cy="48" r="1.8" className="acc ill-grain g1" />
      <circle cx="34" cy="50" r="1.8" className="acc ill-grain g2" />
      <circle cx="26" cy="50" r="1.8" className="acc ill-grain g3" />
      <circle cx="30" cy="52" r="1.8" className="acc ill-grain g4" />
      <path d="M46 58c14 2 20 8 24 22" strokeDasharray="2 5" className="faint" />
    </Frame>
  )
}

/** A right restricted: sound is cut off by a barrier. */
export function BlockedMegaphone({ className, label }: Props) {
  return (
    <Frame className={className} label={label}>
      <path d="M16 38v14l16 2V36z" className="soft" />
      <path d="M32 36l26-12v42L32 54" />
      <path d="M20 54l4 14h8l-3-13" className="faint" />
      <path d="M64 34a14 14 0 0 1 0 22" className="ill-wave w1" />
      <path d="M72 28a24 24 0 0 1 0 34" className="ill-wave w2" />
      <path d="M80 22a34 34 0 0 1 0 46" className="ill-wave w3" />
      <path d="M96 18v54" className="acc ill-bar" strokeWidth="3.4" />
      <path d="M92 26l8 8M92 38l8 8M92 50l8 8" className="acc ill-bar" strokeWidth="1.6" />
    </Frame>
  )
}

/** A shutdown: the signal lights up, flickers, and is struck out. */
export function ShutdownWifi({ className, label }: Props) {
  return (
    <Frame className={className} label={label}>
      <path d="M22 38a52 52 0 0 1 76 0" className="ill-arc a1" />
      <path d="M34 50a36 36 0 0 1 52 0" className="ill-arc a2" />
      <path d="M46 62a19 19 0 0 1 28 0" className="ill-arc a3" />
      <circle cx="60" cy="72" r="3" fill="currentColor" className="ill-dot" />
      <path d="M26 20l68 56" className="acc ill-slash" strokeWidth="3.2" />
    </Frame>
  )
}

/** Sealed: the shackle closes and the key is thrown away. */
export function SealLock({ className, label }: Props) {
  return (
    <Frame className={className} label={label}>
      <g className="ill-shackle">
        <path d="M42 40V30a18 18 0 0 1 36 0v10" />
      </g>
      <rect x="34" y="40" width="52" height="38" rx="6" className="soft" />
      <circle cx="60" cy="56" r="4.5" className="acc" />
      <path d="M60 60v8" className="acc" />
      <g className="ill-key">
        <circle cx="100" cy="30" r="4" className="faint" />
        <path d="M100 34v12M100 42h5M100 46h4" className="faint" />
      </g>
    </Frame>
  )
}

/** Checked: a magnifier moves down the rows and each one is ticked. */
export function MagnifierRows({ className, label }: Props) {
  return (
    <Frame className={className} label={label}>
      <path d="M14 22h60M14 38h52M14 54h60M14 70h40" className="faint" />
      <path d="M80 22l4 4 7-8" className="ill-tick t1 acc" />
      <path d="M72 38l4 4 7-8" className="ill-tick t2 acc" />
      <path d="M80 54l4 4 7-8" className="ill-tick t3 acc" />
      <g className="ill-glass">
        <circle cx="36" cy="30" r="12" className="soft" />
        <path d="M45 39l12 12" strokeWidth="3.2" />
      </g>
    </Frame>
  )
}

export const ILLUSTRATION: Record<string, (props: Props) => React.JSX.Element> = {
  demand: EnvelopeUnderTable,
  failure: PotholeCar,
  absence: EmptyShelf,
  diversion: LeakingSack,
  restriction: BlockedMegaphone,
  shutdown: ShutdownWifi,
}
