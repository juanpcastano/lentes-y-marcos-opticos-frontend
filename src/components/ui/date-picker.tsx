import { Input } from "#/components/ui/input"
import { cn } from "#/lib/utils"

interface DatePickerProps {
  id?: string
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function DatePicker({ id, value, onChange, disabled }: DatePickerProps) {
  return (
    <Input
      id={id}
      type="date"
      value={value ?? ""}
      min="1900-01-01"
      max={toIsoDate(new Date())}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className={cn(
        "h-9 w-full rounded-3xl border border-transparent bg-input/50 px-3 text-base font-normal md:text-sm dark:bg-input/50 [&::-webkit-calendar-picker-indicator]:opacity-60 dark:[&::-webkit-calendar-picker-indicator]:invert",
        !value && "text-muted-foreground",
      )}
    />
  )
}
