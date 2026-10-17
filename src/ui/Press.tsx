import * as Popover from "@radix-ui/react-popover"
import { ExternalLink, Newspaper } from "lucide-react"
import sources from "../../data/press-sources.json"
import type { ReportRow } from "../lib/aggregate"

type Source = { outlet: string; url: string; title: string; published: string }
type Entry = { sources: Source[]; note?: string }

/** Article links live in the repository, keyed by entity key. They are not on Arkiv: a URL is free text. */
export function pressEntry(key: string): Entry | undefined {
  return (sources as Record<string, Entry>)[key.toLowerCase()]
}

/** "Press" with the articles behind it. A press-sourced report is one curator wallet reading a published article. */
export function PressBadge({ row, label = "Press" }: { row: ReportRow; label?: string }) {
  const entry = pressEntry(row.key)
  return (
    <Popover.Root>
      <Popover.Trigger className="badge press" aria-label="Press-sourced: show the articles">
        <Newspaper size={12} /> {label}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="popover press-pop" sideOffset={6} align="start">
          <p className="small">
            <strong>Press-sourced.</strong> Written by the curator wallet from a published report. It is not a citizen report and does not count toward the 3-wallet figure.
          </p>
          {entry ? (
            <ul className="plain">
              {entry.sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noreferrer">
                    {source.outlet}: {source.title} <ExternalLink size={11} />
                  </a>
                  <span className="muted small"> {source.published}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted small">The article list for this report is not in this build.</p>
          )}
          {entry?.note ? <p className="muted small">{entry.note}</p> : null}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
