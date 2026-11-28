import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"
import {
  confirmPhoneDocument,
  lookupRegistrationDocument,
  startPhone,
  verifyPhone,
} from "#/services/auth"
import type {
  LinkState,
  PhoneAuthResponse,
  RegistrationProfile,
} from "#/services/auth"
import { ME_QUERY_KEY } from "#/query-options/auth"
import { ApiError } from "#/lib/api"
import { clearUserQueries } from "#/lib/query-client"
import { splitContactMessage } from "#/lib/errors"
import { useCountdown } from "#/hooks/use-countdown"
import { SoftixCustomerForm } from "#/components/softix-customer-form"
import { RegistrationDocumentForm } from "#/components/registration-document-form"
import { CAPTCHA_ENABLED, CaptchaWidget } from "#/components/captcha-widget"
import { ContactDialog } from "#/components/contact-dialog"
import { WelcomeOverlay } from "#/components/welcome-overlay"

type Step =
  "phone" | "otp" | "document" | "create-document" | "link" | "create" | "staff"

export function LoginForm({
  redirect,
  className,
  ...props
}: React.ComponentProps<"div"> & { redirect: string }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [step, setStep] = useState<Step>("phone")
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [documentId, setDocumentId] = useState("")
  const [consentAccepted, setConsentAccepted] = useState(false)
  const [captchaToken, setCaptchaToken] = useState("")
  const [captchaReset, setCaptchaReset] = useState(0)
  const [link, setLink] = useState<LinkState | null>(null)
  const [prefill, setPrefill] = useState<RegistrationProfile | null>(null)
  const [linkFromCreate, setLinkFromCreate] = useState(false)
  const [createInitial, setCreateInitial] = useState<{
    documentType: string
    documentId: string
  } | null>(null)
  const [error, setError] = useState("")
  const [welcome, setWelcome] = useState<{
    title: string
    subtitle: string
  } | null>(null)
  const { remaining, isCoolingDown, start: startCooldown } = useCountdown(60)
  const errorInfo = splitContactMessage(error)

  useEffect(() => {
    if (!welcome) return
    const timer = window.setTimeout(() => {
      navigate({ to: redirect })
    }, 1800)
    return () => window.clearTimeout(timer)
  }, [welcome, navigate, redirect])

  const showWelcome = (mode: "login" | "register") => {
    setWelcome({
      title: "¡Bienvenido!",
      subtitle:
        mode === "login"
          ? "Nos alegra verte de nuevo."
          : "Tu cuenta está lista. Empecemos.",
    })
  }

  const startMutation = useMutation({
    mutationFn: () => startPhone(phone, captchaToken || undefined),
    onSuccess: () => {
      setError("")
      setCode("")
      setCaptchaToken("")
      setCaptchaReset((value) => value + 1)
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

  const verifyMutation = useMutation({
    mutationFn: () => verifyPhone(phone, code, consentAccepted),
    onSuccess: (result) => {
      setError("")
      if (result.accessToken && result.user) {
        clearUserQueries(queryClient)
        queryClient.setQueryData(ME_QUERY_KEY, result.user)
        showWelcome("login")
        return
      }
      setPrefill(null)
      setCreateInitial(null)
      setLinkFromCreate(false)
      setLink(result.link)
      if (result.link.status === "NEEDS_CREATE") {
        setStep("create-document")
      } else if (result.link.status === "NEEDS_DOCUMENT") {
        setStep("document")
      } else {
        setStep("staff")
      }
    },
    onError: (e) => {
      if (e instanceof ApiError && e.status === 401) {
        setError("Código inválido o expirado")
      } else {
        setError("No pudimos verificar el código. Intenta de nuevo.")
      }
    },
  })

  const lookupMutation = useMutation({
    mutationFn: ({
      documentType,
      documentId,
    }: {
      documentType: string
      documentId: string
    }) => lookupRegistrationDocument(documentType, documentId),
    onSuccess: (result) => {
      setError("")
      const document = {
        documentType: result.documentType,
        documentId: result.documentId,
      }
      if (result.status === "LINK") {
        setPrefill(result)
        setCreateInitial(document)
        setLinkFromCreate(true)
        setStep("link")
        return
      }
      setPrefill(null)
      setCreateInitial(document)
      setLinkFromCreate(false)
      setStep("create")
    },
    onError: (e) => {
      setError(
        e instanceof ApiError
          ? e.message
          : "No pudimos revisar tus datos. Intenta de nuevo.",
      )
    },
  })

  const confirmMutation = useMutation({
    mutationFn: () => confirmPhoneDocument(link?.challengeId ?? "", documentId),
    onSuccess: (result) => {
      setError("")
      if (result.status === "CREATE") {
        setCreateInitial({
          documentType: result.documentType,
          documentId: result.documentId,
        })
        setPrefill(null)
        setLinkFromCreate(false)
        setStep("create")
        return
      }
      setPrefill(result)
      setLinkFromCreate(false)
      setStep("link")
    },
    onError: (e) => {
      if (e instanceof ApiError) {
        setError(e.message)
      } else {
        setError("No pudimos verificar tus datos. Intenta de nuevo.")
      }
    },
  })

  const resetToPhone = () => {
    setStep("phone")
    setCode("")
    setDocumentId("")
    setLink(null)
    setPrefill(null)
    setLinkFromCreate(false)
    setCreateInitial(null)
    setCaptchaToken("")
    setCaptchaReset((value) => value + 1)
    setError("")
  }

  const handleBack = () => {
    if (step === "phone") {
      window.history.back()
      return
    }
    if (step === "create" || (step === "link" && linkFromCreate)) {
      setStep("create-document")
      setError("")
      return
    }
    resetToPhone()
  }

  const onCompleted = (result: PhoneAuthResponse) => {
    if (result.user) {
      clearUserQueries(queryClient)
      queryClient.setQueryData(ME_QUERY_KEY, result.user)
    }
    showWelcome("register")
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <FieldGroup>
              <button
                type="button"
                onClick={handleBack}
                className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-4" />
                Volver
              </button>

              {step === "phone" && (
                <>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">Iniciar sesión</h1>
                    <p className="text-balance text-muted-foreground">
                      Ingresa tu número de celular para continuar.
                    </p>
                  </div>
                  <Field>
                    <FieldLabel htmlFor="phone">Número de celular</FieldLabel>
                    <Input
                      id="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="300 123 4567"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="consent-accepted"
                        aria-label="Acepto la política de tratamiento de datos"
                        checked={consentAccepted}
                        onCheckedChange={(checked) =>
                          setConsentAccepted(checked === true)
                        }
                      />
                      <div className="text-sm leading-5">
                        Acepto la{" "}
                        <Dialog>
                          <DialogTrigger asChild>
                            <button
                              type="button"
                              className="underline underline-offset-4 hover:text-primary"
                            >
                              política de tratamiento de datos
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-h-[85vh] overflow-y-auto">
                            <DialogHeader className="pr-10">
                              <DialogTitle>
                                Política de tratamiento de datos personales
                              </DialogTitle>
                              <DialogDescription>
                                Texto provisional pendiente de reemplazo por la
                                política oficial de la óptica.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="mt-4 grid gap-3 text-sm leading-6">
                              <p className="font-semibold text-destructive">
                                PLACEHOLDER — este contenido no es la política
                                legal definitiva.
                              </p>
                              <p>
                                Lentes y Marcos Ópticos tratará los datos
                                personales suministrados para gestionar la
                                cuenta, atender solicitudes y prestar los
                                servicios solicitados por el titular.
                              </p>
                              <p>
                                El titular podrá conocer, actualizar, rectificar
                                o solicitar la supresión de sus datos, así como
                                ejercer los demás derechos previstos en la
                                normativa aplicable.
                              </p>
                            </div>
                          </DialogContent>
                        </Dialog>
                        .
                      </div>
                    </div>
                  </Field>
                  <Field>
                    <Button
                      type="button"
                      disabled={
                        startMutation.isPending ||
                        !consentAccepted ||
                        (CAPTCHA_ENABLED && !captchaToken)
                      }
                      onClick={() => startMutation.mutate()}
                    >
                      {startMutation.isPending
                        ? "Enviando código…"
                        : "Continuar"}
                    </Button>
                  </Field>
                </>
              )}

              {step === "otp" && (
                <>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">Verifica tu número</h1>
                    <p className="text-balance text-muted-foreground">
                      Te enviamos un código por WhatsApp a {phone}
                    </p>
                    <button
                      type="button"
                      onClick={resetToPhone}
                      className="text-sm underline-offset-2 hover:underline"
                    >
                      Cambiar número
                    </button>
                  </div>
                  <Field>
                    <FieldLabel htmlFor="code">Código de 6 dígitos</FieldLabel>
                    <Input
                      id="code"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
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
                      type="button"
                      disabled={verifyMutation.isPending || code.length !== 6}
                      onClick={() => verifyMutation.mutate()}
                    >
                      {verifyMutation.isPending ? "Verificando…" : "Verificar"}
                    </Button>
                  </Field>
                  <FieldDescription className="text-center">
                    <button
                      type="button"
                      className="underline-offset-2 hover:underline disabled:pointer-events-none disabled:opacity-50"
                      onClick={() => startMutation.mutate()}
                      disabled={
                        startMutation.isPending ||
                        isCoolingDown ||
                        (CAPTCHA_ENABLED && !captchaToken)
                      }
                    >
                      {startMutation.isPending
                        ? "Reenviando…"
                        : isCoolingDown
                          ? `Reenviar código (${remaining}s)`
                          : "Reenviar código"}
                    </button>
                  </FieldDescription>
                </>
              )}

              {step === "document" && link && (
                <>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">Confirma tus datos</h1>
                    <p className="text-balance text-muted-foreground">
                      {link.documentHints.length > 1
                        ? "Encontramos varios registros con tu número. Ingresa tu documento para confirmar el correcto."
                        : "Encontramos un registro con tu número. Ingresa tu documento para confirmar."}
                    </p>
                    {link.documentHints.length > 1 && (
                      <p className="text-sm text-muted-foreground">
                        Pistas: {link.documentHints.join(", ")}
                      </p>
                    )}
                  </div>
                  <Field>
                    <FieldLabel htmlFor="document-id-login">
                      Número de documento
                    </FieldLabel>
                    <Input
                      id="document-id-login"
                      inputMode="numeric"
                      value={documentId}
                      onChange={(e) =>
                        setDocumentId(e.target.value.replace(/\D/g, ""))
                      }
                      onKeyDown={(event) => {
                        if (
                          !event.ctrlKey &&
                          !event.metaKey &&
                          /[\s.-]/.test(event.key)
                        ) {
                          event.preventDefault()
                        }
                      }}
                      maxLength={10}
                      required
                    />
                  </Field>
                  <Field>
                    <Button
                      type="button"
                      disabled={
                        confirmMutation.isPending ||
                        documentId.trim().length < 1
                      }
                      onClick={() => confirmMutation.mutate()}
                    >
                      {confirmMutation.isPending
                        ? "Verificando…"
                        : "Confirmar y continuar"}
                    </Button>
                  </Field>
                </>
              )}

              {step === "create-document" && (
                <>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">Ingresa tu documento</h1>
                    <p className="text-balance text-muted-foreground">
                      Escríbelo tal como aparece en tu documento.
                    </p>
                  </div>
                  <RegistrationDocumentForm
                    pending={lookupMutation.isPending}
                    initialType={createInitial?.documentType}
                    initialId={createInitial?.documentId}
                    onSubmit={(documentType, documentId) => {
                      setError("")
                      lookupMutation.mutate({ documentType, documentId })
                    }}
                  />
                </>
              )}

              {step === "link" && prefill && (
                <>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">Revisa tus datos</h1>
                    <p className="text-balance text-muted-foreground">
                      Encontramos tu registro. Revisa la información, actualiza
                      lo que haga falta y confirma para crear tu cuenta.
                    </p>
                  </div>
                  <SoftixCustomerForm
                    mode="link"
                    initial={prefill}
                    onCompleted={onCompleted}
                    onChangeDocument={
                      linkFromCreate
                        ? () => {
                            setStep("create-document")
                            setError("")
                          }
                        : undefined
                    }
                  />
                </>
              )}

              {step === "create" && createInitial && (
                <>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">Completa tus datos</h1>
                    <p className="text-balance text-muted-foreground">
                      Completa la información para continuar.
                    </p>
                  </div>
                  <SoftixCustomerForm
                    mode="create"
                    initial={createInitial}
                    onCompleted={onCompleted}
                    onChangeDocument={() => {
                      setStep("create-document")
                      setError("")
                    }}
                  />
                </>
              )}

              {step === "staff" && (
                <div className="flex flex-col items-center gap-3 text-center">
                  <h1 className="text-2xl font-bold">Necesitamos ayudarte</h1>
                  <p className="text-balance text-muted-foreground">
                    No pudimos verificar tu cuenta automáticamente. Para
                    proteger tus datos, un asesor debe revisar el caso.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Escríbenos por WhatsApp o visítanos en la óptica.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <ContactDialog description="Un asesor puede revisar tu caso y ayudarte a completar el registro.">
                      <Button type="button" variant="outline">
                        Contáctanos
                      </Button>
                    </ContactDialog>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetToPhone}
                    >
                      Volver a intentar
                    </Button>
                  </div>
                </div>
              )}

              {error && (
                <div className="grid justify-items-center gap-1 text-center">
                  {errorInfo.text && <FieldError>{errorInfo.text}</FieldError>}
                  {errorInfo.needsContact && (
                    <ContactDialog description="Cuéntanos qué pasó y te ayudamos a completar tu registro.">
                      <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 text-sm"
                      >
                        Contáctanos
                      </Button>
                    </ContactDialog>
                  )}
                </div>
              )}

              {(step === "phone" || step === "otp") && (
                <CaptchaWidget
                  onToken={setCaptchaToken}
                  resetSignal={captchaReset}
                />
              )}
            </FieldGroup>
          </div>
          <div className="relative hidden bg-muted md:block">
            <img
              src="https://images.unsplash.com/photo-1556575925-bb49aac4ab92?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt=""
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <WelcomeOverlay
        open={Boolean(welcome)}
        title={welcome?.title}
        subtitle={welcome?.subtitle}
      />
    </div>
  )
}
