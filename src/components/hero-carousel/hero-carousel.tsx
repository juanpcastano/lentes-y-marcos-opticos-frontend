import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import Autoplay from "embla-carousel-autoplay"
import createHeroSlidesQueryOptions from "#/query-options/hero-slides"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "#/components/ui/carousel"
import type { CarouselApi } from "#/components/ui/carousel"
import { HeroCarouselSkeleton } from "./hero-carousel-skeleton"
import { HeroSlide } from "./hero-slide"
import { CarouselControls } from "./carousel-controls"

const AUTO_PLAY_INTERVAL = 5000

export function HeroCarousel() {
  const {
    data: slides = [],
    isLoading,
    isError,
  } = useQuery(createHeroSlidesQueryOptions())
  const [api, setApi] = useState<CarouselApi | null>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  // Autoplay: avanza cada AUTO_PLAY_INTERVAL, no se detiene al
  // interactuar ni con el mouse encima.
  const plugins = useMemo(
    () => [
      Autoplay({
        delay: AUTO_PLAY_INTERVAL,
        stopOnInteraction: false,
        stopOnMouseEnter: false,
      }),
    ],
    [],
  )

  // Objeto estable: un literal nuevo en cada render hace reInit de Embla
  // a mitad de animación (micro-corte).
  const opts = useMemo(
    () => ({ loop: slides.length > 1, duration: 25 }),
    [slides.length],
  )

  // Respeta reduced motion.
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)
    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [])

  // Control único del autoplay: stop con reduced motion / un solo slide /
  // pestaña oculta / carrusel fuera de pantalla. Sin esto, el autoplay
  // sigue corriendo offscreen y compite por el main thread con el
  // carrusel visible (micro-cortes en cada autoscroll).
  useEffect(() => {
    if (!api) return
    const autoplay = getAutoplay(api)
    if (!autoplay) return

    let inView = true
    const update = () => {
      if (
        prefersReducedMotion ||
        slides.length <= 1 ||
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
  }, [api, prefersReducedMotion, slides.length])

  // Calienta la conexión y la caché del resto de slides en idle.
  // El primer autoscroll (5s) iba a buscar/decodificar la imagen del
  // slide 2 justo durante la animación: ese era el congelamiento.
  useEffect(() => {
    if (slides.length <= 1) return
    let cancelled = false
    const warm = () => {
      if (cancelled) return
      ensurePreconnect(slides[0].imageUrl)
      for (const slide of slides.slice(1)) {
        const img = new window.Image()
        img.decoding = "async"
        img.src = slide.imageUrl
      }
    }
    const scheduler = window as unknown as {
      requestIdleCallback?: (
        cb: () => void,
        opts?: { timeout: number },
      ) => number
      cancelIdleCallback?: (id: number) => void
    }
    const idle =
      typeof scheduler.requestIdleCallback === "function"
        ? scheduler.requestIdleCallback(() => window.setTimeout(warm, 0), {
            timeout: 2000,
          })
        : undefined
    const fallback =
      idle === undefined ? window.setTimeout(warm, 1500) : undefined
    return () => {
      cancelled = true
      if (idle !== undefined) scheduler.cancelIdleCallback?.(idle)
      if (fallback !== undefined) window.clearTimeout(fallback)
    }
  }, [slides])

  if (isLoading) {
    return <HeroCarouselSkeleton />
  }

  if (isError || slides.length === 0) {
    return null
  }

  return (
    <div ref={rootRef}>
      <Carousel
        opts={opts}
        plugins={plugins}
        setApi={setApi}
        aria-label="Featured highlights"
        className="group relative h-64 w-full overflow-hidden md:h-96 lg:h-120 xl:h-150 [&_[data-slot=carousel-content]]:h-full"
      >
        {/* Sin gap entre slides para conservar el look full-bleed actual.
            Embla aporta el drag/swipe en móvil y escritorio. */}
        <CarouselContent className="-ml-0 h-full">
          {slides.map((slide, index) => (
            <CarouselItem key={slide.id} className="h-full pl-0">
              <HeroSlide slide={slide} eager={index === 0} />
            </CarouselItem>
          ))}
        </CarouselContent>

        <HeroDots api={api} total={slides.length} />
      </Carousel>
    </div>
  )
}

/**
 * Dots + flechas suscritos al api en un componente aparte.
 * Antes el activeIndex vivía en HeroCarousel y cada paso del autoplay
 * re-renderizaba todos los slides (imágenes, CTAs, aria-hidden) justo
 * durante la animación. Ahora solo se re-renderizan los controles.
 */
function HeroDots({ api, total }: { api: CarouselApi | null; total: number }) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (!api) return
    const onSelect = () =>
      setActiveIndex((prev) => {
        const next = api.selectedScrollSnap()
        return prev === next ? prev : next
      })
    onSelect()
    api.on("select", onSelect)
    api.on("reInit", onSelect)
    return () => {
      api.off("select", onSelect)
      api.off("reInit", onSelect)
    }
  }, [api])

  // Mantiene el índice en rango si la lista de slides cambia.
  useEffect(() => {
    setActiveIndex((prev) => (total === 0 ? 0 : Math.min(prev, total - 1)))
  }, [total])

  const handlePrevious = useCallback(() => api?.scrollPrev(), [api])
  const handleNext = useCallback(() => api?.scrollNext(), [api])
  const handleDotSelect = useCallback(
    (index: number) => api?.scrollTo(index),
    [api],
  )

  return (
    <CarouselControls
      total={total}
      activeIndex={activeIndex}
      onPrevious={handlePrevious}
      onNext={handleNext}
      onSelect={handleDotSelect}
    />
  )
}

interface AutoplayPluginApi {
  play: () => void
  stop: () => void
}

/** Preconnect al origen de las imágenes (S3/Unsplash según entorno). */
function ensurePreconnect(imageUrl: string) {
  try {
    const origin = new URL(imageUrl).origin
    if (
      document.querySelector(`link[rel="preconnect"][href="${origin}"]`) != null
    ) {
      return
    }
    const link = document.createElement("link")
    link.rel = "preconnect"
    link.href = origin
    link.crossOrigin = "anonymous"
    document.head.appendChild(link)
  } catch {
    // URL inválida: no bloquea el render.
  }
}

function getAutoplay(api: CarouselApi): AutoplayPluginApi | null {
  if (!api) return null
  const plugins = api.plugins() as Record<string, unknown>
  return (plugins.autoplay as AutoplayPluginApi | undefined) ?? null
}
