import { useEffect, useMemo, useState } from "react"
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
  const [activeIndex, setActiveIndex] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

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

  // Sincroniza el dot activo con el slide visible (incluye drag/swipe).
  useEffect(() => {
    if (!api) return
    const handleSelect = () => setActiveIndex(api.selectedScrollSnap())
    handleSelect()
    api.on("select", handleSelect)
    api.on("reInit", handleSelect)
    return () => {
      api.off("select", handleSelect)
      api.off("reInit", handleSelect)
    }
  }, [api])

  // Mantiene el índice en rango si la lista de slides cambia.
  useEffect(() => {
    setActiveIndex((prev) =>
      slides.length === 0 ? 0 : Math.min(prev, slides.length - 1),
    )
  }, [slides.length])

  // Respeta reduced motion.
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)
    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [])

  // Detiene el autoplay con reduced motion o un solo slide;
  // lo pausa cuando la pestaña está oculta.
  useEffect(() => {
    if (!api) return
    const autoplay = getAutoplay(api)
    if (!autoplay) return
    if (prefersReducedMotion || slides.length <= 1) {
      autoplay.stop()
    } else if (!document.hidden) {
      autoplay.play()
    }
  }, [api, prefersReducedMotion, slides.length])

  useEffect(() => {
    if (!api) return
    const handleVisibility = () => {
      const autoplay = getAutoplay(api)
      if (!autoplay) return
      if (document.hidden || prefersReducedMotion || slides.length <= 1) {
        autoplay.stop()
      } else {
        autoplay.play()
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [api, prefersReducedMotion, slides.length])

  if (isLoading) {
    return <HeroCarouselSkeleton />
  }

  if (isError || slides.length === 0) {
    return null
  }

  return (
    <Carousel
      opts={{ loop: slides.length > 1 }}
      plugins={plugins}
      setApi={setApi}
      aria-label="Featured highlights"
      className="group relative h-64 w-full overflow-hidden md:h-96 lg:h-120 xl:h-150 [&_[data-slot=carousel-content]]:h-full"
    >
      {/* Sin gap entre slides para conservar el look full-bleed actual.
          Embla aporta el drag/swipe en móvil y escritorio. */}
      <CarouselContent className="-ml-0 h-full">
        {slides.map((slide, index) => (
          <CarouselItem
            key={slide.id}
            className="h-full pl-0"
            aria-hidden={index !== activeIndex}
          >
            <HeroSlide slide={slide} />
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselControls
        total={slides.length}
        activeIndex={activeIndex}
        onPrevious={() => api?.scrollPrev()}
        onNext={() => api?.scrollNext()}
        onSelect={(index) => api?.scrollTo(index)}
      />
    </Carousel>
  )
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
