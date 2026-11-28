import { useQueryClient } from "@tanstack/react-query"
import { UserRound } from "lucide-react"
import { ContactDialog } from "#/components/contact-dialog"
import { SoftixCustomerForm } from "#/components/softix-customer-form"
import { Card, CardContent } from "#/components/ui/card"
import { toast } from "#/hooks/use-toast"
import { SOFTIX_PROFILE_QUERY_KEY } from "#/query-options/auth"
import type { SoftixProfile } from "#/services/softix"

interface PersonalDataFormProps {
  profile: SoftixProfile
  onComplete?: () => void
}

/**
 * Edición en línea de los datos personales de una cuenta ya vinculada. La
 * vinculación y la creación de la cuenta solo ocurren durante el registro.
 */
export function PersonalDataForm({
  profile,
  onComplete,
}: PersonalDataFormProps) {
  const queryClient = useQueryClient()

  return (
    <Card className="p-0">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <UserRound className="size-5" />
          <h3 className="text-lg font-semibold">Información personal</h3>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Para cambiar tu documento o celular,{" "}
          <ContactDialog description="Un asesor puede actualizar el documento o el celular de tu cuenta.">
            <button
              type="button"
              className="underline underline-offset-2 hover:text-foreground"
            >
              contáctanos
            </button>
          </ContactDialog>
          .
        </p>
        <SoftixCustomerForm
          mode="edit"
          initial={profile}
          onSaved={(updated) => {
            queryClient.setQueryData(SOFTIX_PROFILE_QUERY_KEY, updated)
            void queryClient.invalidateQueries({
              queryKey: SOFTIX_PROFILE_QUERY_KEY,
            })
            toast({
              variant: "success",
              title: "Datos guardados correctamente",
            })
            onComplete?.()
          }}
        />
      </CardContent>
    </Card>
  )
}
