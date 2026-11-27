import { useState } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { createMeQueryOptions } from "#/query-options/auth"
import { createNotificationPreferencesQueryOptions } from "#/query-options/notifications"
import { NotificationsForm } from "#/components/profile/notifications-form"
import { NotificationsRead } from "#/components/profile/notifications-read"
import { Button } from "#/components/ui/button"
import { Card, CardContent } from "#/components/ui/card"

export const Route = createFileRoute(
  "/_main-layout/_authenticated/myaccount/profile",
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: user } = useQuery(createMeQueryOptions())
  const { data: notifs, isPending: notifsPending } = useQuery(
    createNotificationPreferencesQueryOptions(),
  )
  const [editNotifs, setEditNotifs] = useState(false)

  if (!user) return null

  return (
    <div className="w-full max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Mi Perfil</h1>

      <div className="grid gap-6">
        <Card className="p-0">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Datos de contacto</h2>
                <p className="mt-4 text-sm text-muted-foreground">Celular</p>
                <p className="text-base font-medium">{user.phone}</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/myaccount/softix">Editar mis datos</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {!notifsPending && (
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Notificaciones</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditNotifs((value) => !value)}
              >
                {editNotifs ? "Cancelar" : "Editar preferencias"}
              </Button>
            </div>
            {editNotifs && notifs ? (
              <NotificationsForm preferences={notifs} />
            ) : (
              <NotificationsRead preferences={notifs} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
