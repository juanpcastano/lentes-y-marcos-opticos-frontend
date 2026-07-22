import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarCheck } from "lucide-react"

import { Button } from "#/components/ui/button"

interface TimeSlotPickerProps {
  /** `undefined` when no date is selected yet */
  slots: string[] | undefined
  selectedSlot: string | undefined
  selectedDate: Date | undefined
  onSelectSlot: (slot: string) => void
}

function formatTimeSlot(slot: string): string {
  const [hours, minutes] = slot.split(":").map(Number)
  const period = hours >= 12 ? "PM" : "AM"
  const displayHour = hours % 12 || 12
  return `${displayHour}:${minutes.toString().padStart(2, "0")} ${period}`
}

export function TimeSlotPicker({
  slots,
  selectedSlot,
  selectedDate,
  onSelectSlot,
}: TimeSlotPickerProps) {
  if (slots === undefined) {
    return (
      <p className="text-base text-muted-foreground md:text-lg">
        Selecciona una fecha para ver los horarios disponibles.
      </p>
    )
  }

  if (slots.length === 0) {
    return (
      <p className="text-base text-muted-foreground md:text-lg">
        No hay horarios disponibles para este día.
      </p>
    )
  }

  const showSummary = selectedDate && selectedSlot

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {slots.map((slot) => (
          <Button
            key={slot}
            variant={slot === selectedSlot ? "default" : "outline"}
            size="lg"
            className="text-sm md:text-base"
            onClick={() => onSelectSlot(slot)}
          >
            {slot}
          </Button>
        ))}
      </div>

      {showSummary && (
        <div className="flex items-center justify-between gap-4 rounded-xl bg-primary p-4 md:p-6">
          <div className="flex items-center gap-3 md:gap-4">
            <CalendarCheck className="size-5 text-primary-foreground/80 md:size-6" />
            <div className="flex flex-col">
              <span className="font-semibold text-primary-foreground md:text-lg">
                Cita seleccionada
              </span>
              <span className="text-sm text-primary-foreground/80 md:text-base">
                {format(selectedDate, "d 'de' MMMM", { locale: es })} a las{" "}
                {formatTimeSlot(selectedSlot)}
              </span>
            </div>
          </div>
          <Button
            className="bg-white text-primary hover:bg-white/90 dark:text-primary-foreground md:text-base"
            onClick={() => {}}
          >
            Confirmar Reserva
          </Button>
        </div>
      )}
    </div>
  )
}
