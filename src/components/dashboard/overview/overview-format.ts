/** Display helpers shared by the overview sections. */

const compactUsd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
})

/** 1_234_500 cents → "$12.3K", for axis ticks and tight spots. */
export const formatCompactCents = (cents: number) =>
  compactUsd.format(cents / 100)

const dayFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
})
const longDayFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
})

/** "2026-11-11" → "11 Nov" */
export const formatShortDay = (day: string) =>
  dayFormat.format(new Date(`${day}T00:00:00Z`))

/** "2026-11-11" → "Wed, 11 Nov 2026" */
export const formatLongDay = (day: string) =>
  longDayFormat.format(new Date(`${day}T00:00:00Z`))

/**
 * Change vs the previous period: "▲ 12%", "▼ 8%", "0%", or null when there
 * was nothing to compare with (a % of zero means nothing).
 */
export function formatChange(value: number, previous: number) {
  if (previous === 0) return null
  const pct = Math.round(((value - previous) / previous) * 100)
  if (pct === 0) return { label: "0%", direction: "flat" as const }
  return pct > 0
    ? { label: `▲ ${pct}%`, direction: "up" as const }
    : { label: `▼ ${Math.abs(pct)}%`, direction: "down" as const }
}
