import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, ShoppingCart } from "lucide-react"
import { useState } from "react"

import createProductQueryOptions from "#/query-options/product"
import createCartQueryOptions, { CART_QUERY_KEY } from "#/query-options/cart"
import { addToCart, cartLineKey } from "#/services/cart"
import type { Cart } from "#/services/cart"
import { formatCop } from "#/services/orders"
import { Button } from "#/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select"
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
import { ProductPrice } from "#/components/product-detail/product-price"
import { RelatedProducts } from "#/components/product-detail/related-products"
import { useAuth } from "#/components/auth-provider"

export const Route = createFileRoute("/_main-layout/product/$id")({
  component: ProductDetailPage,
})

function ProductDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [submitting, setSubmitting] = useState(false)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  )
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
  const availableVariants =
    product?.variants.filter(
      (variant) => variant.isActive !== false && variant.id !== null,
    ) ?? []
  const selectedVariant =
    availableVariants.find((variant) => variant.id === selectedVariantId) ??
    availableVariants[0]
  const variantPrice =
    (product?.price ?? 0) + (selectedVariant?.priceAdjustment ?? 0)

  const addToCartMutation = useMutation({
    mutationFn: () =>
      addToCart(
        product!.id,
        1,
        selectedVariant?.id
          ? {
              id: selectedVariant.id,
              name: selectedVariant.variantName ?? "Variante",
              productName: product!.name,
              imageUrl: selectedVariant.imageUrl,
              price: variantPrice,
            }
          : undefined,
        product!.name,
      ),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY })
      const previous = queryClient.getQueryData<Cart>(CART_QUERY_KEY)
      if (previous && product) {
        const updatedItems = [
          ...previous.items,
          {
            productId: product.id,
            name: product.name,
            imageUrl: product.imageUrl,
            variantId: selectedVariant?.id ?? undefined,
            variantName: selectedVariant
              ? (selectedVariant.variantName ?? "Variante")
              : undefined,
            unitPrice: variantPrice,
            quantity: 1,
            lineTotal: variantPrice,
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

  const selectedLineKey = cartLineKey(id, selectedVariant?.id ?? undefined)
  const inCart = !!cart?.items.some(
    (item) => cartLineKey(item.productId, item.variantId) === selectedLineKey,
  )

  function handleAddToCart() {
    if (submitting || addToCartMutation.isPending) return
    if (!product?.isActive) return
    if (!user) {
      navigate({
        to: "/login",
        search: { redirect: `/product/${id}` },
      })
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
          name={product.name}
        />

        <div className="flex flex-col gap-5">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            {product.brand}
          </span>
          <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
            {product.name}
          </h1>

          <ProductPrice
            originalPrice={
              product.originalPrice + (selectedVariant?.priceAdjustment ?? 0)
            }
            discountedPrice={
              product.discountedPrice + (selectedVariant?.priceAdjustment ?? 0)
            }
            discountPercentage={product.discountPercentage}
          />

          <p className="text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <dl className="grid grid-cols-2 gap-3 border-t pt-4 text-sm">
            <div>
              <dt className="font-medium">Material</dt>
              <dd className="text-muted-foreground">{product.material}</dd>
            </div>
            <div>
              <dt className="font-medium">Forma</dt>
              <dd className="text-muted-foreground">{product.shape}</dd>
            </div>
          </dl>

          {availableVariants.length > 0 && (
            <div className="grid gap-2 text-sm font-medium">
              <span>Variante</span>
              <Select
                value={selectedVariant?.id ?? undefined}
                onValueChange={setSelectedVariantId}
                disabled={availableVariants.length === 1}
              >
                <SelectTrigger className="w-full font-normal">
                  <SelectValue placeholder="Selecciona una variante" />
                </SelectTrigger>
                <SelectContent>
                  {availableVariants.map((variant) => (
                    <SelectItem key={variant.id} value={variant.id ?? ""}>
                      {variant.variantName ?? "Variante"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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

          <Button
            size="lg"
            className="mt-2 w-full sm:w-auto"
            disabled={
              !product.isActive || submitting || addToCartMutation.isPending
            }
            onClick={handleAddToCart}
          >
            {!product.isActive ? (
              "No disponible ahora mismo"
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
            <img
              src={selectedVariant?.imageUrl ?? product.imageUrl}
              alt={product.name}
              className="size-20 rounded-xl object-cover"
            />
            <div className="grid gap-1">
              <p className="font-medium">{product.name}</p>
              {selectedVariant && (
                <p className="text-sm text-muted-foreground">
                  {selectedVariant.variantName ?? "Variante"}
                </p>
              )}
              <p className="text-sm font-medium">{formatCop(variantPrice)}</p>
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
