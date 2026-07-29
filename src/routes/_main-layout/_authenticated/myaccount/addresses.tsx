import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { MapPin, Plus, Pencil, Trash2 } from "lucide-react"
import createAddressesQueryOptions, {
  useDeleteAddress,
} from "#/query-options/addresses"
import type { Address } from "#/services/addresses"
import { AddressFormDialog } from "#/components/address-form"
import { Button } from "#/components/ui/button"
import { Card, CardContent, CardHeader } from "#/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "#/components/ui/alert-dialog"
import { toast } from "#/hooks/use-toast"

export const Route = createFileRoute(
  "/_main-layout/_authenticated/myaccount/addresses",
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: addresses } = useSuspenseQuery(createAddressesQueryOptions())
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Address | undefined>(undefined)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const deleteMutation = useDeleteAddress()

  const openAdd = () => {
    setEditing(undefined)
    setFormOpen(true)
  }

  const openEdit = (address: Address) => {
    setEditing(address)
    setFormOpen(true)
  }

  const handleDelete = () => {
    if (!deletingId) return
    deleteMutation.mutate(deletingId, {
      onSuccess: () => {
        toast({ variant: "success", title: "Dirección eliminada" })
        setDeletingId(null)
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "No se pudo eliminar la dirección.",
        })
      },
    })
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Direcciones</h1>
        <Button onClick={openAdd}>
          <Plus className="size-4" />
          Agregar dirección
        </Button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState onAdd={openAdd} />
      ) : (
        <div className="flex flex-col gap-4">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={() => openEdit(address)}
              onDelete={() => setDeletingId(address.id)}
            />
          ))}
        </div>
      )}

      <AddressFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        address={editing}
      />

      <AlertDialog
        open={deletingId !== null}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar dirección</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Eliminando..." : "Sí, eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function AddressCard({
  address,
  onEdit,
  onDelete,
}: {
  address: Address
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-muted-foreground" />
            <span className="font-medium">{address.label}</span>
            {address.isDefault && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Por defecto
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Pencil className="size-4" />
              Editar
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="size-4 text-destructive" />
              Eliminar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-0.5 text-sm text-muted-foreground">
          <span>{address.street}</span>
          {address.details && <span>{address.details}</span>}
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-4xl bg-muted/40 py-12 text-center">
      <MapPin className="size-8 text-muted-foreground" aria-hidden />
      <p className="text-sm text-muted-foreground">
        No tienes direcciones guardadas.
      </p>
      <Button variant="outline" onClick={onAdd}>
        <Plus className="size-4" />
        Agregar dirección
      </Button>
    </div>
  )
}
