import { fetchProductById, fetchProducts } from "#/services/products"
import type { CatalogProduct } from "#/components/catalog/types"

type CartProduct = CatalogProduct & {
  variants?: Array<{
    id: string | null
    variantName: string | null
    isActive: boolean | null
  }>
}

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

function toCatalogIndex(products: CartProduct[]): Map<string, CartProduct> {
  return new Map(products.map((p) => [p.id, p]))
}

function sameVariantName(left?: string, right?: string | null): boolean {
  return Boolean(
    left && right && left.trim().toLowerCase() === right.trim().toLowerCase(),
  )
}

function resolveLines(
  persisted: PersistedLine[],
  products: CartProduct[],
): { lines: CartLine[]; unavailableItems: CartLine[] } {
  const index = toCatalogIndex(products)
  const lines: CartLine[] = []
  const unavailableItems: CartLine[] = []
  for (const line of persisted) {
    const product = index.get(line.productId)
    const quantity = line.quantity
    const productName =
      product?.name ?? line.productName ?? "Producto no disponible"
    const unitPrice = line.unitPrice ?? product?.price ?? 0
    const matchingVariant = line.variantId
      ? product?.variants?.find(
          (variant) =>
            variant.id === line.variantId ||
            sameVariantName(line.variantName, variant.variantName),
        )
      : undefined
    const variantUnavailable =
      line.variantId !== undefined &&
      (!matchingVariant || matchingVariant.isActive === false)
    const cartLine = {
      productId: product?.id ?? line.productId,
      variantId: matchingVariant?.id ?? line.variantId,
      variantName: matchingVariant?.variantName ?? line.variantName,
      name:
        (matchingVariant?.variantName ?? line.variantName)
          ? `${productName} - ${matchingVariant?.variantName ?? line.variantName}`
          : productName,
      imageUrl: line.imageUrl ?? product?.imageUrl ?? "",
      unitPrice,
      quantity,
      lineTotal: unitPrice * quantity,
    }
    if (product && product.isActive !== false && !variantUnavailable) {
      lines.push(cartLine)
    } else {
      unavailableItems.push({
        ...cartLine,
        productId: line.productId,
        name: productName,
        imageUrl: line.imageUrl ?? "",
        unitPrice: line.unitPrice ?? 0,
        lineTotal: 0,
        unavailableReason: variantUnavailable
          ? "La variante seleccionada ya no está disponible"
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
  const { content: products } = await fetchProducts({ size: 50 })
  const knownIds = new Set(products.map((product) => product.id))
  const details = await Promise.all(
    persisted
      .filter(
        (line) =>
          !knownIds.has(line.productId) ||
          persisted.some(
            (variantLine) =>
              variantLine.productId === line.productId &&
              variantLine.variantId !== undefined,
          ),
      )
      .map((line) => fetchProductById(line.productId).catch(() => null)),
  )
  const productsWithDetails = [
    ...products,
    ...details.filter((product) => product !== null),
  ]
  const index = toCatalogIndex(productsWithDetails)
  const rebound = persisted.map((line) => {
    const product = index.get(line.productId)
    const matchingVariant = line.variantId
      ? product?.variants?.find((variant) =>
          sameVariantName(line.variantName, variant.variantName),
        )
      : undefined
    if (!matchingVariant) return line
    const nextVariantName = matchingVariant.variantName ?? line.variantName
    if (
      matchingVariant.id === line.variantId &&
      nextVariantName === line.variantName
    ) {
      return line
    }
    return {
      ...line,
      variantId: matchingVariant.id ?? line.variantId,
      variantName: nextVariantName,
    }
  })
  if (rebound.some((line, index) => line !== persisted[index])) {
    writePersistedCart(rebound)
  }
  const { lines, unavailableItems } = resolveLines(rebound, productsWithDetails)
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
  variant?: {
    id: string
    name: string
    productName: string
    imageUrl: string | null
    price: number
  },
  productName?: string,
): Promise<Cart> {
  const lines = readPersistedCart()
  const key = cartLineKey(productId, variant?.id)
  const existing = lines.find(
    (line) => cartLineKey(line.productId, line.variantId) === key,
  )
  if (existing) {
    existing.quantity += quantity
  } else {
    lines.push({
      productId,
      quantity,
      variantId: variant?.id,
      variantName: variant?.name,
      productName: productName ?? variant?.productName,
      imageUrl: variant?.imageUrl ?? undefined,
      unitPrice: variant?.price,
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
