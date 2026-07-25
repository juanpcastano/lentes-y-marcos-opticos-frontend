import type { NotificationPreferences } from "#/services/notifications"

export const NOTIF_LABELS: Record<
  keyof NotificationPreferences,
  { title: string; description: string }
> = {
  orderUpdates: {
    title: "Compras y seguimiento",
    description: "Recibe confirmaciones y actualizaciones de tus pedidos.",
  },
  appointmentReminders: {
    title: "Recordatorios de citas",
    description: "Te avisamos antes de tus citas de exámenes visuales.",
  },
  newsAndRecommendations: {
    title: "Novedades y recomendaciones",
    description: "Ofertas, nuevos productos y contenido recomendado.",
  },
}

export function getEnabledNotifLabels(
  prefs: NotificationPreferences | undefined,
): string[] {
  if (!prefs) return []
  return (Object.entries(prefs) as [keyof NotificationPreferences, boolean][])
    .filter(([, v]) => v)
    .map(([k]) => NOTIF_LABELS[k].title)
}
