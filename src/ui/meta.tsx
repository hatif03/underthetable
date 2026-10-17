import { Banknote, Construction, Megaphone, PackageX, Wheat } from "lucide-react"
import type { ReactNode } from "react"
import { t, type Key } from "../lib/i18n"

const ICONS: Record<string, ReactNode> = {
  demand: <Banknote size={16} />,
  failure: <Construction size={16} />,
  absence: <PackageX size={16} />,
  diversion: <Wheat size={16} />,
  restriction: <Megaphone size={16} />,
}

/** Labels follow the current language: they are read when a component renders. */
export const KIND_META: Record<string, { label: string; blurb: string; icon: ReactNode }> = Object.fromEntries(
  Object.keys(ICONS).map((kind) => [
    kind,
    {
      get label() {
        return t(`kind.${kind}` as Key)
      },
      get blurb() {
        return t(`blurb.${kind}` as Key)
      },
      icon: ICONS[kind],
    },
  ]),
)

export function kindMeta(kind: string | undefined) {
  return KIND_META[kind ?? "demand"] ?? KIND_META.demand
}

export const OUTCOME_LABEL: Record<string, string> = new Proxy({} as Record<string, string>, {
  get: (_target, slug) => (typeof slug === "string" ? t(`outcome.${slug}` as Key) : undefined),
})
