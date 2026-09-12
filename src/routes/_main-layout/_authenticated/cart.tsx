import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Eye, Minus, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import createCartQueryOptions, { CART_QUERY_KEY } from "#/query-options/cart"
import { cartLineKey, updateQuantity, removeFromCart } from "#/services/cart"
import type { Cart, CartLine } from "#/services/cart"
import { formatCop } from "#/services/orders"
import { Button } from "#/components/ui/button"
import { Card, CardContent } from "#/components/ui/card"
import { Image } from "#/components/ui/image"

export const Route = createFileRoute("/_main-layout/_authenticated/cart")({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: cart, isLoading } = useQuery(createCartQueryOptions())

  if (isLoading || !cart) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        <div className="mt-6 flex flex-col gap-4">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-24 w-full animate-pulse rounded-lg bg-muted"
            />
          ))}
        </div>
      </div>
    )
  }

  if (cart.items.length === 0 && cart.unavailableItems.length === 0) {
    return <EmptyCart />
  }

  const subtotal = cart.subtotal

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Carrito</h1>
      </div>

      <div className="flex flex-col gap-4">
        {cart.items.map((line) => (
          <CartLineCard
            key={cartLineKey(line.productId, line.variantId)}
            line={line}
          />
        ))}
      </div>

      {cart.unavailableItems.length > 0 && (
        <section className="mt-8 grid gap-3">
          <div>
            <h2 className="text-lg font-semibold">No disponibles</h2>
            <p className="text-sm text-muted-foreground">
              Estos productos no están disponibles y no se incluyen en el total.
            </p>
          </div>
          {cart.unavailableItems.map((line) => (
            <CartLineCard
              key={cartLineKey(line.productId, line.variantId)}
              line={line}
              unavailable
            />
          ))}
        </section>
      )}

      <div className="mt-6 flex flex-col gap-4 border-t pt-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Subtotal</span>
          <span className="text-lg font-semibold tabular-nums">
            {formatCop(subtotal)}
          </span>
        </div>
        {cart.items.length > 0 ? (
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link to="/checkout">Ir a pagar</Link>
          </Button>
        ) : (
          <Button size="lg" className="w-full sm:w-auto" disabled>
            Ir a pagar
          </Button>
        )}
      </div>
    </div>
  )
}

function CartLineCard({
  line,
  unavailable = false,
}: {
  line: CartLine
  unavailable?: boolean
}) {
  const queryClient = useQueryClient()
  const [submitting, setSubmitting] = useState(false)

  const updateMutation = useMutation({
    mutationFn: (next: number) =>
      updateQuantity(line.productId, next, line.variantId),
    onMutate: async (next: number) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY })
      const previous = queryClient.getQueryData<Cart>(CART_QUERY_KEY)
      if (previous) {
        const lineKey = cartLineKey(line.productId, line.variantId)
        const updatedItems = unavailable
          ? previous.items
          : previous.items.map((item) =>
              cartLineKey(item.productId, item.variantId) === lineKey
                ? { ...item, quantity: next, lineTotal: item.unitPrice * next }
                : item,
            )
        queryClient.setQueryData<Cart>(CART_QUERY_KEY, {
          ...previous,
          items: updatedItems,
          unavailableItems: previous.unavailableItems,
          subtotal: updatedItems.reduce((sum, i) => sum + i.lineTotal, 0),
        })
      }
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(CART_QUERY_KEY, ctx.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY })
      setSubmitting(false)
    },
  })

  const removeMutation = useMutation({
    mutationFn: () => removeFromCart(line.productId, line.variantId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY })
      const previous = queryClient.getQueryData<Cart>(CART_QUERY_KEY)
      if (previous) {
        const lineKey = cartLineKey(line.productId, line.variantId)
        const updatedItems = unavailable
          ? previous.items
          : previous.items.filter(
              (item) => cartLineKey(item.productId, item.variantId) !== lineKey,
            )
        const updatedUnavailableItems = unavailable
          ? previous.unavailableItems.filter(
              (item) => cartLineKey(item.productId, item.variantId) !== lineKey,
            )
          : previous.unavailableItems
        queryClient.setQueryData<Cart>(CART_QUERY_KEY, {
          ...previous,
          items: updatedItems,
          unavailableItems: updatedUnavailableItems,
          subtotal: updatedItems.reduce((sum, i) => sum + i.lineTotal, 0),
        })
      }
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(CART_QUERY_KEY, ctx.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY })
      setSubmitting(false)
    },
  })

  const blocked =
    submitting || updateMutation.isPending || removeMutation.isPending

  function handleQuantityChange(next: number) {
    if (blocked) return
    setSubmitting(true)
    updateMutation.mutate(next)
  }

  function handleRemove() {
    if (blocked) return
    setSubmitting(true)
    removeMutation.mutate()
  }

  return (
    <Card className={unavailable ? "border-dashed" : undefined}>
      <CardContent className="flex gap-4 p-4">
        <Image
          src={line.imageUrl}
          alt={line.name}
          containerClassName="size-20 shrink-0 rounded-lg"
          className="size-full object-cover"
          loading="lazy"
        />
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <div className="grid gap-0.5">
              <span className="font-medium leading-tight">{line.name}</span>
              <Button
                asChild
                variant="link"
                size="sm"
                className="h-auto w-fit p-0"
              >
                <Link to="/product/$id" params={{ id: line.productId }}>
                  <Eye className="size-3.5" />
                  Ver producto
                </Link>
              </Button>
              {!unavailable && (
                <span className="text-sm text-muted-foreground tabular-nums">
                  {formatCop(line.unitPrice)}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive"
              disabled={blocked}
              onClick={handleRemove}
              aria-label="Eliminar del carrito"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
          <div className="mt-1 flex items-center justify-between gap-2">
            {unavailable ? (
              <span className="text-sm text-destructive">
                {line.unavailableReason ?? "No disponible ahora mismo"}
              </span>
            ) : (
              <QuantityStepper
                quantity={line.quantity}
                onChange={handleQuantityChange}
                disabled={blocked}
              />
            )}
            {!unavailable && (
              <span className="font-semibold tabular-nums">
                {formatCop(line.lineTotal)}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function QuantityStepper({
  quantity,
  onChange,
  disabled,
}: {
  quantity: number
  onChange: (next: number) => void
  disabled: boolean
}) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        className="size-8"
        disabled={disabled || quantity <= 1}
        onClick={() => onChange(quantity - 1)}
        aria-label="Disminuir cantidad"
      >
        <Minus className="size-4" />
      </Button>
      <span className="w-10 text-center text-sm font-medium tabular-nums">
        {quantity}
      </span>
      <Button
        variant="outline"
        size="icon"
        className="size-8"
        disabled={disabled}
        onClick={() => onChange(quantity + 1)}
        aria-label="Aumentar cantidad"
      >
        <Plus className="size-4" />
      </Button>
    </div>
  )
}

function EmptyCart() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Carrito</h1>
      </div>
      <div className="flex flex-col items-center justify-center gap-3 rounded-4xl bg-muted/40 py-12 text-center">
        <p className="text-sm text-muted-foreground">Tu carrito está vacío.</p>
        <Button asChild variant="default">
          <Link to="/catalog">Ver catálogo</Link>
        </Button>
      </div>
    </div>
  )
}
