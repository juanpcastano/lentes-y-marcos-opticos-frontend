import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { format } from "date-fns"

import createAppointmentAvailabilityQueryOptions from "#/query-options/appointments"
import { AppointmentCalendar } from "#/components/appointments/appointment-calendar"
import { TimeSlotPicker } from "#/components/appointments/time-slot-picker"

export const Route = createFileRoute("/_main-layout/appointments")({
  component: AppointmentsPage,
})

function AppointmentsPage() {
  const { data: availability = [] } = useQuery(
    createAppointmentAvailabilityQueryOptions(),
  )

  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedSlot, setSelectedSlot] = useState<string | undefined>()

  const handleSelectDate = (date: Date | undefined) => {
    setSelectedDate(date)
    setSelectedSlot(undefined)
  }

  const selectedDay = selectedDate
    ? availability.find(
        (day) => day.date === format(selectedDate, "yyyy-MM-dd"),
      )
    : undefined

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-primary md:text-4xl">
          Agenda tu cita
        </h1>
        <p className="text-base text-muted-foreground md:text-lg">
          Elige el día y la hora que mejor se acomode a tu agenda.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
        <section>
          <h2 className="mb-4 font-semibold text-2xl">Selecciona una fecha</h2>
          <AppointmentCalendar
            availability={availability}
            selected={selectedDate}
            onSelect={handleSelectDate}
          />
        </section>

        <section className="flex flex-col">
          <h2 className="mb-4 font-semibold text-2xl">Horarios disponibles</h2>
          <TimeSlotPicker
            slots={selectedDate ? (selectedDay?.slots ?? []) : undefined}
            selectedSlot={selectedSlot}
            selectedDate={selectedDate}
            onSelectSlot={setSelectedSlot}
          />
        </section>
      </div>
    </div>
  )
}
