import * as Popover from "@radix-ui/react-popover"
import { Command } from "cmdk"
import { Check, ChevronDown } from "lucide-react"
import { useState } from "react"
import districts from "../../data/districts.json"
import { labelize } from "../lib/labels"

const all = districts.states.flatMap((state) => state.districts.map((slug) => ({ state: state.slug, stateLabel: state.label, slug })))

/** Type three letters, press enter. One control for state and district. */
export function DistrictPicker({ value, onChange, label = "District", allowAll }: { value: string; onChange: (state: string, district: string) => void; label?: string; allowAll?: boolean }) {
  const [open, setOpen] = useState(false)
  const current = all.find((item) => item.slug === value)
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger className="select" aria-label={label}>
          <span>{current ? `${labelize(current.slug)}, ${current.stateLabel}` : "All districts"}</span>
          <ChevronDown size={16} />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content className="popover" sideOffset={6} align="start">
            <Command>
              <Command.Input placeholder="Type a district or state" autoFocus />
              <Command.List>
                <Command.Empty>No district by that name. The list is a working set, not every district.</Command.Empty>
                {allowAll ? (
                  <Command.Item value="all districts" onSelect={() => { onChange("", ""); setOpen(false) }}>
                    All districts
                  </Command.Item>
                ) : null}
                {all.map((item) => (
                  <Command.Item
                    key={item.slug}
                    value={`${item.slug.replaceAll("_", " ")} ${item.stateLabel}`}
                    onSelect={() => {
                      onChange(item.state, item.slug)
                      setOpen(false)
                    }}
                  >
                    <span>{labelize(item.slug)}</span>
                    <span className="muted small">{item.stateLabel}</span>
                    {item.slug === value ? <Check size={14} /> : null}
                  </Command.Item>
                ))}
              </Command.List>
            </Command>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
}
