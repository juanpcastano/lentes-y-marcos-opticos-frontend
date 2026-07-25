import { Bell } from "lucide-react"
import { getEnabledNotifLabels } from "#/components/profile/notif-labels"
import type { NotificationPreferences } from "#/services/notifications"
import { Card, CardContent } from "#/components/ui/card"

interface NotificationsReadProps {
  preferences: NotificationPreferences | undefined
}

export function NotificationsRead({ preferences }: NotificationsReadProps) {
  const enabled = getEnabledNotifLabels(preferences)

  return (
    <Card className="p-0">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Bell className="size-5" />
          <h2 className="text-lg font-semibold">
            Preferencias de notificaciones
          </h2>
        </div>
        {enabled.length > 0 ? (
          <p className="text-sm text-foreground">
            Recibiendo correos sobre:{" "}
            <span className="font-medium">{enabled.join(", ")}</span>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            No tienes notificaciones activadas.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
