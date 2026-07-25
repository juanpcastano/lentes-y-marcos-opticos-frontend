export interface NotificationPreferences {
  orderUpdates: boolean
  appointmentReminders: boolean
  newsAndRecommendations: boolean
}

const MOCK_NOTIFS_KEY = "mock_notification_preferences"

const DEFAULT_NOTIFS: NotificationPreferences = {
  orderUpdates: true,
  appointmentReminders: true,
  newsAndRecommendations: false,
}

export async function fetchNotificationPreferences(): Promise<NotificationPreferences> {
  const stored = localStorage.getItem(MOCK_NOTIFS_KEY)
  if (stored) {
    try {
      return {
        ...DEFAULT_NOTIFS,
        ...(JSON.parse(stored) as Partial<NotificationPreferences>),
      }
    } catch {
      // fall through to default
    }
  }
  return { ...DEFAULT_NOTIFS }
}

export async function updateNotificationPreferences(
  prefs: NotificationPreferences,
): Promise<NotificationPreferences> {
  localStorage.setItem(MOCK_NOTIFS_KEY, JSON.stringify(prefs))
  return { ...prefs }
}
