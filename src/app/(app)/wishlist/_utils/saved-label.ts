const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

// Largest unit first; a unit is used once the gap reaches one of it.
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60],
  ["month", 30 * 24 * 60 * 60],
  ["week", 7 * 24 * 60 * 60],
  ["day", 24 * 60 * 60],
  ["hour", 60 * 60],
  ["minute", 60],
]

/** "2 days ago", "last week", "just now". */
export function savedLabel(date: Date, now = new Date()) {
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000)
  for (const [unit, size] of UNITS) {
    if (seconds >= size) return rtf.format(-Math.floor(seconds / size), unit)
  }
  return "just now"
}
