import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { createMeQueryOptions } from "#/query-options/auth"
import { createNotificationPreferencesQueryOptions } from "#/query-options/notifications"
import { DeleteAccount } from "#/components/profile/delete-account"
import { NotificationsForm } from "#/components/profile/notifications-form"
import { NotificationsRead } from "#/components/profile/notifications-read"
import { PasswordForm } from "#/components/profile/password-form"
import { PersonalInfoForm } from "#/components/profile/personal-info-form"
import { PersonalInfoRead } from "#/components/profile/personal-info-read"
import { Button } from "#/components/ui/button"
import { FieldGroup } from "#/components/ui/field"

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
  const [editMode, setEditMode] = useState(false)

  if (!user) return null

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mi Perfil</h1>
        {!editMode ? (
          <Button onClick={() => setEditMode(true)}>Editar preferencias</Button>
        ) : (
          <Button onClick={() => setEditMode(false)}>Cancelar</Button>
        )}
      </div>

      <FieldGroup>
        {editMode ? (
          <PersonalInfoForm user={user} />
        ) : (
          <PersonalInfoRead user={user} />
        )}

        {editMode && user.authMethod === "email" && <PasswordForm />}

        {editMode ? (
          notifs && <NotificationsForm preferences={notifs} />
        ) : (
          <>{!notifsPending && <NotificationsRead preferences={notifs} />}</>
        )}

        {editMode && <DeleteAccount />}
      </FieldGroup>
    </div>
  )
}
