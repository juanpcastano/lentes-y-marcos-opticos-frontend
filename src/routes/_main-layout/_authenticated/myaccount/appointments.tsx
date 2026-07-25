import { createFileRoute } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarX } from "lucide-react"
import createUserAppointmentsQueryOptions from "#/query-options/user-appointments"
import { Card, CardContent, CardHeader } from "#/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs"
import type { UserAppointment } from "#/services/user-appointments"

export const Route = createFileRoute(
  "/_main-layout/_authenticated/myaccount/appointments",
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: appointments } = useSuspenseQuery(
    createUserAppointmentsQueryOptions(),
  )

  const pending = appointments.filter((a) => a.status === "pending")
  const history = appointments.filter((a) => a.status === "completed")

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Citas</h1>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Citas Pendientes</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 flex flex-col gap-4">
          {pending.length === 0 ? (
            <EmptyState message="No tienes citas pendientes." />
          ) : (
            pending.map((appointment) => (
              <PendingAppointmentCard
                key={appointment.id}
                appointment={appointment}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4 flex flex-col gap-4">
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
        </TabsContent>
      </Tabs>
    </div>
  )
}

function formatAppointment(appointment: UserAppointment): string {
  const dt = new Date(`${appointment.date}T${appointment.time}:00`)
  return format(dt, "d 'de' MMMM 'a las' HH:mm", { locale: es })
}

function PendingAppointmentCard({
  appointment,
}: {
  appointment: UserAppointment
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="grid gap-0.5">
            <span className="font-medium">{appointment.id}</span>
            <span className="text-sm text-muted-foreground">
              {formatAppointment(appointment)}
            </span>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
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
