import { formatPrice } from "@/components/dashboard/watches/watch-utils"

import type { WatchDetail } from "../../watches/[id]/_data/types"
import {
  CONDITION_LABEL,
  GENDER_LABEL,
  MOVEMENT_LABEL,
  stockLabel,
} from "../../watches/[id]/_utils/labels"

export type CompareSection =
  "price" | "movement" | "case" | "identity" | "piece"

/** In display order; the number is shown before the title ("02 · Movement"). */
export const COMPARE_SECTIONS: { id: CompareSection; title: string }[] = [
  { id: "price", title: "Price & Availability" },
  { id: "movement", title: "Movement" },
  { id: "case", title: "Case & Wear" },
  { id: "identity", title: "Identity" },
  { id: "piece", title: "The Piece" },
]

export type CompareRow = {
  section: CompareSection
  label: string
  value: (w: WatchDetail) => string | null
  /** long text: clamped, with "Read more" */
  long?: boolean
}

export const COMPARE_ROWS: CompareRow[] = [
  { section: "price", label: "Price", value: (w) => formatPrice(w.priceCents) },
  {
    section: "price",
    label: "Availability",
    value: (w) => stockLabel(w.stock),
  },
  {
    section: "movement",
    label: "Movement",
    value: (w) => w.movement && MOVEMENT_LABEL[w.movement],
  },
  { section: "movement", label: "Caliber", value: (w) => w.caliber },
  { section: "case", label: "Case material", value: (w) => w.caseMaterial },
  {
    section: "case",
    label: "Gender",
    value: (w) => w.gender && GENDER_LABEL[w.gender],
  },
  {
    section: "case",
    label: "Condition",
    value: (w) => w.condition && CONDITION_LABEL[w.condition],
  },
  { section: "identity", label: "Brand", value: (w) => w.brand },
  { section: "identity", label: "Reference", value: (w) => w.model },
  {
    section: "piece",
    label: "Description",
    value: (w) => w.description || null,
    long: true,
  },
]

/** Whether the watches show different values in this row. */
export const rowDiffers = (row: CompareRow, watches: WatchDetail[]) =>
  new Set(watches.map((w) => row.value(w) ?? "")).size > 1

/** Id of the cheapest watch, or null when they all cost the same. */
export function cheapestId(watches: WatchDetail[]) {
  if (watches.length < 2) return null
  const min = Math.min(...watches.map((w) => w.priceCents))
  const cheapest = watches.filter((w) => w.priceCents === min)
  return cheapest.length === 1 ? cheapest[0].id : null
}

export type CompareGroup = {
  /** "01" … "05" */
  number: string
  title: string
  rows: { row: CompareRow; differs: boolean }[]
}

/**
 * Rows grouped into their sections. With `onlyDifferences`, matching rows
 * are dropped, and so are sections left with no rows.
 */
export function groupRows(
  watches: WatchDetail[],
  onlyDifferences: boolean
): CompareGroup[] {
  return COMPARE_SECTIONS.map((section, i) => ({
    number: String(i + 1).padStart(2, "0"),
    title: section.title,
    rows: COMPARE_ROWS.filter((r) => r.section === section.id)
      .map((row) => ({ row, differs: rowDiffers(row, watches) }))
      .filter((r) => !onlyDifferences || r.differs),
  })).filter((g) => g.rows.length > 0)
}

/** How many of the details differ, for the toolbar summary. */
export const countDifferences = (watches: WatchDetail[]) =>
  COMPARE_ROWS.filter((row) => rowDiffers(row, watches)).length
