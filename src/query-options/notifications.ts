import { queryOptions } from "@tanstack/react-query"
import { fetchNotificationPreferences } from "#/services/notifications"
import type { NotificationPreferences } from "#/services/notifications"

export const NOTIFICATIONS_QUERY_KEY = ["notification-preferences"] as const

export function createNotificationPreferencesQueryOptions() {
  return queryOptions<NotificationPreferences>({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: fetchNotificationPreferences,
    staleTime: Infinity,
  })
}
