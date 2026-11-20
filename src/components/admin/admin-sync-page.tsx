import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "#/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card"
import { toast } from "#/hooks/use-toast"
import { ADMIN_PRODUCTS_QUERY_KEY } from "#/query-options/admin"
import { adminErrorMessage, syncSoftixCatalog } from "#/services/admin"

/** Los productos los crea Softix. Desde aquí se actualiza el catálogo local. */
export function AdminSyncPage() {
  const queryClient = useQueryClient()
  const sync = useMutation({
    mutationFn: syncSoftixCatalog,
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({
        queryKey: ADMIN_PRODUCTS_QUERY_KEY,
      })
      toast({
        title: "Sincronización terminada",
        description: `${result.created} creados, ${result.updated} actualizados, ${result.hidden} ocultos, ${result.skipped} omitidos.`,
      })
    },
    onError: (error) =>
      toast({ variant: "destructive", title: adminErrorMessage(error) }),
  })

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Sincronizar con Softix</CardTitle>
          <CardDescription>
            Los SKU, marcas, referencias, colores, categorías, precios y stock
            vienen de Softix. No se crean productos desde el panel.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-sm text-muted-foreground">
            La sincronización consulta el catálogo y el stock de las sedes 1 y
            2, crea los SKU nuevos, actualiza los existentes y oculta los que ya
            no están en Softix. Si algo falla, se conservan los datos
            anteriores.
          </p>
          <Button
            className="w-fit"
            disabled={sync.isPending}
            onClick={() => sync.mutate()}
          >
            {sync.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Sincronizar ahora
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
