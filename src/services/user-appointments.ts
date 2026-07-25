export type UserAppointmentStatus = "pending" | "completed"

export type MedicalResult = {
  prescription?: string
  notes?: string
}

export type UserAppointment = {
  id: string
  date: string
  time: string
  status: UserAppointmentStatus
  medicalResult?: MedicalResult
}

export async function fetchUserAppointments(): Promise<UserAppointment[]> {
  return [
    {
      id: "CITA-2041",
      date: "2026-08-12",
      time: "10:00",
      status: "pending",
    },
    {
      id: "CITA-2038",
      date: "2026-08-18",
      time: "15:30",
      status: "pending",
    },
    {
      id: "CITA-1010",
      date: "2026-06-22",
      time: "09:00",
      status: "completed",
      medicalResult: {
        prescription:
          "Esf. -1.25 OD / -1.00 OIE. Cil. -0.50 OD / -0.25 OIE. Add. +1.00",
        notes:
          "Se recomienda uso de lentes para conducción nocturna. Revisión en 12 meses.",
      },
    },
    {
      id: "CITA-0992",
      date: "2026-05-15",
      time: "11:15",
      status: "completed",
      medicalResult: {
        prescription: "Esf. -2.00 OD / -2.25 OIE",
      },
    },
    {
      id: "CITA-0975",
      date: "2026-04-03",
      time: "16:15",
      status: "completed",
      medicalResult: {
        notes: "Paciente refiere fatiga visual. Se sugieren lubricantes.",
      },
    },
    {
      id: "CITA-0950",
      date: "2026-02-19",
      time: "14:00",
      status: "completed",
    },
  ]
}
