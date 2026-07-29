import { useEffect, useState } from "react"
import { z } from "zod"
import { Button } from "#/components/ui/button"
import { Checkbox } from "#/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "#/components/ui/field"
import { Input } from "#/components/ui/input"
import { useAddAddress, useUpdateAddress } from "#/query-options/addresses"
import { toast } from "#/hooks/use-toast"
import type { Address } from "#/services/addresses"

const addressSchema = z.object({
  label: z.string().min(1, "El nombre es obligatorio"),
  street: z.string().min(1, "La dirección es obligatoria"),
  details: z.string(),
  isDefault: z.boolean(),
})

type AddressFormValues = z.infer<typeof addressSchema>

const emptyValues: AddressFormValues = {
  label: "",
  street: "",
  details: "",
  isDefault: false,
}

function toValues(address: Address): AddressFormValues {
  return {
    label: address.label,
    street: address.street,
    details: address.details,
    isDefault: address.isDefault,
  }
}

export function AddressFormDialog({
  open,
  onOpenChange,
  address,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  address?: Address
}) {
  const isEdit = !!address
  const [values, setValues] = useState<AddressFormValues>(emptyValues)
  const [errors, setErrors] = useState<
    Partial<Record<keyof AddressFormValues, string>>
  >({})

  const addMutation = useAddAddress()
  const updateMutation = useUpdateAddress()
  const pending = addMutation.isPending || updateMutation.isPending

  useEffect(() => {
    if (open) {
      const base = address ? toValues(address) : emptyValues
      setValues(base)
      setErrors({})
    }
  }, [open, address])

  const update = <TKey extends keyof AddressFormValues>(
    key: TKey,
    value: AddressFormValues[TKey],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const result = addressSchema.safeParse(values)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof AddressFormValues, string>> = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof AddressFormValues
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    if (address) {
      updateMutation.mutate(
        { id: address.id, input: result.data },
        {
          onSuccess: () => {
            toast({ variant: "success", title: "Dirección actualizada" })
            onOpenChange(false)
          },
          onError: () => {
            toast({
              variant: "destructive",
              title: "No se pudo actualizar la dirección.",
            })
          },
        },
      )
    } else {
      addMutation.mutate(
        { ...result.data },
        {
          onSuccess: () => {
            toast({ variant: "success", title: "Dirección agregada" })
            onOpenChange(false)
          },
          onError: () => {
            toast({
              variant: "destructive",
              title: "No se pudo agregar la dirección.",
            })
          },
        },
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar dirección" : "Nueva dirección"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Actualiza los datos de tu dirección."
              : "Completa los datos de tu nueva dirección."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="address-label">Nombre</FieldLabel>
              <Input
                id="address-label"
                placeholder="Casa, Oficina..."
                value={values.label}
                onChange={(e) => update("label", e.target.value)}
              />
              {errors.label && <FieldError>{errors.label}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="address-street">Dirección</FieldLabel>
              <Input
                id="address-street"
                placeholder="Calle 5 # 12-34"
                value={values.street}
                onChange={(e) => update("street", e.target.value)}
              />
              {errors.street && <FieldError>{errors.street}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="address-details">
                Detalles (opcional)
              </FieldLabel>
              <Input
                id="address-details"
                placeholder="Apto, piso, torre..."
                value={values.details}
                onChange={(e) => update("details", e.target.value)}
              />
            </Field>
            <Field orientation="horizontal">
              <Checkbox
                id="address-default"
                checked={values.isDefault}
                onCheckedChange={(checked) =>
                  update("isDefault", checked === true)
                }
              />
              <FieldLabel htmlFor="address-default">
                Dirección por defecto
              </FieldLabel>
            </Field>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={pending}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={pending}>
                {pending ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
