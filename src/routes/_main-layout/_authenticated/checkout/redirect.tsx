import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useMutation } from "@tanstack/react-query"
import { useEffect } from "react"
import { z } from "zod"
import { simulatePaymentRedirect } from "#/services/payment"
import { toast } from "#/hooks/use-toast"
import { Loader2 } from "lucide-react"

const redirectSearchSchema = z.object({
  orderId: z.string(),
})

export const Route = createFileRoute(
  "/_main-layout/_authenticated/checkout/redirect",
)({
  validateSearch: redirectSearchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { orderId } = Route.useSearch()

  const paymentMutation = useMutation({
    mutationFn: simulatePaymentRedirect,
    onSuccess: () => {
      navigate({ to: "/myaccount/orders" })
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error al procesar el pago",
      })
      navigate({ to: "/cart" })
    },
  })

  useEffect(() => {
    if (orderId) {
      paymentMutation.mutate(orderId)
    } else {
      toast({
        variant: "destructive",
        title: "Error al procesar el pago",
      })
      navigate({ to: "/cart" })
    }
  }, [orderId])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        Redirigiendo a la pasarela de pago...
      </p>
    </div>
  )
}
