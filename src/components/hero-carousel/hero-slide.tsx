import { memo, useMemo } from "react"
import { Link } from "@tanstack/react-router"
import { Button } from "#/components/ui/button"
import { Image } from "#/components/ui/image"
import type { HeroSlide as HeroSlideType } from "./types"

interface HeroSlideProps {
  slide: HeroSlideType
  eager?: boolean
}

/** Convierte "1", "true", "[\"a\"]" a su tipo real para el search del router. */
function coerceSearchValue(value: string): unknown {
  if (value === "true") return true
  if (value === "false") return false
  const trimmed = value.trim()
  if (
    (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
    (trimmed.startsWith("{") && trimmed.endsWith("}"))
  ) {
    try {
      return JSON.parse(trimmed)
    } catch {
      return value
    }
  }
  if (trimmed !== "" && !Number.isNaN(Number(trimmed))) return Number(trimmed)
  return value
}

/**
 * Divide un destino del admin ("to" + query opcional) en path y search
 * para TanStack Router. El `to` con "?" pegado no matchea rutas, por eso
 * hay que separarlo: "/catalog?categories=[\"Sol\"]" → to="/catalog",
 * search={categories: ["Sol"]}.
 */
function splitActionTarget(href: string): {
  to: string
  search?: Record<string, unknown>
} {
  const queryIndex = href.indexOf("?")
  if (queryIndex === -1) return { to: href }
  const search: Record<string, unknown> = {}
  for (const [key, value] of new URLSearchParams(href.slice(queryIndex + 1))) {
    search[key] = coerceSearchValue(value)
  }
  const to = href.slice(0, queryIndex) || "/"
  return Object.keys(search).length > 0 ? { to, search } : { to }
}

export const HeroSlide = memo(function HeroSlide({
  slide,
  eager = false,
}: HeroSlideProps) {
  const internalActions = useMemo(
    () => slide.actions.filter((action) => action.to.startsWith("/")),
    [slide.actions],
  )
  return (
    <div className="relative h-full w-full">
      <Image
        src={slide.imageUrl}
        alt={slide.title}
        containerClassName="absolute inset-0 h-full w-full"
        className="h-full w-full object-cover"
        skeletonClassName="animate-none rounded-none"
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "low"}
      />

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-5 pb-14 sm:p-8 sm:pb-14 md:p-16 lg:p-18">
        <h2 className="mb-2 text-xl font-bold text-white sm:text-2xl md:text-4xl lg:text-5xl">
          {slide.title}
        </h2>
        {slide.description && (
          <p className="mb-4 max-w-xl text-sm text-white/90 max-sm:line-clamp-3 md:text-base lg:text-lg">
            {slide.description}
          </p>
        )}
        {internalActions.length > 0 && (
          <div className="flex flex-row flex-wrap items-center gap-2">
            {internalActions.map((action, idx) => {
              const target = splitActionTarget(action.to)
              return (
                <Button
                  key={idx}
                  asChild
                  variant="default"
                  size="sm"
                  className="md:size-default"
                >
                  <Link to={target.to} search={target.search}>
                    {action.label}
                  </Link>
                </Button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
})
