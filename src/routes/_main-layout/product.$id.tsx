import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, ShoppingCart } from "lucide-react"
import { useState } from "react"

import createProductQueryOptions from "#/query-options/product"
import createCartQueryOptions, { CART_QUERY_KEY } from "#/query-options/cart"
import { addToCart, cartLineKey } from "#/services/cart"
import type { Cart } from "#/services/cart"
import { formatCop, productTitle } from "#/components/catalog/types"
import { Button } from "#/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "#/components/ui/sheet"
import { toast } from "#/hooks/use-toast"
import { ProductImageGallery } from "#/components/product-detail/product-image-gallery"
import { RelatedProducts } from "#/components/product-detail/related-products"
import { useAuth } from "#/components/auth-provider"

function hasText(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0
}

export const Route = createFileRoute("/_main-layout/product/$id")({
  component: ProductDetailPage,
})

function ProductDetailPage() {
  const { id } = Route.useParams()
  const navigate = Route.useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [submitting, setSubmitting] = useState(false)
  const [cartSheetOpen, setCartSheetOpen] = useState(false)
  const {
    data: product,
    isLoading,
    isError,
  } = useQuery(createProductQueryOptions(id))
  const { data: cart } = useQuery({
    ...createCartQueryOptions(),
    enabled: !!user,
  })
  const title = product ? productTitle(product) : ""

  const addToCartMutation = useMutation({
    mutationFn: () => {
      if (!product || !product.available) {
        throw new Error("El producto no está disponible.")
      }
      return addToCart(
        product.id,
        1,
        {
          id: product.id,
          name: product.color ?? "Único",
          productName: title,
          imageUrl: product.imageUrl,
          price: product.price,
        },
        title,
      )
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY })
      const previous = queryClient.getQueryData<Cart>(CART_QUERY_KEY)
      if (previous && product) {
        const updatedItems = [
          ...previous.items,
          {
            productId: product.id,
            name: title,
            imageUrl: product.imageUrl ?? "",
            unitPrice: product.price,
            quantity: 1,
            lineTotal: product.price,
          },
        ]
        queryClient.setQueryData<Cart>(CART_QUERY_KEY, {
          ...previous,
          items: updatedItems,
          subtotal: updatedItems.reduce((sum, i) => sum + i.lineTotal, 0),
        })
      }
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(CART_QUERY_KEY, ctx.previous)
      }
      toast({
        variant: "destructive",
        title: "No se pudo añadir el producto al carrito.",
      })
    },
    onSuccess: () => setCartSheetOpen(true),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY })
      setSubmitting(false)
    },
  })

  const inCart = !!cart?.items.some(
    (item) => cartLineKey(item.productId) === cartLineKey(id),
  )

  function handleAddToCart() {
    if (submitting || addToCartMutation.isPending) return
    if (!product?.available) return
    if (!user) {
      navigate({ to: "/login", search: { redirect: `/product/${id}` } })
      return
    }
    setSubmitting(true)
    addToCartMutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="aspect-square w-full animate-pulse rounded-lg bg-muted" />
          <div className="flex flex-col gap-4">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-8 w-40 animate-pulse rounded bg-muted" />
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="h-24 w-full animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Producto no encontrado</h1>
        <p className="text-muted-foreground">
          El producto que buscas no existe o ya no está disponible.
        </p>
        <Button asChild variant="default">
          <Link to="/catalog">Volver al catálogo</Link>
        </Button>
      </div>
    )
  }

  const showBrand = hasText(product.brand)
  const showDescription = hasText(product.description)
  const showMaterial = hasText(product.material)
  const showShape = hasText(product.shape)
  const showSpecs = showMaterial || showShape
  const showCategories = product.categories.length > 0
  const showSheetImage = hasText(product.imageUrl)
  const otherColors = product.otherColors

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link
        to="/catalog"
        className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground hover:underline"
      >
        ← Volver al catálogo
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <ProductImageGallery
          imageUrl={product.imageUrl}
          additionalImages={product.additionalImages}
          name={title}
        />

        <div className="flex flex-col gap-5">
          {showBrand && (
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              {product.brand}
            </span>
          )}
          <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
            {title}
          </h1>

          <span className="text-2xl font-bold text-primary">
            {formatCop(product.price)}
          </span>
          <span className="text-sm text-muted-foreground">
            {product.available
              ? "Disponible"
              : product.status === "INACTIVE"
                ? "No disponible"
                : "Agotado"}
          </span>

          {showDescription && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          )}

          {showSpecs && (
            <dl className="grid grid-cols-2 gap-3 border-t pt-4 text-sm">
              {showMaterial && (
                <div>
                  <dt className="font-medium">Material</dt>
                  <dd className="text-muted-foreground">{product.material}</dd>
                </div>
              )}
              {showShape && (
                <div>
                  <dt className="font-medium">Forma</dt>
                  <dd className="text-muted-foreground">{product.shape}</dd>
                </div>
              )}
            </dl>
          )}

          {otherColors.length > 0 && (
            <div className="grid gap-2 text-sm font-medium">
              <span>Otros colores</span>
              <div className="flex flex-wrap gap-2">
                {otherColors.map((other) => (
                  <Link
                    key={other.id}
                    to="/product/$id"
                    params={{ id: other.id }}
                    className={`rounded-full border px-3 py-1 text-xs font-normal hover:bg-muted ${
                      other.available
                        ? ""
                        : "text-muted-foreground line-through"
                    }`}
                  >
                    {other.color ?? "Color"}
                    {!other.available && " (agotado)"}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {showCategories && (
            <div className="flex flex-wrap gap-2">
              {product.categories.map((category) => (
                <span
                  key={category}
                  className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                >
                  {category}
                </span>
              ))}
            </div>
          )}

          <Button
            size="lg"
            className="mt-2 w-full sm:w-auto"
            disabled={
              !product.available || submitting || addToCartMutation.isPending
            }
            onClick={handleAddToCart}
          >
            {!product.available ? (
              product.status === "INACTIVE" ? "No disponible" : "Agotado"
            ) : submitting || addToCartMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Añadiendo...
              </>
            ) : (
              "Añadir al carrito"
            )}
          </Button>
          {inCart && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>El ítem ya ha sido añadido a tu carrito.</span>
              <Button asChild variant="link" className="h-auto p-0">
                <Link to="/cart">
                  <ShoppingCart className="size-4" />
                  Ver carrito
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      <Sheet open={cartSheetOpen} onOpenChange={setCartSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Producto añadido al carrito</SheetTitle>
            <SheetDescription>
              Revisa el artículo añadido antes de continuar comprando.
            </SheetDescription>
          </SheetHeader>
          <div className="flex gap-4 px-6">
            {showSheetImage ? (
              <img
                src={product.imageUrl ?? undefined}
                alt={title}
                className="size-20 rounded-xl object-cover"
              />
            ) : (
              <div className="flex size-20 items-center justify-center rounded-xl bg-muted text-xs text-muted-foreground">
                Sin imagen
              </div>
            )}
            <div className="grid gap-1">
              <p className="font-medium">{title}</p>
              <p className="text-sm font-medium">{formatCop(product.price)}</p>
            </div>
          </div>
          <SheetFooter>
            <Button asChild>
              <Link to="/cart">Ver carrito</Link>
            </Button>
            <SheetClose asChild>
              <Button variant="outline">Seguir comprando</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <RelatedProducts currentId={product.id} categories={product.categories} />
    </div>
  )
}
