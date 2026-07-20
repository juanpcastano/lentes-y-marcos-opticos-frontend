export interface AppointmentDay {
  /** ISO date string "yyyy-MM-dd" */
  date: string
  /** Available time slots, e.g. ["09:00", "09:45"] */
  slots: string[]
}
