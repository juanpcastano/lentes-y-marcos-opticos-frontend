import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "#/components/ui/alert-dialog"
import { Button } from "#/components/ui/button"
import { Field, FieldLabel } from "#/components/ui/field"
import { Input } from "#/components/ui/input"

export const PERMANENT_DELETE_PHRASE = "eliminar de forma permanente"

interface PermanentDeleteDialogProps {
  open: boolean
  title: ReactNode
  description: string
  confirmLabel?: string
  pendingLabel?: string
  isPending?: boolean
  confirmDisabled?: boolean
  children?: ReactNode
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

/**
 * Diálogo genérico para eliminaciones permanentes. El botón de
 * confirmación solo se habilita cuando se escribe la frase exacta.
 */
export function PermanentDeleteDialog({
  open,
  title,
  description,
  confirmLabel = "Eliminar",
  pendingLabel = "Eliminando...",
  isPending = false,
  confirmDisabled = false,
  children,
  onOpenChange,
  onConfirm,
}: PermanentDeleteDialogProps) {
  const [confirmation, setConfirmation] = useState("")

  useEffect(() => {
    if (open) setConfirmation("")
  }, [open])

  const confirmed =
    confirmation.trim() === PERMANENT_DELETE_PHRASE && !confirmDisabled

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
          {children}
        </AlertDialogHeader>
        <Field>
          <FieldLabel htmlFor="permanent-delete-confirmation">
            Escribe{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              {PERMANENT_DELETE_PHRASE}
            </code>{" "}
            para continuar
          </FieldLabel>
          <Input
            id="permanent-delete-confirmation"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder={PERMANENT_DELETE_PHRASE}
            autoComplete="off"
            disabled={isPending}
          />
        </Field>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending || !confirmed}
            onClick={(event) => {
              event.preventDefault()
              if (confirmed) onConfirm()
            }}
          >
            {isPending ? pendingLabel : confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
