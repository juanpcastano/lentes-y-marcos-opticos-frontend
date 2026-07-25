import { useNavigate } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Trash2 } from "lucide-react"
import { ME_QUERY_KEY } from "#/query-options/auth"
import { logout } from "#/services/auth"
import { Button } from "#/components/ui/button"
import { Card, CardContent } from "#/components/ui/card"
import { FieldDescription } from "#/components/ui/field"
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

  const handleConfirm = async () => {
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
        <Dialog open={open} onOpenChange={setOpen}>
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
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button variant="destructive" onClick={handleConfirm}>
                Sí, eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
