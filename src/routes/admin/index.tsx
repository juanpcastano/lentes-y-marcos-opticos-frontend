import { createFileRoute, Link } from "@tanstack/react-router"
import { Badge, Boxes, Images, Presentation, Tags } from "lucide-react"
import { Button } from "#/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card"

export const Route = createFileRoute("/admin/")({ component: AdminDashboard })

function AdminDashboard() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-10">
        <p className="text-sm font-medium text-primary">
          Centro de operaciones
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Resumen</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Gestiona el catálogo y prepara la tienda para la siguiente jornada de
          ventas.
        </p>
      </header>

      <section>
        <h2 className="mb-4 text-3xl font-semibold">Productos</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Button
            asChild
            size="lg"
            className="h-24 justify-start px-6 text-2xl"
          >
            <Link to="/admin/products">
              <Boxes className="size-8 pr-2" />
              Productos
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-24 justify-start px-6 text-2xl"
          >
            <Link to="/admin/categories">
              <Tags className="size-8 pr-2" />
              Categorías
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-24 justify-start px-6 text-2xl"
          >
            <Link to="/admin/brands">
              <Badge className="size-8 pr-2" />
              Marcas
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-24 justify-start px-6 text-2xl"
          >
            <Link to="/admin/gallery">
              <Images className="size-8 pr-2" />
              Galería
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-24 justify-start px-6 text-2xl"
          >
            <Link to="/admin/hero">
              <Presentation className="size-8 pr-2" />
              Hero
            </Link>
          </Button>
        </div>
      </section>

      <Card className="mt-8 border-primary/15 bg-primary/5 shadow-none">
        <CardHeader>
          <CardTitle>Próximamente</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Los pedidos, citas e importaciones de Softix aparecerán aquí cuando
          sus fases de backend estén listas.
        </CardContent>
      </Card>
    </div>
  )
}
