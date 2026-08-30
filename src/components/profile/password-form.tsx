import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Lock } from "lucide-react"
import {
  requestPasswordCode,
  verifyPasswordCode,
  setPassword,
} from "#/services/auth"
import {
  ME_QUERY_KEY,
  createPasswordCodeStatusQueryOptions,
} from "#/query-options/auth"
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
import { ApiError } from "#/lib/api"
import { useCountdown } from "#/hooks/use-countdown"

type Step = "request" | "verify" | "set" | "done"

interface PasswordFormProps {
  hasPassword: boolean
}

export function PasswordForm({ hasPassword }: PasswordFormProps) {
  const queryClient = useQueryClient()
  const [step, setStep] = useState<Step>("request")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const { remaining, isCoolingDown, start: startCooldown } = useCountdown(60)

  const statusQuery = useQuery(createPasswordCodeStatusQueryOptions())

  useEffect(() => {
    const status = statusQuery.data
    if (!status) return
    if (status.active) {
      setStep((prev) => (prev === "request" ? "verify" : prev))
    } else if (status.cooldownSeconds > 0) {
      startCooldown(status.cooldownSeconds)
    }
  }, [statusQuery.data, startCooldown])

  const requestCodeMutation = useMutation({
    mutationFn: () => requestPasswordCode(),
    onSuccess: () => {
      setError("")
      setCode("")
      setStep("verify")
      startCooldown()
    },
    onError: (e) => {
      if (e instanceof ApiError && e.status === 429) {
        setError(e.message)
      } else {
        setError("No pudimos enviar el código. Intenta de nuevo.")
      }
    },
  })

  const verifyCodeMutation = useMutation({
    mutationFn: () => verifyPasswordCode(code),
    onSuccess: () => {
      setError("")
      setStep("set")
    },
    onError: (e) => {
      if (e instanceof ApiError && e.status === 401) {
        setError("Código inválido o expirado")
      } else {
        setError("No pudimos verificar el código. Intenta de nuevo.")
      }
    },
  })

  const setPasswordMutation = useMutation({
    mutationFn: () => setPassword(code, newPassword),
    onSuccess: () => {
      setError("")
      setStep("done")
      queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY })
    },
    onError: (e) => {
      if (e instanceof ApiError && e.status === 401) {
        setError("Código inválido o expirado")
      } else if (e instanceof ApiError && e.status === 400) {
        setError(e.message)
      } else {
        setError("No pudimos guardar la contraseña. Intenta de nuevo.")
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step === "verify") {
      verifyCodeMutation.mutate()
    } else if (step === "set") {
      if (newPassword !== confirmPassword) {
        setError("Las contraseñas no coinciden")
        return
      }
      if (newPassword.length < 8) {
        setError("La contraseña debe tener al menos 8 caracteres")
        return
      }
      if (!/[A-Z]/.test(newPassword)) {
        setError("La contraseña debe tener al menos una mayúscula")
        return
      }
      setPasswordMutation.mutate()
    }
  }

  const reset = () => {
    setStep("request")
    setCode("")
    setNewPassword("")
    setConfirmPassword("")
    setError("")
  }

  return (
    <Card className="p-0">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Lock className="size-5" />
          <h2 className="text-lg font-semibold">
            {hasPassword ? "Cambiar contraseña" : "Agregar contraseña"}
          </h2>
        </div>

        {step === "request" && (
          <FieldGroup>
            <FieldDescription>
              Te enviaremos un código a tu email para verificar tu identidad.
            </FieldDescription>
            <Button
              type="button"
              disabled={requestCodeMutation.isPending || isCoolingDown}
              onClick={() => requestCodeMutation.mutate()}
            >
              {requestCodeMutation.isPending
                ? "Enviando..."
                : isCoolingDown
                  ? `Enviar código (${remaining}s)`
                  : "Enviar código"}
            </Button>
            {error && <FieldError>{error}</FieldError>}
          </FieldGroup>
        )}

        {step === "verify" && (
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <FieldDescription>
                Te enviamos un código a tu email.
              </FieldDescription>
              <Field>
                <FieldLabel htmlFor="code">Código de 6 dígitos</FieldLabel>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                />
              </Field>
              {error && <FieldError>{error}</FieldError>}
              <Button type="submit" disabled={verifyCodeMutation.isPending}>
                {verifyCodeMutation.isPending ? "Verificando..." : "Verificar"}
              </Button>
              <FieldDescription className="text-center">
                <button
                  type="button"
                  className="text-sm underline-offset-2 hover:underline disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => requestCodeMutation.mutate()}
                  disabled={requestCodeMutation.isPending || isCoolingDown}
                >
                  {requestCodeMutation.isPending
                    ? "Reenviando..."
                    : isCoolingDown
                      ? `Reenviar código (${remaining}s)`
                      : "Reenviar código"}
                </button>
              </FieldDescription>
            </FieldGroup>
          </form>
        )}

        {step === "set" && (
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="new-password">Nueva contraseña</FieldLabel>
                <Input
                  id="new-password"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <FieldDescription>
                  Mínimo 8 caracteres y una mayúscula
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="confirm-password">
                  Confirmar contraseña
                </FieldLabel>
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Field>
              {error && <FieldError>{error}</FieldError>}
              <Button type="submit" disabled={setPasswordMutation.isPending}>
                {setPasswordMutation.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </FieldGroup>
          </form>
        )}

        {step === "done" && (
          <FieldGroup>
            <FieldDescription className="text-foreground">
              {hasPassword
                ? "Contraseña actualizada correctamente"
                : "Contraseña agregada correctamente"}
            </FieldDescription>
            <Button type="button" variant="outline" onClick={reset}>
              Hecho
            </Button>
          </FieldGroup>
        )}
      </CardContent>
    </Card>
  )
}
