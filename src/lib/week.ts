const DAY_MS = 86_400_000

export function kolkataDay(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now)
}

export function addDays(day: string, days: number): string {
  const [year, month, date] = day.split("-").map(Number)
  const utc = new Date(Date.UTC(year, month - 1, date))
  utc.setUTCDate(utc.getUTCDate() + days)
  const y = utc.getUTCFullYear()
  const m = String(utc.getUTCMonth() + 1).padStart(2, "0")
  const d = String(utc.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/** ISO week of a civil date. The date is read as a calendar day, not a timestamp. */
export function isoWeek(day: string): string {
  const [year, month, date] = day.split("-").map(Number)
  const utc = new Date(Date.UTC(year, month - 1, date))
  const weekday = utc.getUTCDay() || 7
  utc.setUTCDate(utc.getUTCDate() + 4 - weekday)
  const weekYear = utc.getUTCFullYear()
  const yearStart = new Date(Date.UTC(weekYear, 0, 1))
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / DAY_MS + 1) / 7)
  return `${weekYear}-W${String(week).padStart(2, "0")}`
}

export function incidentWindow(day: string, today: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return "Pick a date."
  if (day > today) return "The incident date cannot be in the future."
  if (day < addDays(today, -180)) return "The incident date cannot be more than 180 days ago."
  return null
}

/** "This week", "Last week", then older weeks. The writer picks a week, never a day. */
export function weekChoices(today: string, count = 12): { week: string; day: string; label: string }[] {
  return Array.from({ length: count }, (_, index) => {
    const day = addDays(today, -7 * index)
    const label = index === 0 ? "This week" : index === 1 ? "Last week" : `${index} weeks ago`
    return { week: isoWeek(day), day, label }
  })
}

/** Monday of an ISO week, as a civil date. */
export function weekStart(week: string): string {
  const [year, number] = week.split("-W").map(Number)
  const jan4 = new Date(Date.UTC(year, 0, 4))
  const monday = new Date(jan4.getTime() - ((jan4.getUTCDay() || 7) - 1) * DAY_MS + (number - 1) * 7 * DAY_MS)
  return monday.toISOString().slice(0, 10)
}

export function previousWeek(week: string): string {
  return isoWeek(addDays(weekStart(week), -7))
}
