import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { format, differenceInHours } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarCheck, Clock, Trash2, ArrowLeft } from "lucide-react"

import createAppointmentAvailabilityQueryOptions from "#/query-options/appointments"
import createUserAppointmentsQueryOptions from "#/query-options/user-appointments"
import { AppointmentCalendar } from "#/components/appointments/appointment-calendar"
import type { AppointmentDay } from "#/components/appointments/types"
import { TimeSlotPicker } from "#/components/appointments/time-slot-picker"
import { useBookAppointment } from "#/query-options/book-appointment"
import { useRescheduleAppointment } from "#/query-options/reschedule-appointment"
import { useCancelAppointment } from "#/query-options/cancel-appointment"
import { CancelAppointmentDialog } from "#/components/appointments/cancel-appointment-dialog"
import { Button } from "#/components/ui/button"
import { Card, CardContent, CardHeader } from "#/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#/components/ui/tooltip"
import type { UserAppointment } from "#/services/user-appointments"

export const Route = createFileRoute("/_main-layout/appointments")({
  component: AppointmentsPage,
})

function AppointmentsPage() {
  const { data: availability = [] } = useQuery(
    createAppointmentAvailabilityQueryOptions(),
  )
  const { data: appointments = [] } = useQuery(
    createUserAppointmentsQueryOptions(),
  )

  const pendingAppointment = appointments.find((a) => a.status === "pending")

  if (pendingAppointment) {
    return (
      <AppointmentDetailView
        appointment={pendingAppointment}
        availability={availability}
      />
    )
  }

  return <BookingView availability={availability} />
}

/* ───────── Booking mode (no pending appointment) ───────── */

function BookingView({ availability }: { availability: AppointmentDay[] }) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedSlot, setSelectedSlot] = useState<string | undefined>()
  const bookMutation = useBookAppointment()

  const handleSelectDate = (date: Date | undefined) => {
    setSelectedDate(date)
    setSelectedSlot(undefined)
  }

  const selectedDay = selectedDate
    ? availability.find(
        (day) => day.date === format(selectedDate, "yyyy-MM-dd"),
      )
    : undefined

  const handleConfirm = () => {
    if (!selectedDate || !selectedSlot) return
    const date = format(selectedDate, "yyyy-MM-dd")
    bookMutation.mutate({ date, time: selectedSlot })
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
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
            onConfirm={handleConfirm}
          />
        </section>
      </div>
    </div>
  )
}

/* ───────── Detail mode (has pending appointment) ───────── */

function AppointmentDetailView({
  appointment,
  availability,
}: {
  appointment: UserAppointment
  availability: AppointmentDay[]
}) {
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const cancelMutation = useCancelAppointment()

  const appointmentDateTime = new Date(
    `${appointment.date}T${appointment.time}:00`,
  )
  const hoursUntil = differenceInHours(appointmentDateTime, new Date())
  const canReschedule = hoursUntil > 24

  if (isRescheduling) {
    return (
      <RescheduleView
        appointment={appointment}
        availability={availability}
        onCancel={() => setIsRescheduling(false)}
        onSaved={() => setIsRescheduling(false)}
      />
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-primary md:text-4xl">
          Tu próxima cita
        </h1>
        <p className="text-base text-muted-foreground md:text-lg">
          Estos son los detalles de tu cita programada.
        </p>
      </div>

      <div className="mx-auto max-w-xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <CalendarCheck className="size-6 text-primary" />
              <div>
                <p className="font-semibold text-lg">{appointment.id}</p>
                <p className="text-sm text-muted-foreground">
                  {format(appointmentDateTime, "d 'de' MMMM 'a las' HH:mm", {
                    locale: es,
                  })}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <TooltipProvider>
              {canReschedule ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsRescheduling(true)}
                >
                  <Clock className="mr-2 size-4" />
                  Cambiar fecha/hora
                </Button>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="w-full">
                      <Button variant="outline" className="w-full" disabled>
                        <Clock className="mr-2 size-4" />
                        Cambiar fecha/hora
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>No puedes cambiar la cita si faltan menos de 24 horas</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>

            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowCancelDialog(true)}
            >
              <Trash2 className="mr-2 size-4" />
              Cancelar Cita
            </Button>
          </CardContent>
        </Card>
      </div>

      <CancelAppointmentDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={() => cancelMutation.mutate()}
      />
    </div>
  )
}

/* ───────── Reschedule sub-mode ───────── */

function RescheduleView({
  appointment,
  availability,
  onCancel,
  onSaved,
}: {
  appointment: UserAppointment
  availability: AppointmentDay[]
  onCancel: () => void
  onSaved: () => void
}) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(`${appointment.date}T12:00:00`),
  )
  const [selectedSlot, setSelectedSlot] = useState<string | undefined>(
    appointment.time,
  )
  const rescheduleMutation = useRescheduleAppointment()

  const handleSelectDate = (date: Date | undefined) => {
    setSelectedDate(date)
    setSelectedSlot(undefined)
  }

  const selectedDay = selectedDate
    ? availability.find(
        (day) => day.date === format(selectedDate, "yyyy-MM-dd"),
      )
    : undefined

  const handleSave = () => {
    if (!selectedDate || !selectedSlot) return
    const date = format(selectedDate, "yyyy-MM-dd")
    rescheduleMutation.mutate(
      { date, time: selectedSlot },
      {
        onSuccess: onSaved,
      },
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
      <div className="mb-8">
        <Button variant="ghost" className="mb-4 -ml-2" onClick={onCancel}>
          <ArrowLeft className="mr-2 size-4" />
          Volver a la cita
        </Button>
        <h1 className="mb-2 text-3xl font-bold text-primary md:text-4xl">
          Cambiar fecha y hora
        </h1>
        <p className="text-base text-muted-foreground md:text-lg">
          Selecciona una nueva fecha y hora para tu cita.
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
            showConfirmButton={false}
          />

          {selectedDate && selectedSlot && (
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={onCancel}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleSave}>
                Guardar cambios
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
