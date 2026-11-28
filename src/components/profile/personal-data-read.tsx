import { format } from "date-fns"
import { es } from "date-fns/locale"
import { UserRound } from "lucide-react"
import { ContactDialog } from "#/components/contact-dialog"
import { Card, CardContent } from "#/components/ui/card"
import { documentTypeLabel } from "#/lib/document-types"
import type { SoftixProfile } from "#/services/softix"
import type { User } from "#/services/auth"

interface PersonalDataReadProps {
  user: User
  profile: SoftixProfile
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.length === 12 && digits.startsWith("57")) {
    const local = digits.slice(2)
    return `+57 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`
  }
  return phone
}

function fullName(profile: SoftixProfile): string {
  return [
    profile.firstName,
    profile.middleName,
    profile.lastName,
    profile.secondLastName,
  ]
    .filter((part) => part?.trim())
    .join(" ")
}

function visibleEmail(email: string | null): string | null {
  if (!email || email.endsWith("@sin-correo.invalid")) return null
  return email
}

function formatBirthDate(value: string | null): string | null {
  if (!value) return null
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return null
  return format(date, "d 'de' MMMM 'de' yyyy", { locale: es })
}

function formatActiveCooldown(value: string | null): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) return null
  return format(date, "d 'de' MMMM 'de' yyyy", { locale: es })
}

export function PersonalDataRead({ user, profile }: PersonalDataReadProps) {
  const name = fullName(profile)
  const email = visibleEmail(profile.email)
  const birthDate = formatBirthDate(profile.birthDate)
  const nextEdit = formatActiveCooldown(profile.nextEditAllowedAt)
  const document = [
    documentTypeLabel(profile.documentType),
    profile.maskedDocumentId,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <Card className="p-0">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <UserRound className="size-5" />
          <h3 className="text-lg font-semibold">Información personal</h3>
        </div>
        <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <div className="grid gap-0.5">
            <dt className="text-sm text-muted-foreground">Celular</dt>
            <dd className="text-sm font-medium">{formatPhone(user.phone)}</dd>
          </div>
          <div className="grid gap-0.5">
            <dt className="text-sm text-muted-foreground">Nombre</dt>
            <dd className="text-sm font-medium">{name || "No registrado"}</dd>
          </div>
          <div className="grid gap-0.5">
            <dt className="text-sm text-muted-foreground">Documento</dt>
            <dd className="text-sm font-medium">
              {document || "No registrado"}
            </dd>
          </div>
          <div className="grid gap-0.5">
            <dt className="text-sm text-muted-foreground">Correo</dt>
            <dd className="text-sm font-medium">{email || "No registrado"}</dd>
          </div>
          {birthDate && (
            <div className="grid gap-0.5">
              <dt className="text-sm text-muted-foreground">
                Fecha de nacimiento
              </dt>
              <dd className="text-sm font-medium">{birthDate}</dd>
            </div>
          )}
        </dl>
        {nextEdit && (
          <p className="mt-5 text-sm text-muted-foreground">
            Podrás volver a editar tus datos el{" "}
            <span className="font-medium text-foreground">{nextEdit}</span>. Si
            necesitas un cambio urgente,{" "}
            <ContactDialog description="Un asesor puede ayudarte a corregir tus datos durante el periodo de espera.">
              <button
                type="button"
                className="underline underline-offset-2 hover:text-foreground"
              >
                contáctanos
              </button>
            </ContactDialog>
            .
          </p>
        )}
      </CardContent>
    </Card>
  )
}
