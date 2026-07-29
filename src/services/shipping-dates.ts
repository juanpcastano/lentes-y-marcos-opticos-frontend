export async function fetchShippingDates(): Promise<string[]> {
  const dates: string[] = []
  const current = new Date()
  let daysAdded = 0
  let leadDays = 2

  while (daysAdded < 10) {
    current.setDate(current.getDate() + 1)
    if (leadDays > 0) {
      leadDays--
      continue
    }
    const dayOfWeek = current.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) continue
    dates.push(current.toISOString().slice(0, 10))
    daysAdded++
  }

  return dates
}
