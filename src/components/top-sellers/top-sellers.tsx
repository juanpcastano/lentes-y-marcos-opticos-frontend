import { useEffect, useMemo, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { ChevronRight } from "lucide-react"
import Autoplay from "embla-carousel-autoplay"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "#/components/ui/carousel"
import type { CarouselApi } from "#/components/ui/carousel"
import createTopSellersQueryOptions from "#/query-options/top-sellers"
import { TopProductCard } from "./top-product-card"
import { TopSellersSkeleton } from "./top-sellers-skeleton"

export function TopSellers() {
  const { data: products = [], isLoading } = useQuery(
    createTopSellersQueryOptions(),
  )

  const [api, setApi] = useState<CarouselApi | null>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const rootRef = useRef<HTMLElement>(null)

  // Build autoplay plugin once. stopOnMouseEnter handles the hover-pause ask.
  const plugins = useMemo(
    () => [
      Autoplay({
        delay: 3000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ],
    [],
  )

  // opts estable: evita reInit de Embla en cada render.
  const opts = useMemo(
    () => ({
      loop: true,
      align: "start" as const,
      containScroll: "trimSnaps" as const,
      skipSnaps: true,
      duration: 25,
    }),
    [],
  )

  // Control único del autoplay: se pausa fuera de pantalla, con la
  // pestaña oculta o con reduced motion. Dos carruseles con autoplay
  // corriendo a la vez saturan el main thread en la página principal.
  useEffect(() => {
    if (!api) return
    const autoplay = getAutoplay(api)
    if (!autoplay) return

    let inView = true
    const update = () => {
      if (
        prefersReducedMotion ||
        products.length <= 1 ||
        document.hidden ||
        !inView
      ) {
        autoplay.stop()
      } else {
        autoplay.play()
      }
    }

    update()

    const el = rootRef.current
    const observer =
      el != null
        ? new IntersectionObserver(
            ([entry]) => {
              inView = entry.isIntersecting
              update()
            },
            { threshold: 0.15 },
          )
        : null
    if (el != null && observer != null) observer.observe(el)

    document.addEventListener("visibilitychange", update)
    return () => {
      document.removeEventListener("visibilitychange", update)
      observer?.disconnect()
    }
  }, [api, prefersReducedMotion, products.length])

  if (isLoading) {
    return <TopSellersSkeleton />
  }

  if (products.length === 0) {
    return null
  }

  return (
    <section ref={rootRef} className="px-4 py-6 lg:py-10 md:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="mb-1 text-2xl font-bold md:text-3xl">
            Los Más Vendidos
          </h2>
          <p className="text-sm text-muted-foreground md:text-base">
            Nuestros productos preferidos por los clientes, ordenados por
            ventas.
          </p>
        </div>
        <Link
          to="/catalog"
          className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline md:text-base"
        >
          Ver todas
          <ChevronRight className="size-4" />
        </Link>
      </div>

      <div className="px-12">
        <Carousel
          opts={opts}
          plugins={plugins}
          setApi={setApi}
          className="w-full"
        >
          <CarouselContent>
            {products.map((product) => (
              <CarouselItem
                key={product.variantId}
                className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 2xl:basis-1/6"
              >
                <TopProductCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  )
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mediaQuery.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [])

  return reduced
}

interface AutoplayPluginApi {
  play: () => void
  stop: () => void
}

function getAutoplay(api: CarouselApi): AutoplayPluginApi | null {
  if (!api) return null
  const plugins = api.plugins() as Record<string, unknown>
  return (plugins.autoplay as AutoplayPluginApi | undefined) ?? null
}
