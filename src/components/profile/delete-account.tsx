import { useNavigate } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Trash2 } from "lucide-react"
import { ME_QUERY_KEY } from "#/query-options/auth"
import { logout } from "#/services/auth"
import { Button } from "#/components/ui/button"
import { Card, CardContent } from "#/components/ui/card"
import { Field, FieldDescription, FieldLabel } from "#/components/ui/field"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "#/components/ui/dialog"
import { Input } from "#/components/ui/input"
import { PERMANENT_DELETE_PHRASE } from "#/components/permanent-delete-dialog"

function formatDeletionDate(): string {
  const date = new Date()
  date.setDate(date.getDate() + 15)
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

export function DeleteAccount() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [confirmation, setConfirmation] = useState("")

  const confirmed = confirmation.trim() === PERMANENT_DELETE_PHRASE

  const handleConfirm = async () => {
    if (!confirmed) return
    await logout()
    await queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY })
    navigate({ to: "/" })
  }

  return (
    <Card className="p-0">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Trash2 className="size-5 text-destructive" />
          <h2 className="text-lg font-semibold">Zona de peligro</h2>
        </div>
        <FieldDescription>
          La eliminación de tu cuenta es permanente. Una vez confirmes, tu
          cuenta será programada para eliminación.
        </FieldDescription>
        <Dialog
          open={open}
          onOpenChange={(next) => {
            setOpen(next)
            if (next) setConfirmation("")
          }}
        >
          <DialogTrigger asChild>
            <Button variant="destructive" className="mt-4">
              Eliminar cuenta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Eliminar cuenta</DialogTitle>
              <DialogDescription>
                ¿Estás seguro? Tu cuenta será eliminada el{" "}
                <strong>{formatDeletionDate()}</strong>. Durante este periodo
                puedes cancelar la eliminación iniciando sesión.
              </DialogDescription>
            </DialogHeader>
            <Field>
              <FieldLabel htmlFor="delete-account-confirmation">
                Escribe{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  {PERMANENT_DELETE_PHRASE}
                </code>{" "}
                para continuar
              </FieldLabel>
              <Input
                id="delete-account-confirmation"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                placeholder={PERMANENT_DELETE_PHRASE}
                autoComplete="off"
              />
            </Field>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button
                variant="destructive"
                disabled={!confirmed}
                onClick={handleConfirm}
              >
                Sí, eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
