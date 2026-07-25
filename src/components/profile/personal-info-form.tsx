import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { User } from "lucide-react"
import { ME_QUERY_KEY } from "#/query-options/auth"
import { updateProfile } from "#/services/auth"
import type { User as AuthUser } from "#/services/auth"
import { Button } from "#/components/ui/button"
import { Card, CardContent } from "#/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "#/components/ui/field"
import { Input } from "#/components/ui/input"

interface PersonalInfoFormProps {
  user: AuthUser
}

export function PersonalInfoForm({ user }: PersonalInfoFormProps) {
  const queryClient = useQueryClient()
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [phone, setPhone] = useState(user.phone)
  const [saved, setSaved] = useState(false)

  const mutation = useMutation({
    mutationFn: () => updateProfile({ name, email, phone }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY })
      setSaved(true)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate()
  }

  const handleCancel = () => {
    setName(user.name)
    setEmail(user.email)
    setPhone(user.phone)
    setSaved(false)
  }

  const handleDirty = () => {
    if (saved) setSaved(false)
  }

  return (
    <Card className="p-0">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <User className="size-5" />
          <h2 className="text-lg font-semibold">Información Personal</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nombre</FieldLabel>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  handleDirty()
                }}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  handleDirty()
                }}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="phone">Teléfono</FieldLabel>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  handleDirty()
                }}
              />
            </Field>
            {saved && (
              <FieldDescription className="text-foreground">
                Cambios guardados correctamente
              </FieldDescription>
            )}
            <div className="flex gap-2">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Guardando..." : "Guardar cambios"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={mutation.isPending}
              >
                Cancelar
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
