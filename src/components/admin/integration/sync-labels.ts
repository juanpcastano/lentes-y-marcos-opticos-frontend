import type { SyncLog, SyncRunStatus, SyncRunTrigger } from "#/services/admin"

const dateTimeFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
})

export function formatSyncDateTime(value: string | null): string {
  if (!value) return "—"
  return dateTimeFormatter.format(new Date(value))
}

export const SYNC_STATUS_LABELS: Record<SyncRunStatus, string> = {
  RUNNING: "En curso",
  SUCCESS: "Exitosa",
  PARTIAL: "Parcial",
  FAILED: "Fallida",
}

export const SYNC_STATUS_CLASSES: Record<SyncRunStatus, string> = {
  RUNNING: "bg-primary/10 text-primary",
  SUCCESS: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  PARTIAL: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  FAILED: "bg-destructive/10 text-destructive",
}

export const SYNC_TRIGGER_LABELS: Record<SyncRunTrigger, string> = {
  MANUAL: "Manual",
  SCHEDULED: "Programada",
  IMPORT: "Importación",
}

/** "campo: anterior → nuevo", o null si el registro no describe un cambio. */
export function formatSyncChange(
  field: string | null,
  oldValue: string | null,
  newValue: string | null,
): string | null {
  if (!field) return null
  return `${field}: ${oldValue ?? "—"} → ${newValue ?? "—"}`
}

export const SYNC_LEVEL_CLASSES: Record<SyncLog["level"], string> = {
  INFO: "text-muted-foreground",
  WARN: "text-amber-700 dark:text-amber-400",
  ERROR: "text-destructive",
}
