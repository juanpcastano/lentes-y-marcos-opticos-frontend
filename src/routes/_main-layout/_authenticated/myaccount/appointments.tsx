import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarX } from "lucide-react"
import createUserAppointmentsQueryOptions from "#/query-options/user-appointments"
import { Card, CardContent, CardHeader } from "#/components/ui/card"
import { Button } from "#/components/ui/button"
import type { UserAppointment } from "#/services/user-appointments"

export const Route = createFileRoute(
  "/_main-layout/_authenticated/myaccount/appointments",
)({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { data: appointments } = useSuspenseQuery(
    createUserAppointmentsQueryOptions(),
  )

  const pending = appointments.find((a) => a.status === "pending")
  const history = appointments.filter((a) => a.status === "completed")

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Citas</h1>
      </div>

      {pending && (
        <div className="mb-8">
          <h2 className="mb-4 font-semibold text-lg">Próxima cita</h2>
          <Card>
            <CardHeader>
              <div className="grid gap-0.5">
                <span className="font-medium">{pending.id}</span>
                <span className="text-sm text-muted-foreground">
                  {formatAppointment(pending)}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate({ to: "/appointments" })}
              >
                Ver detalles
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <div>
        <h2 className="mb-4 font-semibold text-lg">Historial de citas</h2>
        <div className="flex flex-col gap-4">
          {history.length === 0 ? (
            <EmptyState message="No tienes historial de citas." />
          ) : (
            history.map((appointment) => (
              <CompletedAppointmentCard
                key={appointment.id}
                appointment={appointment}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function formatAppointment(appointment: UserAppointment): string {
  const dt = new Date(`${appointment.date}T${appointment.time}:00`)
  return format(dt, "d 'de' MMMM 'a las' HH:mm", { locale: es })
}

function CompletedAppointmentCard({
  appointment,
}: {
  appointment: UserAppointment
}) {
  const { medicalResult } = appointment

  return (
    <Card>
      <CardHeader>
        <div className="grid gap-0.5">
          <span className="font-medium">{appointment.id}</span>
          <span className="text-sm text-muted-foreground">
            {formatAppointment(appointment)}
          </span>
        </div>
      </CardHeader>
      {medicalResult && (
        <CardContent className="grid gap-2 text-sm">
          {medicalResult.prescription !== undefined && (
            <div className="grid gap-1">
              <span className="text-muted-foreground">Receta</span>
              <span>{medicalResult.prescription}</span>
            </div>
          )}
          {medicalResult.notes !== undefined && (
            <div className="grid gap-1">
              <span className="text-muted-foreground">Notas</span>
              <span>{medicalResult.notes}</span>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-4xl bg-muted/40 py-12 text-center">
      <CalendarX className="size-8 text-muted-foreground" aria-hidden />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
