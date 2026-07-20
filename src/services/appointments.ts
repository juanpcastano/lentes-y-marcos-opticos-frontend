import { addDays, format } from "date-fns"
import type { AppointmentDay } from "#/components/appointments/types"

const MORNING_SLOTS = ["09:00", "09:45", "10:30", "11:15", "12:00"]
const AFTERNOON_SLOTS = ["14:00", "14:45", "15:30", "16:15", "17:00"]

export async function fetchAppointmentAvailability(): Promise<
  AppointmentDay[]
> {
  const today = new Date()
  const days: AppointmentDay[] = []

  for (let offset = 1; offset <= 30; offset++) {
    const date = addDays(today, offset)
    const dayOfWeek = date.getDay()

    // Closed on Sundays
    if (dayOfWeek === 0) continue

    // Deterministic gaps so some days show as unavailable
    if (offset % 4 === 0) continue

    days.push({
      date: format(date, "yyyy-MM-dd"),
      // Saturdays: morning only
      slots:
        dayOfWeek === 6
          ? MORNING_SLOTS
          : [...MORNING_SLOTS, ...AFTERNOON_SLOTS],
    })
  }

  return days
}
