import { useCallback, useEffect, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import createHeroSlidesQueryOptions from "#/query-options/hero-slides"
import { HeroCarouselSkeleton } from "./hero-carousel-skeleton"
import { HeroSlide } from "./hero-slide"
import { CarouselControls } from "./carousel-controls"

const AUTO_PLAY_INTERVAL = 3000

export function HeroCarousel() {
  const { data: slides = [], isLoading } = useQuery(
    createHeroSlidesQueryOptions(),
  )
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useRef(false)

  // Detect reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    prefersReducedMotion.current = mediaQuery.matches

    const handler = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches
      if (e.matches) {
        clearAutoPlay()
      }
    }
    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [])

  const clearAutoPlay = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startAutoPlay = useCallback(() => {
    clearAutoPlay()
    if (prefersReducedMotion.current || isPaused || slides.length <= 1) return

    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length)
    }, AUTO_PLAY_INTERVAL)
  }, [clearAutoPlay, isPaused, slides.length])

  // Start/stop auto-play based on state
  useEffect(() => {
    startAutoPlay()
    return clearAutoPlay
  }, [startAutoPlay, clearAutoPlay])

  // Pause on window blur / resume on focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearAutoPlay()
      } else {
        startAutoPlay()
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [clearAutoPlay, startAutoPlay])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrevious()
      } else if (e.key === "ArrowRight") {
        goToNext()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [slides.length])

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % slides.length)
    startAutoPlay()
  }, [slides.length, startAutoPlay])

  const goToPrevious = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length)
    startAutoPlay()
  }, [slides.length, startAutoPlay])

  const goToSlide = useCallback(
    (index: number) => {
      setActiveIndex(index)
      startAutoPlay()
    },
    [startAutoPlay],
  )

  const handleMouseEnter = useCallback(() => {
    setIsPaused(true)
    clearAutoPlay()
  }, [clearAutoPlay])

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false)
    startAutoPlay()
  }, [startAutoPlay])

  if (isLoading) {
    return <HeroCarouselSkeleton />
  }

  if (slides.length === 0) {
    return null
  }

  return (
    <div
      ref={containerRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured highlights"
      className="group relative w-full overflow-hidden h-64 md:h-96 lg:h-120 xl:h-150"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {slides.map((slide, index) => (
        <div
          key={index}
          className="absolute inset-0 transition-opacity duration-500 ease-in-out"
          style={{
            opacity: index === activeIndex ? 1 : 0,
            zIndex: index === activeIndex ? 1 : 0,
          }}
          aria-hidden={index !== activeIndex}
        >
          <HeroSlide slide={slide} />
        </div>
      ))}

      <CarouselControls
        total={slides.length}
        activeIndex={activeIndex}
        onPrevious={goToPrevious}
        onNext={goToNext}
        onSelect={goToSlide}
      />
    </div>
  )
}
