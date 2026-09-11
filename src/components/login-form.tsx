import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Link, useNavigate } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"
import {
  login,
  getLoginOptions,
  requestLoginCode,
  verifyLoginCode,
  loginWithGoogle,
  GOOGLE_CLIENT_ID_VALUE,
  isGoogleReady,
} from "#/services/auth"
import { ME_QUERY_KEY } from "#/query-options/auth"
import { ApiError } from "#/lib/api"
import { useCountdown } from "#/hooks/use-countdown"

type Step = "email" | "password" | "otp"

export function LoginForm({
  redirect,
  className,
  ...props
}: React.ComponentProps<"div"> & { redirect: string }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const { remaining, isCoolingDown, start: startCooldown } = useCountdown(60)

  const optionsMutation = useMutation({
    mutationFn: () => getLoginOptions(email),
    onSuccess: (options) => {
      setError("")
      if (options.hasPassword) {
        setStep("password")
      } else {
        codeRequestMutation.mutate()
      }
    },
    onError: (e) => {
      if (e instanceof ApiError && e.status === 404) {
        setError("Este email no está registrado")
      } else {
        setError("No pudimos verificar tu email. Intenta de nuevo.")
      }
    },
  })

  const codeRequestMutation = useMutation({
    mutationFn: () => requestLoginCode(email),
    onSuccess: () => {
      setError("")
      setCode("")
      setStep("otp")
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

  const loginMutation = useMutation({
    mutationFn: () => login({ email, password }),
    onSuccess: (user) => {
      queryClient.setQueryData(ME_QUERY_KEY, user)
      navigate({ to: redirect })
    },
    onError: (e) => {
      if (e instanceof ApiError && e.status === 401) {
        setError("Email o contraseña incorrectos")
      } else {
        setError("No pudimos iniciar sesión. Intenta de nuevo.")
      }
    },
  })

  const verifyCodeMutation = useMutation({
    mutationFn: () => verifyLoginCode(email, code),
    onSuccess: (user) => {
      queryClient.setQueryData(ME_QUERY_KEY, user)
      navigate({ to: redirect })
    },
    onError: (e) => {
      if (e instanceof ApiError && e.status === 401) {
        setError("Código inválido o expirado")
      } else {
        setError("No pudimos verificar el código. Intenta de nuevo.")
      }
    },
  })

  // --- Google Identity Services (unchanged) ---
  const googleButtonRef = useRef<HTMLDivElement>(null)

  const googleMutation = useMutation({
    mutationFn: (idToken: string) => loginWithGoogle(idToken),
    onSuccess: (user) => {
      queryClient.setQueryData(ME_QUERY_KEY, user)
      navigate({ to: redirect })
    },
  })

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID_VALUE) return

    const initGoogle = () => {
      if (!isGoogleReady() || !googleButtonRef.current) return
      window.google!.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID_VALUE,
        callback: (response) => {
          if (response.credential) {
            googleMutation.mutate(response.credential)
          }
        },
      })
      window.google!.accounts.id.renderButton(googleButtonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
      })
    }

    if (isGoogleReady()) {
      initGoogle()
      return
    }

    const timer = window.setInterval(() => {
      if (isGoogleReady()) {
        window.clearInterval(timer)
        initGoogle()
      }
    }, 100)
    return () => window.clearInterval(timer)
  }, [redirect])

  const handleGoogleLogin = () => {
    const btn =
      googleButtonRef.current?.querySelector<HTMLElement>('div[role="button"]')
    btn?.click()
  }

  const resetToEmail = () => {
    setStep("email")
    setPassword("")
    setCode("")
    setError("")
  }

  const handleBack = () => {
    window.history.back()
  }

  const googleSection = (
    <>
      <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
        O ingresa con Google
      </FieldSeparator>
      <Field className="flex gap-4">
        <Button variant="outline" type="button" onClick={handleGoogleLogin}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              fill="currentColor"
            />
          </svg>
          <span className="sr-only">Login with Google</span>
        </Button>
        <div
          ref={googleButtonRef}
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "-9999px",
            top: "0",
            width: "1px",
            height: "1px",
            overflow: "hidden",
          }}
        />
      </Field>
      {googleMutation.isError && (
        <FieldDescription className="text-center text-destructive">
          {googleMutation.error instanceof Error
            ? googleMutation.error.message
            : "No se pudo iniciar sesión con Google"}
        </FieldDescription>
      )}
    </>
  )

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            className="p-6 md:p-8"
            onSubmit={(e) => {
              e.preventDefault()
              if (step === "email") {
                optionsMutation.mutate()
              } else if (step === "password") {
                loginMutation.mutate()
              } else {
                verifyCodeMutation.mutate()
              }
            }}
          >
            <FieldGroup>
              <button
                type="button"
                onClick={handleBack}
                className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-4" />
                Volver
              </button>

              {/* Step 1: Email */}
              {step === "email" && (
                <>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">Bienvenido De Vuelta</h1>
                    <p className="text-balance text-muted-foreground">
                      Ingresa tu email para continuar
                    </p>
                  </div>
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
                    <Button type="submit" disabled={optionsMutation.isPending}>
                      {optionsMutation.isPending
                        ? "Verificando..."
                        : "Continuar"}
                    </Button>
                  </Field>
                </>
              )}

              {/* Step 2: Password */}
              {step === "password" && (
                <>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">Bienvenido De Vuelta</h1>
                    <p className="text-balance text-muted-foreground">
                      {email}
                    </p>
                    <button
                      type="button"
                      onClick={resetToEmail}
                      className="text-sm underline-offset-2 hover:underline"
                    >
                      Cambiar email
                    </button>
                  </div>
                  <Field>
                    <div className="flex items-center">
                      <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                      <Link
                        to="/forgot-password"
                        className="ml-auto text-sm underline-offset-2 hover:underline"
                      >
                        Olvidaste tu contraseña?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <Button type="submit" disabled={loginMutation.isPending}>
                      {loginMutation.isPending
                        ? "Ingresando..."
                        : "Iniciar sesión"}
                    </Button>
                  </Field>
                  <FieldDescription className="text-center">
                    <button
                      type="button"
                      className="underline-offset-2 hover:underline disabled:pointer-events-none disabled:opacity-50"
                      onClick={() => codeRequestMutation.mutate()}
                      disabled={codeRequestMutation.isPending || isCoolingDown}
                    >
                      {codeRequestMutation.isPending
                        ? "Enviando código..."
                        : isCoolingDown
                          ? `Código enviado (${remaining}s)`
                          : "o usar código de verificación"}
                    </button>
                  </FieldDescription>
                </>
              )}

              {/* Step 3: OTP */}
              {step === "otp" && (
                <>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">Verificar código</h1>
                    <p className="text-balance text-muted-foreground">
                      Te enviamos un código a {email}
                    </p>
                    <button
                      type="button"
                      onClick={resetToEmail}
                      className="text-sm underline-offset-2 hover:underline"
                    >
                      Cambiar email
                    </button>
                  </div>
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
                      onChange={(e) =>
                        setCode(e.target.value.replace(/\D/g, ""))
                      }
                    />
                  </Field>
                  <Field>
                    <Button
                      type="submit"
                      disabled={verifyCodeMutation.isPending}
                    >
                      {verifyCodeMutation.isPending
                        ? "Verificando..."
                        : "Verificar"}
                    </Button>
                  </Field>
                  <FieldDescription className="text-center">
                    <button
                      type="button"
                      className="underline-offset-2 hover:underline disabled:pointer-events-none disabled:opacity-50"
                      onClick={() => codeRequestMutation.mutate()}
                      disabled={codeRequestMutation.isPending || isCoolingDown}
                    >
                      {codeRequestMutation.isPending
                        ? "Reenviando..."
                        : isCoolingDown
                          ? `Reenviar código (${remaining}s)`
                          : "Reenviar código"}
                    </button>
                  </FieldDescription>
                </>
              )}

              {/* Error message (shared across steps) */}
              {error && (
                <FieldError className="text-center">{error}</FieldError>
              )}

              {/* Google section (always visible) */}
              {googleSection}

              <FieldDescription className="text-center">
                No tienes una cuenta aún?{" "}
                <Link to="/signup" search={{ redirect }}>
                  Registrarse
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="relative hidden bg-muted md:block">
            <img
              src="https://images.unsplash.com/photo-1556575925-bb49aac4ab92?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
