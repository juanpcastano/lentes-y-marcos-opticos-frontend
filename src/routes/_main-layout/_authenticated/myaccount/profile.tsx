import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  createMeQueryOptions,
  createSoftixProfileQueryOptions,
} from "#/query-options/auth"
import { createNotificationPreferencesQueryOptions } from "#/query-options/notifications"
import { NotificationsForm } from "#/components/profile/notifications-form"
import { NotificationsRead } from "#/components/profile/notifications-read"
import { PersonalDataForm } from "#/components/profile/personal-data-form"
import { PersonalDataRead } from "#/components/profile/personal-data-read"
import {
  NotificationsSkeleton,
  PersonalDataSkeleton,
} from "#/components/profile/profile-skeleton"
import { Button } from "#/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "#/components/ui/tooltip"

export const Route = createFileRoute(
  "/_main-layout/_authenticated/myaccount/profile",
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: user, isPending: userPending } = useQuery(
    createMeQueryOptions(),
  )
  const { data: profile, isPending: profilePending } = useQuery(
    createSoftixProfileQueryOptions(),
  )
  const { data: notifs, isPending: notifsPending } = useQuery(
    createNotificationPreferencesQueryOptions(),
  )
  const [editData, setEditData] = useState(false)
  const [editNotifs, setEditNotifs] = useState(false)
  const nextEditDate = profile?.nextEditAllowedAt
    ? new Date(profile.nextEditAllowedAt)
    : null
  const cooldownActive = Boolean(
    nextEditDate &&
    !Number.isNaN(nextEditDate.getTime()) &&
    nextEditDate.getTime() > Date.now(),
  )
  const cooldownLabel =
    cooldownActive && nextEditDate
      ? format(nextEditDate, "d 'de' MMMM 'de' yyyy", { locale: es })
      : null

  if (!user && !userPending) return null

  return (
    <div className="w-full max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Mi Perfil</h1>

      <div className="grid gap-6">
        {userPending || profilePending ? (
          <PersonalDataSkeleton />
        ) : user && profile ? (
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Datos personales</h2>
              {cooldownActive && !editData ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className="inline-flex rounded-4xl outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                      tabIndex={0}
                    >
                      <Button variant="outline" size="sm" disabled>
                        Editar datos
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    Podrás editar tus datos de nuevo el {cooldownLabel}.
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditData((value) => !value)}
                >
                  {editData ? "Cancelar" : "Editar datos"}
                </Button>
              )}
            </div>
            {editData ? (
              <PersonalDataForm
                profile={profile}
                onComplete={() => setEditData(false)}
              />
            ) : (
              <PersonalDataRead user={user} profile={profile} />
            )}
          </div>
        ) : null}

        {notifsPending ? (
          <NotificationsSkeleton />
        ) : (
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
