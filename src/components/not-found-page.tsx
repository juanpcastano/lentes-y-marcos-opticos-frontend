import { Link } from "@tanstack/react-router"
import { Glasses, MoveLeft, Search } from "lucide-react"

import { Button } from "#/components/ui/button"

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12 text-foreground">
      <section className="flex w-full max-w-lg flex-col items-center text-center">
        <Link
          to="/"
          className="mb-12 inline-flex items-center gap-2 text-sm font-bold tracking-[0.2em] text-primary uppercase"
        >
          <Glasses className="size-5" />
          Lentes y Marcos Ópticos
        </Link>

        <p className="text-8xl leading-none font-black tracking-tight text-primary sm:text-9xl">
          404
        </p>
        <p className="mt-6 text-lg text-muted-foreground">
          No encontramos la página que buscas.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/catalog">
              <Search />
              Explorar catálogo
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/">
              <MoveLeft />
              Volver al inicio
            </Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
