import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Bell } from "lucide-react"
import { NOTIFICATIONS_QUERY_KEY } from "#/query-options/notifications"
import { updateNotificationPreferences } from "#/services/notifications"
import type { NotificationPreferences } from "#/services/notifications"
import { NOTIF_LABELS } from "#/components/profile/notif-labels"
import { Button } from "#/components/ui/button"
import { Card, CardContent } from "#/components/ui/card"
import { FieldDescription, FieldGroup } from "#/components/ui/field"
import { Switch } from "#/components/ui/switch"

interface NotificationsFormProps {
  preferences: NotificationPreferences
}

export function NotificationsForm({ preferences }: NotificationsFormProps) {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<NotificationPreferences>(preferences)
  const [saved, setSaved] = useState(false)

  const mutation = useMutation({
    mutationFn: (prefs: NotificationPreferences) =>
      updateNotificationPreferences(prefs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
      setSaved(true)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(draft)
  }

  const handleCancel = () => {
    setDraft(preferences)
    setSaved(false)
  }

  const toggle = (key: keyof NotificationPreferences, checked: boolean) => {
    setDraft({ ...draft, [key]: checked })
    setSaved(false)
  }

  return (
    <Card className="p-0">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Bell className="size-5" />
          <h2 className="text-lg font-semibold">
            Preferencias de notificaciones
          </h2>
        </div>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {(Object.keys(draft) as (keyof NotificationPreferences)[]).map(
              (key) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-4 rounded-lg border p-4"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">
                      {NOTIF_LABELS[key].title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {NOTIF_LABELS[key].description}
                    </span>
                  </div>
                  <Switch
                    checked={draft[key]}
                    onCheckedChange={(checked) => toggle(key, checked)}
                  />
                </div>
              ),
            )}
            {saved && (
              <FieldDescription className="text-foreground">
                Preferencias guardadas correctamente
              </FieldDescription>
            )}
            <div className="flex gap-2">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Guardando..." : "Guardar preferencias"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={mutation.isPending}
              >
                Cancelar
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
