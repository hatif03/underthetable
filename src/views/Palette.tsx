import * as Dialog from "@radix-ui/react-dialog"
import { Command } from "cmdk"
import { MapPin, Plus } from "lucide-react"
import districts from "../../data/districts.json"
import { measure } from "../lib/format"
import { departmentLabel, labelize } from "../lib/labels"
import type { Live } from "../state/useDerived"
import type { Prefill } from "./Pulse"

// Substring match on every typed word. The default fuzzy match put Jaipur above Pune for "pune".
function match(value: string, search: string): number {
  const words = search.toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return 1
  const text = value.toLowerCase()
  return words.every((word) => text.includes(word)) ? (text.startsWith(words[0]) ? 1 : 0.5) : 0
}

/** Ctrl K. Districts with reports first, then every district, then quoted desks. */
export function Palette({ open, onOpenChange, live, closed, onDistrict, onReport }: { open: boolean; onOpenChange: (open: boolean) => void; live: Live; closed: boolean; onDistrict: (district: string) => void; onReport: (prefill?: Prefill) => void }) {
  const withReports = [...live.d.byDistrict.entries()].sort((a, b) => b[1].count - a[1].count)
  const rest = districts.states.flatMap((state) => state.districts.filter((slug) => !live.d.byDistrict.has(slug)).map((slug) => ({ slug, state: state.label })))
  const choose = (district: string) => {
    onOpenChange(false)
    onDistrict(district)
  }
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="overlay" />
        <Dialog.Content className="palette" aria-label="Search">
          <Dialog.Title className="sr">Search districts and desks</Dialog.Title>
          <Dialog.Description className="sr">Type a district, a department or a service.</Dialog.Description>
          <Command loop filter={match}>
            <Command.Input placeholder="Nashik, driving licence, pothole…" autoFocus />
            <Command.List>
              <Command.Empty>Nothing by that name.</Command.Empty>
              {closed ? null : (
                <Command.Group heading="Do">
                  <Command.Item value="report something file new" onSelect={() => { onOpenChange(false); onReport() }}>
                    <Plus size={16} /> Report something
                  </Command.Item>
                </Command.Group>
              )}
              {live.d.quoted.length > 0 ? (
                <Command.Group heading="Quoted desks">
                  {live.d.quoted.slice(0, 20).map((desk) => (
                    <Command.Item key={desk.id} value={`${desk.district.replaceAll("_", " ")} ${desk.department} ${desk.service.replaceAll("_", " ")} ${desk.kind}`} onSelect={() => choose(desk.district)}>
                      <MapPin size={16} />
                      <span>
                        {labelize(desk.district)} · {departmentLabel(desk.department)} · {labelize(desk.service)}
                      </span>
                      <span className="muted small">{measure(desk.kind, desk.medianInr ?? 0)}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              ) : null}
              <Command.Group heading="Districts with reports">
                {withReports.map(([slug, info]) => (
                  <Command.Item key={slug} value={`${slug.replaceAll("_", " ")} district`} onSelect={() => choose(slug)}>
                    <MapPin size={16} />
                    <span>{labelize(slug)}</span>
                    <span className="muted small">{info.count} report{info.count === 1 ? "" : "s"}</span>
                  </Command.Item>
                ))}
              </Command.Group>
              <Command.Group heading="All districts">
                {rest.map((item) => (
                  <Command.Item key={item.slug} value={`${item.slug.replaceAll("_", " ")} ${item.state}`} onSelect={() => choose(item.slug)}>
                    <MapPin size={16} />
                    <span>{labelize(item.slug)}</span>
                    <span className="muted small">{item.state}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
