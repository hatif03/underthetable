import * as Dialog from "@radix-ui/react-dialog"
import * as Select from "@radix-ui/react-select"
import * as Toggle from "@radix-ui/react-toggle-group"
import * as Tooltip from "@radix-ui/react-tooltip"
import { animate, useInView, useReducedMotion } from "motion/react"
import { Check, ChevronDown, Copy, ShieldCheck, X } from "lucide-react"
import { useEffect, useRef, useState, type ReactNode } from "react"

/** Counts up to `value` once it scrolls into view. */
export function Counter({ value, format = (n: number) => Math.round(n).toLocaleString("en-IN") }: { value: number; format?: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const visible = useInView(ref, { once: true })
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(reduce ? value : 0)
  useEffect(() => {
    if (reduce) return setShown(value)
    if (!visible) return
    const controls = animate(shown, value, { duration: 0.9, ease: [0.16, 1, 0.3, 1], onUpdate: setShown })
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, visible, reduce])
  return <span ref={ref} className="num">{format(shown)}</span>
}

export function Badge({ tone = "plain", children }: { tone?: "plain" | "accent" | "ok" | "demo"; children: ReactNode }) {
  return <span className={tone === "plain" ? "badge" : `badge ${tone}`}>{children}</span>
}

export function Tip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Tooltip.Root delayDuration={150}>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className="tip" sideOffset={6}>
          {label}
          <Tooltip.Arrow className="tip-arrow" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

/** A right-hand sheet on desktop and a bottom sheet on a phone. */
export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  wide,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  wide?: boolean
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="overlay" />
        <Dialog.Content className={wide ? "sheet wide" : "sheet"} aria-describedby={description ? undefined : undefined}>
          <header className="sheet-head">
            <div>
              <Dialog.Title className="sheet-title">{title}</Dialog.Title>
              {description ? <Dialog.Description className="muted small">{description}</Dialog.Description> : <Dialog.Description className="sr">{title}</Dialog.Description>}
            </div>
            <Dialog.Close className="icon-btn" aria-label="Close">
              <X size={18} />
            </Dialog.Close>
          </header>
          <div className="sheet-body">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export type Option = { value: string; label: string; group?: string }

/** Radix Select with optional groups. One control, one tap to open. */
export function Pick({ value, onChange, options, label, placeholder }: { value: string; onChange: (value: string) => void; options: Option[]; label: string; placeholder?: string }) {
  const groups = [...new Set(options.map((option) => option.group ?? ""))]
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <Select.Root value={value} onValueChange={onChange}>
        <Select.Trigger className="select" aria-label={label}>
          <Select.Value placeholder={placeholder} />
          <Select.Icon>
            <ChevronDown size={16} />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="select-content" position="popper" sideOffset={6}>
            <Select.Viewport className="select-viewport">
              {groups.map((group) => (
                <Select.Group key={group}>
                  {group ? <Select.Label className="select-label">{group}</Select.Label> : null}
                  {options
                    .filter((option) => (option.group ?? "") === group)
                    .map((option) => (
                      <Select.Item key={option.value} value={option.value} className="select-item">
                        <Select.ItemText>{option.label}</Select.ItemText>
                        <Select.ItemIndicator>
                          <Check size={14} />
                        </Select.ItemIndicator>
                      </Select.Item>
                    ))}
                </Select.Group>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </label>
  )
}

/** A row of exclusive choices. Never empties: tapping the chosen one keeps it. */
export function Seg({ value, onChange, options, label }: { value: string; onChange: (value: string) => void; options: { value: string; label: string; icon?: ReactNode }[]; label: string }) {
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <Toggle.Root type="single" className="seg" value={value} onValueChange={(next) => next && onChange(next)} aria-label={label}>
        {options.map((option) => (
          <Toggle.Item key={option.value} value={option.value} className="seg-item">
            {option.icon}
            {option.label}
          </Toggle.Item>
        ))}
      </Toggle.Root>
    </div>
  )
}

export function CopyLine({ text }: { text: string }) {
  const [done, setDone] = useState(false)
  return (
    <div className="copy-line">
      <code>{text}</code>
      <button
        type="button"
        className="icon-btn"
        aria-label="Copy"
        onClick={() => {
          void navigator.clipboard?.writeText(text)
          setDone(true)
          window.setTimeout(() => setDone(false), 1400)
        }}
      >
        {done ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </div>
  )
}

/** n of QUOTE_AT wallets, as dots. */
export function Pips({ voices, need = 3 }: { voices: number; need?: number }) {
  const total = Math.max(need, Math.min(voices, 7))
  return (
    <span className="pips" aria-label={`${voices} wallets`}>
      {Array.from({ length: total }, (_, index) => (
        <i key={index} className={index < voices ? "on" : ""} />
      ))}
      {voices > 7 ? <small>+{voices - 7}</small> : null}
    </span>
  )
}

/** Marks a report whose writer was inside the report's state when it was filed, per the checker wallet. */
export function Checked({ state }: { state?: string }) {
  return (
    <Tip label={`Location-checked: the writer was inside ${state ?? "the state"} when filing, vouched for by the checker wallet. A phone can fake a position, so this is a hint.`}>
      <span className="checked" aria-label="Location-checked">
        <ShieldCheck size={14} />
      </span>
    </Tip>
  )
}
