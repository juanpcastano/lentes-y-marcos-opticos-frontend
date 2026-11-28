import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Button } from "#/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "#/components/ui/field"
import { Input } from "#/components/ui/input"
import { DatePicker } from "#/components/ui/date-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select"
import { ApiError } from "#/lib/api"
import { documentTypeLabel } from "#/lib/document-types"
import { splitContactMessage } from "#/lib/errors"
import { ContactDialog } from "#/components/contact-dialog"
import { createPhoneCustomer, linkPhoneCustomer } from "#/services/auth"
import type { PhoneAuthResponse } from "#/services/auth"
import { updateSoftixProfile } from "#/services/softix"
import type { SoftixProfile, SoftixProfileUpdate } from "#/services/softix"

interface PrefillProfile {
  documentType?: string | null
  documentId?: string | null
  firstName?: string | null
  middleName?: string | null
  lastName?: string | null
  secondLastName?: string | null
  email?: string | null
  birthDate?: string | null
  gender?: string | null
}

interface SoftixCustomerFormProps {
  mode: "create" | "link" | "edit"
  initial?: PrefillProfile | null
  onCompleted?: (response: PhoneAuthResponse) => void
  onSaved?: (profile: SoftixProfile) => void
  onChangeDocument?: () => void
}

interface FormState {
  documentType: string
  documentId: string
  firstName: string
  middleName: string
  lastName: string
  secondLastName: string
  email: string
  birthDate: string
  gender: string
}

const GENDERS = ["Masculino", "Femenino"]

function visibleEmail(email: string | null | undefined): string {
  if (!email) return ""
  return email.endsWith("@sin-correo.invalid") ? "" : email
}

function todayIso(): string {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

function initialForm(profile?: PrefillProfile | null): FormState {
  return {
    documentType: profile?.documentType ?? "CC",
    documentId: profile?.documentId ?? "",
    firstName: profile?.firstName ?? "",
    middleName: profile?.middleName ?? "",
    lastName: profile?.lastName ?? "",
    secondLastName: profile?.secondLastName ?? "",
    email: visibleEmail(profile?.email),
    birthDate: profile?.birthDate ?? "",
    gender: profile?.gender ?? "",
  }
}

export function SoftixCustomerForm({
  mode,
  initial,
  onCompleted,
  onSaved,
  onChangeDocument,
}: SoftixCustomerFormProps) {
  const [form, setForm] = useState<FormState>(() => initialForm(initial))
  const [error, setError] = useState("")
  const errorInfo = splitContactMessage(error)

  const isLinking = mode === "link"

  const mutation = useMutation({
    mutationFn: async () => {
      const profile: SoftixProfileUpdate = {
        firstName: form.firstName.trim(),
        middleName: form.middleName.trim(),
        lastName: form.lastName.trim(),
        secondLastName: form.secondLastName.trim(),
        email: form.email.trim(),
        birthDate: form.birthDate || undefined,
        gender: form.gender,
      }
      if (mode === "edit") {
        return updateSoftixProfile(profile)
      }
      const payload = {
        documentType: form.documentType,
        documentId: form.documentId.trim(),
        firstName: profile.firstName,
        middleName: profile.middleName,
        lastName: profile.lastName,
        secondLastName: profile.secondLastName,
        email: profile.email,
        birthDate: form.birthDate,
        gender: form.gender,
      }
      if (isLinking) {
        return linkPhoneCustomer(payload)
      }
      return createPhoneCustomer(payload)
    },
    onSuccess: (result) => {
      setError("")
      if (mode === "edit") {
        onSaved?.(result as SoftixProfile)
      } else {
        onCompleted?.(result as PhoneAuthResponse)
      }
    },
    onError: (e) => {
      setError(
        e instanceof ApiError
          ? e.message
          : "No fue posible guardar los datos. Intenta de nuevo.",
      )
    },
  })

  const update = (key: keyof FormState, value: string) =>
    setForm((current) => ({ ...current, [key]: value }))

  const submit = () => {
    if (!form.birthDate) {
      setError("Ingresa tu fecha de nacimiento.")
      return
    }
    if (form.birthDate > todayIso()) {
      setError("La fecha de nacimiento no puede ser futura.")
      return
    }
    if (!form.gender) {
      setError("Selecciona tu género.")
      return
    }
    setError("")
    mutation.mutate()
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <FieldGroup>
        {mode !== "edit" && form.documentId && (
          <div className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
            <span>
              {mode === "link" ? "Documento verificado" : "Documento"}:{" "}
              <span className="text-foreground">
                {documentTypeLabel(form.documentType)} {form.documentId}
              </span>
            </span>
            {onChangeDocument && (
              <button
                type="button"
                className="underline underline-offset-2 hover:text-foreground"
                onClick={onChangeDocument}
              >
                Cambiar
              </button>
            )}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="firstName">Nombres</FieldLabel>
            <Input
              id="firstName"
              value={form.firstName}
              onChange={(event) => update("firstName", event.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="middleName">Segundo nombre</FieldLabel>
            <Input
              id="middleName"
              value={form.middleName}
              onChange={(event) => update("middleName", event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="lastName">Primer apellido</FieldLabel>
            <Input
              id="lastName"
              value={form.lastName}
              onChange={(event) => update("lastName", event.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="secondLastName">Segundo apellido</FieldLabel>
            <Input
              id="secondLastName"
              value={form.secondLastName}
              onChange={(event) => update("secondLastName", event.target.value)}
            />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="birthDate">Fecha de nacimiento</FieldLabel>
            <DatePicker
              id="birthDate"
              value={form.birthDate}
              onChange={(value) => update("birthDate", value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="gender">Género</FieldLabel>
            <Select
              value={form.gender}
              onValueChange={(value) => update("gender", value)}
            >
              <SelectTrigger id="gender" className="w-full">
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                {form.gender && !GENDERS.includes(form.gender) && (
                  <SelectItem value={form.gender}>{form.gender}</SelectItem>
                )}
                {GENDERS.map((gender) => (
                  <SelectItem key={gender} value={gender}>
                    {gender}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="email">Email (opcional)</FieldLabel>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
          />
        </Field>

        {error && (
          <div className="grid gap-1">
            {errorInfo.text && <FieldError>{errorInfo.text}</FieldError>}
            {errorInfo.needsContact && (
              <ContactDialog description="Cuéntanos qué pasó y te ayudamos a completar tus datos.">
                <Button
                  type="button"
                  variant="link"
                  className="h-auto justify-start p-0 text-sm"
                >
                  Contáctanos
                </Button>
              </ContactDialog>
            )}
          </div>
        )}

        <Field>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending
              ? "Guardando…"
              : mode === "edit"
                ? "Guardar cambios"
                : "Crear cuenta"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
