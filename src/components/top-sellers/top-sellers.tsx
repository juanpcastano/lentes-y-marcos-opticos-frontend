import { useEffect, useMemo, useState } from "react"
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

  // Reduced motion: stop autoplay entirely.
  useEffect(() => {
    if (!api) return
    const autoplay = getAutoplay(api)
    if (!autoplay) return
    if (prefersReducedMotion || products.length <= 1) {
      autoplay.stop()
    } else {
      autoplay.play()
    }
  }, [api, prefersReducedMotion, products.length])

  // Pause when tab is hidden; resume when visible (respecting reduced motion).
  useEffect(() => {
    if (!api) return
    const autoplay = getAutoplay(api)
    if (!autoplay) return
    const handleVisibility = () => {
      if (document.hidden || prefersReducedMotion || products.length <= 1) {
        autoplay.stop()
      } else {
        autoplay.play()
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [api, prefersReducedMotion, products.length])

  if (isLoading) {
    return <TopSellersSkeleton />
  }

  if (products.length === 0) {
    return null
  }

  return (
    <section className="px-4 py-10 md:px-6 lg:px-8">
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
          opts={{ loop: true, align: "start" }}
          plugins={plugins}
          setApi={setApi}
          className="w-full"
        >
          <CarouselContent>
            {products.map((product) => (
              <CarouselItem
                key={product.id}
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
