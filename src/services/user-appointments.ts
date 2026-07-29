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

let nextId = 2042
function generateId(): string {
  return `CITA-${nextId++}`
}

let pendingAppointment: UserAppointment | null = null

const completedAppointments: UserAppointment[] = [
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

export async function fetchUserAppointments(): Promise<UserAppointment[]> {
  return [
    ...(pendingAppointment ? [pendingAppointment] : []),
    ...completedAppointments,
  ]
}

export async function bookAppointment(
  date: string,
  time: string,
): Promise<UserAppointment> {
  if (pendingAppointment) {
    throw new Error(
      "Ya tienes una cita pendiente. Solo puedes tener una cita a la vez.",
    )
  }
  const appointment: UserAppointment = {
    id: generateId(),
    date,
    time,
    status: "pending",
  }
  pendingAppointment = appointment
  return appointment
}

export async function rescheduleAppointment(
  date: string,
  time: string,
): Promise<UserAppointment> {
  if (!pendingAppointment) {
    throw new Error("No tienes una cita pendiente para reprogramar.")
  }
  pendingAppointment = { ...pendingAppointment, date, time }
  return pendingAppointment
}

export async function cancelAppointment(): Promise<void> {
  if (!pendingAppointment) {
    throw new Error("No tienes una cita pendiente para cancelar.")
  }
  pendingAppointment = null
}
