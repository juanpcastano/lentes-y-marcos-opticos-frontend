import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Lock } from "lucide-react"
import { changePassword } from "#/services/auth"
import { Button } from "#/components/ui/button"
import { Card, CardContent } from "#/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "#/components/ui/field"
import { Input } from "#/components/ui/input"

export function PasswordForm() {
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [changed, setChanged] = useState(false)

  const mutation = useMutation({
    mutationFn: () => changePassword({ oldPassword, newPassword }),
    onSuccess: () => {
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setError("")
      setChanged(true)
    },
  })

  const reset = () => {
    setOldPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setError("")
    setChanged(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setChanged(false)
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }
    if (newPassword.length === 0) {
      setError("La nueva contraseña no puede estar vacía")
      return
    }
    setError("")
    mutation.mutate()
  }

  return (
    <Card className="p-0">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Lock className="size-5" />
          <h2 className="text-lg font-semibold">Seguridad</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="old-password">Contraseña actual</FieldLabel>
              <Input
                id="old-password"
                type="password"
                required
                value={oldPassword}
                onChange={(e) => {
                  setOldPassword(e.target.value)
                  setChanged(false)
                }}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="new-password">Nueva contraseña</FieldLabel>
              <Input
                id="new-password"
                type="password"
                required
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value)
                  setChanged(false)
                  setError("")
                }}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirmar nueva contraseña
              </FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setChanged(false)
                  setError("")
                }}
              />
              {error && <FieldError>{error}</FieldError>}
            </Field>
            {changed && (
              <FieldDescription className="text-foreground">
                Contraseña actualizada correctamente
              </FieldDescription>
            )}
            <div className="flex gap-2">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Guardando..." : "Guardar contraseña"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={reset}
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
