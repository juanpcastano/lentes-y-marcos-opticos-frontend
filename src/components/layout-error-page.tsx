import { Link } from "@tanstack/react-router"
import { AlertCircle, MoveLeft } from "lucide-react"

import { Button } from "#/components/ui/button"

interface LayoutErrorPageProps {
  section: string
  backTo: "/" | "/admin" | "/myaccount"
}

export function LayoutErrorPage({ section, backTo }: LayoutErrorPageProps) {
  return (
    <section className="flex min-h-[60vh] w-full items-center justify-center px-6 py-12">
      <div className="flex max-w-lg flex-col items-center text-center">
        <div className="mb-5 rounded-full bg-muted p-4 text-primary">
          <AlertCircle className="size-8" />
        </div>
        <p className="text-sm font-bold tracking-[0.2em] text-primary uppercase">
          Página no encontrada
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
          Esta página no existe en {section}.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Revisa la dirección o utiliza una de las opciones disponibles.
        </p>
        <Button asChild className="mt-8" variant="outline">
          <Link to={backTo}>
            <MoveLeft />
            Volver
          </Link>
        </Button>
      </div>
    </section>
  )
}
