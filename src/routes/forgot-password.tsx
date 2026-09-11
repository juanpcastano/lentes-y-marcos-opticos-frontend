import { useState } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
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
import {
  requestPasswordReset,
  verifyPasswordReset,
  confirmPasswordReset,
} from "#/services/auth"
import { ApiError } from "#/lib/api"
import { useCountdown } from "#/hooks/use-countdown"

type Step = "email" | "code" | "password" | "done"

export const Route = createFileRoute("/forgot-password")({
  component: RouteComponent,
})

function RouteComponent() {
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const { remaining, isCoolingDown, start: startCooldown } = useCountdown(60)

  const requestMutation = useMutation({
    mutationFn: () => requestPasswordReset(email),
    onSuccess: () => {
      setError("")
      setCode("")
      setStep("code")
      startCooldown()
    },
    onError: (e) => {
      if (e instanceof ApiError && e.status === 404) {
        setError("Este email no está registrado")
      } else if (e instanceof ApiError && e.status === 429) {
        setError(e.message)
      } else {
        setError("No pudimos enviar el código. Intenta de nuevo.")
      }
    },
  })

  const verifyMutation = useMutation({
    mutationFn: () => verifyPasswordReset(email, code),
    onSuccess: () => {
      setError("")
      setStep("password")
    },
    onError: (e) => {
      if (e instanceof ApiError && e.status === 401) {
        setError("Código inválido o expirado")
      } else {
        setError("No pudimos verificar el código. Intenta de nuevo.")
      }
    },
  })

  const confirmMutation = useMutation({
    mutationFn: () => confirmPasswordReset(email, code, newPassword),
    onSuccess: () => {
      setError("")
      setStep("done")
    },
    onError: (e) => {
      if (e instanceof ApiError && e.status === 401) {
        setError("Código inválido o expirado")
      } else if (e instanceof ApiError && e.status === 400) {
        setError(e.message)
      } else {
        setError("No pudimos restablecer la contraseña. Intenta de nuevo.")
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step === "email") {
      requestMutation.mutate()
    } else if (step === "code") {
      verifyMutation.mutate()
    } else if (step === "password") {
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
      confirmMutation.mutate()
    }
  }

  const handleBack = () => {
    window.history.back()
  }

  const resetToEmail = () => {
    setStep("email")
    setCode("")
    setNewPassword("")
    setConfirmPassword("")
    setError("")
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-md">
        <Card className="overflow-hidden p-0">
          <CardContent className="p-6 md:p-8">
            <button
              type="button"
              onClick={handleBack}
              className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Volver
            </button>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Recuperar Contraseña</h1>
              </div>

              {step === "email" && (
                <form onSubmit={handleSubmit}>
                  <FieldGroup>
                    <FieldDescription className="text-balance text-muted-foreground">
                      Ingresa tu email y te enviaremos un código para
                      restablecer tu contraseña
                    </FieldDescription>
                    <Field>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </Field>
                    {error && (
                      <FieldError className="text-center">{error}</FieldError>
                    )}
                    <Field>
                      <Button
                        type="submit"
                        disabled={requestMutation.isPending}
                      >
                        {requestMutation.isPending
                          ? "Enviando..."
                          : "Enviar código"}
                      </Button>
                    </Field>
                  </FieldGroup>
                </form>
              )}

              {step === "code" && (
                <form onSubmit={handleSubmit}>
                  <FieldGroup>
                    <FieldDescription className="text-balance text-muted-foreground">
                      Te enviamos un código a {email}
                    </FieldDescription>
                    <Field>
                      <FieldLabel htmlFor="code">
                        Código de 6 dígitos
                      </FieldLabel>
                      <Input
                        id="code"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        required
                        value={code}
                        onChange={(e) =>
                          setCode(e.target.value.replace(/\D/g, ""))
                        }
                      />
                    </Field>
                    {error && (
                      <FieldError className="text-center">{error}</FieldError>
                    )}
                    <Field>
                      <Button type="submit" disabled={verifyMutation.isPending}>
                        {verifyMutation.isPending
                          ? "Verificando..."
                          : "Verificar"}
                      </Button>
                    </Field>
                    <FieldDescription className="text-center">
                      <button
                        type="button"
                        className="text-sm underline-offset-2 hover:underline disabled:pointer-events-none disabled:opacity-50"
                        onClick={() => requestMutation.mutate()}
                        disabled={requestMutation.isPending || isCoolingDown}
                      >
                        {requestMutation.isPending
                          ? "Reenviando..."
                          : isCoolingDown
                            ? `Reenviar código (${remaining}s)`
                            : "Reenviar código"}
                      </button>
                    </FieldDescription>
                    <button
                      type="button"
                      onClick={resetToEmail}
                      className="text-sm underline-offset-2 hover:underline"
                    >
                      Cambiar email
                    </button>
                  </FieldGroup>
                </form>
              )}

              {step === "password" && (
                <form onSubmit={handleSubmit}>
                  <FieldGroup>
                    <FieldDescription className="text-balance text-muted-foreground">
                      Ingresa tu nueva contraseña
                    </FieldDescription>
                    <Field>
                      <FieldLabel htmlFor="new-password">
                        Nueva contraseña
                      </FieldLabel>
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
                    {error && (
                      <FieldError className="text-center">{error}</FieldError>
                    )}
                    <Field>
                      <Button
                        type="submit"
                        disabled={confirmMutation.isPending}
                      >
                        {confirmMutation.isPending
                          ? "Guardando..."
                          : "Confirmar"}
                      </Button>
                    </Field>
                  </FieldGroup>
                </form>
              )}

              {step === "done" && (
                <FieldDescription className="text-center text-base text-foreground">
                  Tu contraseña fue restablecida correctamente.{" "}
                  <Link
                    to="/login"
                    className="underline-offset-2 hover:underline"
                  >
                    Iniciar sesión
                  </Link>
                </FieldDescription>
              )}

              <Field>
                <Button type="button" variant="outline" onClick={handleBack}>
                  Cancelar
                </Button>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
