import { useEffect, useRef, useState } from "react"
import { useNavigate, useRouterState } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { Glasses, Search } from "lucide-react"

import { Button } from "#/components/ui/button"
import { ButtonGroup } from "#/components/ui/button-group"
import { Input } from "#/components/ui/input"
import { formatCop } from "#/components/catalog/types"
import createProductsQueryOptions from "#/query-options/products"

const MIN_CHARS = 2
const SUGGESTION_COUNT = 3
const DEBOUNCE_MS = 300

interface SearchInputProps {
  autoFocus?: boolean
  groupClassName?: string
  inputClassName?: string
  buttonClassName?: string
  iconClassName?: string
  onNavigate?: () => void
}

export function SearchInput({
  autoFocus,
  groupClassName,
  inputClassName,
  buttonClassName,
  iconClassName,
  onNavigate,
}: SearchInputProps) {
  const navigate = useNavigate()
  const currentQ = useRouterState({
    select: (s) => {
      const q = (s.location.search as Record<string, unknown>).q
      return typeof q === "string" ? q : ""
    },
  })
  const [value, setValue] = useState(currentQ)
  const [debounced, setDebounced] = useState(currentQ)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setValue(currentQ)
    setDebounced(currentQ)
  }, [currentQ])

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [value])

  const term = debounced.trim()
  const suggestEnabled = open && term.length >= MIN_CHARS
  const { data, isFetching } = useQuery({
    ...createProductsQueryOptions({ q: term, size: SUGGESTION_COUNT }),
    enabled: suggestEnabled,
  })
  const suggestions = suggestEnabled ? (data?.content ?? []) : []
  const showPanel =
    open && term.length >= MIN_CHARS && (!isFetching || suggestions.length > 0)

  useEffect(() => {
    setActiveIndex(-1)
  }, [debounced])

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [])

  const close = () => {
    setOpen(false)
    setActiveIndex(-1)
  }

  const goToCatalog = (q: string) => {
    const trimmed = q.trim()
    navigate({
      to: "/catalog",
      search: { q: trimmed || undefined },
    })
    close()
    onNavigate?.()
  }

  const goToProduct = (productId: string, variantId: string) => {
    navigate({
      to: "/product/$id",
      params: { id: productId },
      search: { variant: variantId },
    })
    close()
    onNavigate?.()
  }

  const submit = () => {
    if (activeIndex >= 0 && activeIndex < suggestions.length) {
      const suggestion = suggestions[activeIndex]
      goToProduct(suggestion.productId, suggestion.variantId)
      return
    }
    goToCatalog(value)
  }

  return (
    <div ref={containerRef} className="relative flex">
      <ButtonGroup className={groupClassName}>
        <Input
          placeholder="Buscar..."
          className={inputClassName ?? "h-full min-w-21 bg-background"}
          value={value}
          autoFocus={autoFocus}
          aria-label="Buscar productos"
          aria-expanded={showPanel}
          aria-autocomplete="list"
          role="combobox"
          onChange={(event) => {
            setValue(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              submit()
            } else if (event.key === "ArrowDown") {
              event.preventDefault()
              setOpen(true)
              setActiveIndex((i) => (i + 1 >= suggestions.length ? 0 : i + 1))
            } else if (event.key === "ArrowUp") {
              event.preventDefault()
              setActiveIndex((i) =>
                i - 1 < 0 ? suggestions.length - 1 : i - 1,
              )
            } else if (event.key === "Escape") {
              close()
            }
          }}
        />
        <Button
          variant="outline"
          className={buttonClassName ?? "h-full"}
          aria-label="Search"
          onClick={() => goToCatalog(value)}
        >
          <Search className={iconClassName ?? "size-5"} />
        </Button>
      </ButtonGroup>

      {showPanel ? (
        <div
          role="listbox"
          aria-label="Sugerencias de productos"
          className="absolute top-full right-0 left-0 z-50 mt-1 min-w-64 overflow-hidden rounded-xl border bg-popover shadow-lg"
        >
          {suggestions.length === 0 ? (
            <button
              type="button"
              className="w-full px-4 py-3 text-left text-sm text-muted-foreground hover:bg-muted"
              onClick={() => goToCatalog(term)}
            >
              Sin resultados para &ldquo;{term}&rdquo; — ver catálogo
            </button>
          ) : (
            <>
              {suggestions.map((product, index) => (
                <button
                  key={product.variantId}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  className={`flex w-full items-center gap-3 px-3 py-2 text-left ${
                    index === activeIndex ? "bg-muted" : ""
                  }`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() =>
                    goToProduct(product.productId, product.variantId)
                  }
                >
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt=""
                      className="size-10 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Glasses className="size-5 text-muted-foreground" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {product.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {[product.brand, product.color, formatCop(product.price)]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                </button>
              ))}
              <button
                type="button"
                className="w-full border-t px-4 py-2 text-center text-sm font-medium text-primary hover:bg-muted"
                onClick={() => goToCatalog(term)}
              >
                Ver todos los resultados
              </button>
            </>
          )}
        </div>
      ) : null}
    </div>
  )
}
