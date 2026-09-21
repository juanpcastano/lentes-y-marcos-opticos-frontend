import { AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card"
import { productReviewIssues } from "#/components/admin/product-review"
import type { AdminProduct } from "#/services/admin"

/**
 * Resumen de puntos pendientes en la ficha del producto, agrupados por la
 * sección donde se corrigen. Se calcula sobre lo guardado (se actualiza al
 * guardar los cambios).
 */
export function ReviewIssuesCard({ product }: { product: AdminProduct }) {
  const issues = productReviewIssues(product)
  if (issues.length === 0) return null
  const info = issues.filter((issue) => issue.section === "info")
  const variants = issues.filter((issue) => issue.section === "variants")
  return (
    <Card className="border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base text-amber-900 dark:text-amber-200">
          <AlertTriangle className="size-4" />
          Pendiente de revisión ({issues.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-amber-900 dark:text-amber-200">
        {info.length > 0 && (
          <div>
            <p className="font-medium">En Información principal:</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5">
              {info.map((issue) => (
                <li key={issue.text}>{issue.text}</li>
              ))}
            </ul>
          </div>
        )}
        {variants.length > 0 && (
          <div>
            <p className="font-medium">En Variantes:</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5">
              {variants.map((issue) => (
                <li key={issue.text}>{issue.text}</li>
              ))}
            </ul>
          </div>
        )}
        <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
          Se actualiza al guardar los cambios.
        </p>
      </CardContent>
    </Card>
  )
}
