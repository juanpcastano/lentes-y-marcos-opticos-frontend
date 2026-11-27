import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card"
import { FieldDescription } from "#/components/ui/field"
import {
  createSoftixProfileQueryOptions,
  SOFTIX_PROFILE_QUERY_KEY,
} from "#/query-options/auth"
import { SoftixCustomerForm } from "#/components/softix-customer-form"
import { ContactDialog } from "#/components/contact-dialog"

/**
 * Edición de datos personales de una cuenta ya vinculada. La vinculación y la
 * creación de la cuenta solo ocurren durante el registro.
 */
export function SoftixProfileForm() {
  const queryClient = useQueryClient()
  const [saved, setSaved] = useState(false)
  const { data: profile, isLoading } = useQuery(
    createSoftixProfileQueryOptions(),
  )

  if (isLoading || !profile) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Datos personales</CardTitle>
        <p className="text-sm text-muted-foreground">
          Para cambiar tu documento o teléfono,{" "}
          <ContactDialog description="Un asesor puede actualizar el documento o el teléfono de tu cuenta.">
            <button
              type="button"
              className="underline underline-offset-2 hover:text-foreground"
            >
              contáctanos
            </button>
          </ContactDialog>
          .
          {profile.maskedDocumentId
            ? ` Documento: ${profile.documentType} ${profile.maskedDocumentId}.`
            : ""}
        </p>
      </CardHeader>
      <CardContent>
        <SoftixCustomerForm
          mode="edit"
          initial={profile}
          onSaved={() => {
            setSaved(true)
            void queryClient.invalidateQueries({
              queryKey: SOFTIX_PROFILE_QUERY_KEY,
            })
          }}
        />
        {saved && (
          <FieldDescription className="mt-3 text-foreground">
            Cambios guardados correctamente.
          </FieldDescription>
        )}
      </CardContent>
    </Card>
  )
}
