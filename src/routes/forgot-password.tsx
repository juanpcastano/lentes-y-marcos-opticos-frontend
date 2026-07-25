import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"
import { Button } from "#/components/ui/button"
import { Card, CardContent } from "#/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "#/components/ui/field"
import { Input } from "#/components/ui/input"

export const Route = createFileRoute("/forgot-password")({
  component: RouteComponent,
})

function RouteComponent() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const handleBack = () => {
    window.history.back()
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
                <p className="text-sm text-balance text-muted-foreground">
                  Ingresa tu email y te enviaremos un enlace para restablecer tu
                  contraseña
                </p>
              </div>
              {submitted ? (
                <FieldDescription className="text-center text-base text-foreground">
                  Te enviaremos un enlace de recuperación a tu correo.
                </FieldDescription>
              ) : (
                <form onSubmit={handleSubmit}>
                  <FieldGroup>
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
                    <Field>
                      <Button type="submit">Enviar enlace</Button>
                    </Field>
                  </FieldGroup>
                </form>
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
