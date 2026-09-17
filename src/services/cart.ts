import { fetchProductById } from "#/services/products"
import type { ProductDetail } from "#/components/product-detail/types"

export type CartItem = {
  productId: string
  quantity: number
  variantId?: string
  variantName?: string
  productName?: string
  imageUrl?: string
  unitPrice?: number
}

export type CartLine = {
  productId: string
  variantId?: string
  variantName?: string
  name: string
  imageUrl: string
  unitPrice: number
  quantity: number
  lineTotal: number
  unavailableReason?: string
}

export type Cart = {
  id: string
  items: CartLine[]
  unavailableItems: CartLine[]
  subtotal: number
}

export function cartLineKey(productId: string, variantId?: string): string {
  return `${productId}:${variantId ?? "base"}`
}

const MOCK_CART_KEY = "mock_cart"
const CART_ID = "cart"

type PersistedLine = CartItem

function isPersistedLine(value: unknown): value is PersistedLine {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as PersistedLine).productId === "string" &&
    typeof (value as PersistedLine).quantity === "number"
  )
}

function readPersistedCart(): PersistedLine[] {
  const stored = localStorage.getItem(MOCK_CART_KEY)
  if (!stored) return []
  try {
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isPersistedLine)
  } catch {
    return []
  }
}

function writePersistedCart(lines: PersistedLine[]): void {
  localStorage.setItem(MOCK_CART_KEY, JSON.stringify(lines))
}

function sameColor(left?: string, right?: string | null): boolean {
  return Boolean(
    left && right && left.trim().toLowerCase() === right.trim().toLowerCase(),
  )
}

function resolveLines(
  persisted: PersistedLine[],
  // Indexado por línea (productId:variantId): el detalle de cada variante
  // trae su propia imagen principal y no se puede compartir por producto.
  details: Map<string, ProductDetail>,
): { lines: CartLine[]; unavailableItems: CartLine[] } {
  const lines: CartLine[] = []
  const unavailableItems: CartLine[] = []
  for (const line of persisted) {
    const product = details.get(cartLineKey(line.productId, line.variantId))
    const quantity = line.quantity
    const productName =
      product?.name ?? line.productName ?? "Producto no disponible"
    const variants = product?.variants ?? []
    const matchingVariant = line.variantId
      ? variants.find(
          (variant) =>
            variant.id === line.variantId ||
            sameColor(line.variantName, variant.color),
        )
      : undefined
    const hasAvailableVariant = variants.some(
      (variant) => variant.id !== null && variant.isActive !== false,
    )
    const variantUnavailable =
      product !== undefined &&
      (!line.variantId ||
        !matchingVariant ||
        matchingVariant.isActive === false)
    const color = matchingVariant?.color ?? line.variantName
    // Precio vivo de la variante (con descuento); el guardado es respaldo.
    const unitPrice =
      matchingVariant?.discountedPrice ?? line.unitPrice ?? product?.price ?? 0
    const cartLine = {
      productId: product?.productId ?? line.productId,
      variantId: matchingVariant?.id ?? line.variantId,
      variantName: color ?? undefined,
      name: color ? `${productName} - ${color}` : productName,
      imageUrl: product?.imageUrl ?? line.imageUrl ?? "",
      unitPrice,
      quantity,
      lineTotal: unitPrice * quantity,
    }
    if (product && !variantUnavailable) {
      lines.push(cartLine)
    } else {
      unavailableItems.push({
        ...cartLine,
        productId: line.productId,
        name: productName,
        imageUrl: product?.imageUrl ?? line.imageUrl ?? "",
        unitPrice: line.unitPrice ?? 0,
        lineTotal: 0,
        unavailableReason: variantUnavailable
          ? hasAvailableVariant
            ? "La variante seleccionada ya no está disponible"
            : "El producto no tiene variantes disponibles"
          : undefined,
      })
    }
  }
  return { lines, unavailableItems }
}

function computeSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.lineTotal, 0)
}

async function buildCart(persisted: PersistedLine[]): Promise<Cart> {
  if (persisted.length === 0) {
    return { id: CART_ID, items: [], unavailableItems: [], subtotal: 0 }
  }
  const keys = [
    ...new Set(
      persisted.map((line) => cartLineKey(line.productId, line.variantId)),
    ),
  ]
  const entries = await Promise.all(
    keys.map(async (key) => {
      const line = persisted.find(
        (candidate) =>
          cartLineKey(candidate.productId, candidate.variantId) === key,
      )!
      const detail = await fetchProductById(
        line.productId,
        line.variantId,
      ).catch(() => null)
      return [key, detail] as const
    }),
  )
  const details = new Map<string, ProductDetail>()
  for (const [key, detail] of entries) {
    if (detail) details.set(key, detail)
  }
  const rebound = persisted.map((line) => {
    const product = details.get(cartLineKey(line.productId, line.variantId))
    const matchingVariant = line.variantId
      ? product?.variants.find((variant) =>
          sameColor(line.variantName, variant.color),
        )
      : undefined
    if (!matchingVariant) return line
    const nextVariantName = matchingVariant.color ?? line.variantName
    if (
      matchingVariant.id === line.variantId &&
      nextVariantName === line.variantName
    ) {
      return line
    }
    return {
      ...line,
      variantId: matchingVariant.id ?? line.variantId,
      variantName: nextVariantName ?? undefined,
    }
  })
  if (rebound.some((line, index) => line !== persisted[index])) {
    writePersistedCart(rebound)
  }
  const { lines, unavailableItems } = resolveLines(rebound, details)
  return {
    id: CART_ID,
    items: lines,
    unavailableItems,
    subtotal: computeSubtotal(lines),
  }
}

export async function fetchCart(): Promise<Cart> {
  return buildCart(readPersistedCart())
}

export async function addToCart(
  productId: string,
  quantity: number,
  variant: {
    id: string
    name: string
    productName: string
    imageUrl: string | null
    price: number
  },
  productName?: string,
): Promise<Cart> {
  const lines = readPersistedCart()
  const key = cartLineKey(productId, variant.id)
  const existing = lines.find(
    (line) => cartLineKey(line.productId, line.variantId) === key,
  )
  if (existing) {
    existing.quantity += quantity
  } else {
    lines.push({
      productId,
      quantity,
      variantId: variant.id,
      variantName: variant.name,
      productName: productName ?? variant.productName,
      imageUrl: variant.imageUrl ?? undefined,
      unitPrice: variant.price,
    })
  }
  writePersistedCart(lines)
  return buildCart(lines)
}

export async function updateQuantity(
  productId: string,
  quantity: number,
  variantId?: string,
): Promise<Cart> {
  const lines = readPersistedCart()
  if (quantity < 1) {
    const key = cartLineKey(productId, variantId)
    const filtered = lines.filter(
      (line) => cartLineKey(line.productId, line.variantId) !== key,
    )
    writePersistedCart(filtered)
    return buildCart(filtered)
  }
  const key = cartLineKey(productId, variantId)
  const existing = lines.find(
    (line) => cartLineKey(line.productId, line.variantId) === key,
  )
  if (existing) {
    existing.quantity = quantity
  } else {
    lines.push({ productId, quantity })
  }
  writePersistedCart(lines)
  return buildCart(lines)
}

export async function removeFromCart(
  productId: string,
  variantId?: string,
): Promise<Cart> {
  const lines = readPersistedCart()
  const key = cartLineKey(productId, variantId)
  const filtered = lines.filter(
    (line) => cartLineKey(line.productId, line.variantId) !== key,
  )
  writePersistedCart(filtered)
  return buildCart(filtered)
}

export async function clearCart(): Promise<Cart> {
  writePersistedCart([])
  return { id: CART_ID, items: [], unavailableItems: [], subtotal: 0 }
}
