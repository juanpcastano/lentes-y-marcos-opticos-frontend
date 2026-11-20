import { AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card"
import { productReviewIssues } from "#/components/admin/product-review"
import type { AdminProduct } from "#/services/admin"

export function ProductReviewCard({ product }: { product: AdminProduct }) {
  const issues = productReviewIssues(product)
  if (issues.length === 0) return null

  const info = issues.filter((issue) => issue.section === "info")
  const images = issues.filter((issue) => issue.section === "images")

  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="size-4 text-amber-600" />
          Pendientes de revisión
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        {info.length > 0 && (
          <p>
            <span className="font-medium">Información:</span>{" "}
            {info.map((issue) => issue.text).join(", ")}.
          </p>
        )}
        {images.length > 0 && (
          <p>
            <span className="font-medium">Imágenes:</span>{" "}
            {images.map((issue) => issue.text).join(", ")}.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
