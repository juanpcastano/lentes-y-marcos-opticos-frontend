import { format } from "date-fns"
import { es } from "react-day-picker/locale"

import { Calendar } from "#/components/ui/calendar"
import type { AppointmentDay } from "#/components/appointments/types"

interface AppointmentCalendarProps {
  availability: AppointmentDay[]
  selected: Date | undefined
  onSelect: (date: Date | undefined) => void
}

export function AppointmentCalendar({
  availability,
  selected,
  onSelect,
}: AppointmentCalendarProps) {
  const availableDates = new Set(availability.map((day) => day.date))

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isDisabled = (date: Date) => {
    if (date < today) return true
    return !availableDates.has(format(date, "yyyy-MM-dd"))
  }

  return (
    <Calendar
      mode="single"
      locale={es}
      selected={selected}
      onSelect={onSelect}
      disabled={isDisabled}
      className="w-full rounded-xl border p-3 md:p-6"
      classNames={{
        day_button: "rounded-full text-base md:text-lg",
      }}
    />
  )
}
