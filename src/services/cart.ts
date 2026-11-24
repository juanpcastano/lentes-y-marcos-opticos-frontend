import {
  fetchInventoryAvailability,
  fetchProductById,
} from "#/services/products"
import type { InventoryAvailability } from "#/services/products"
import { productTitle } from "#/components/catalog/types"
import type { ProductDetail } from "#/components/product-detail/types"

export type CartItem = {
  productId: string
  sku?: string
  quantity: number
  productName?: string
  imageUrl?: string
  unitPrice?: number
}

export type CartLine = {
  productId: string
  name: string
  imageUrl: string
  unitPrice: number
  quantity: number
  maxQuantity: number
  lineTotal: number
  unavailableReason?: string
  availabilityNotice?: string
}

export type Cart = {
  id: string
  items: CartLine[]
  unavailableItems: CartLine[]
  subtotal: number
}

/** Un SKU es un producto: la clave de línea es el productId. */
export function cartLineKey(productId: string): string {
  return productId
}

const CART_KEY = "mock_cart"
const CART_ID = "cart"
const productCache = new Map<string, ProductDetail>()
const availabilityCache = new Map<string, InventoryAvailability>()

function readPersistedCart(): CartItem[] {
  const stored = localStorage.getItem(CART_KEY)
  if (!stored) return []
  try {
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((value): value is CartItem => {
      if (value === null || typeof value !== "object") return false
      const line = value as CartItem
      return (
        typeof line.productId === "string" && typeof line.quantity === "number"
      )
    })
  } catch {
    return []
  }
}

function writePersistedCart(lines: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(lines))
}

function resolveLines(
  persisted: CartItem[],
  details: Map<string, ProductDetail>,
  availability: Map<string, InventoryAvailability>,
  unavailableSkus: Set<string>,
): { lines: CartLine[]; unavailableItems: CartLine[] } {
  const lines: CartLine[] = []
  const unavailableItems: CartLine[] = []

  for (const line of persisted) {
    const product = details.get(line.productId)
    const liveAvailability = product ? availability.get(product.sku) : undefined
    const quantity = liveAvailability
      ? Math.min(line.quantity, liveAvailability.availableQuantity)
      : line.quantity
    const name = product
      ? productTitle(product)
      : (line.productName ?? "Producto no disponible")
    const imageUrl = product?.imageUrl ?? line.imageUrl ?? ""
    // Precio vivo de Softix; el precio guardado es solo respaldo.
    const unitPrice = product?.price ?? line.unitPrice ?? 0
    const base: CartLine = {
      productId: line.productId,
      name,
      imageUrl,
      unitPrice,
      quantity,
      maxQuantity: liveAvailability?.availableQuantity ?? 0,
      lineTotal: unitPrice * quantity,
    }

    if (!product) {
      unavailableItems.push({
        ...base,
        unitPrice: line.unitPrice ?? 0,
        lineTotal: 0,
        unavailableReason: "No se pudo comprobar la disponibilidad",
      })
    } else if (unavailableSkus.has(product.sku)) {
      unavailableItems.push({
        ...base,
        lineTotal: 0,
        unavailableReason: "No se pudo comprobar la disponibilidad",
      })
    } else if (
      !product.available ||
      liveAvailability?.availableQuantity === 0
    ) {
      unavailableItems.push({
        ...base,
        lineTotal: 0,
        unavailableReason: product.available ? "Agotado" : "No disponible",
      })
    } else {
      if (quantity < line.quantity) {
        base.availabilityNotice = `La cantidad se ajustó a ${quantity} por cambio de stock`
      }
      lines.push(base)
    }
  }

  return { lines, unavailableItems }
}

async function buildCart(
  persisted: CartItem[],
  refreshAvailability = false,
): Promise<Cart> {
  if (persisted.length === 0) {
    return { id: CART_ID, items: [], unavailableItems: [], subtotal: 0 }
  }

  const ids = [...new Set(persisted.map((line) => line.productId))]
  const entries = await Promise.all(
    ids.map(async (id) => {
      let detail = productCache.get(id)
      if (!detail || refreshAvailability) {
        detail = (await fetchProductById(id).catch(() => null)) ?? undefined
        if (detail) productCache.set(id, detail)
      }
      if (!detail) return [id, detail, null] as const
      let current = availabilityCache.get(detail.sku)
      if (!current || refreshAvailability) {
        try {
          current = await fetchInventoryAvailability(detail.sku)
          availabilityCache.set(detail.sku, current)
        } catch {
          return [id, detail, null] as const
        }
      }
      return [id, detail, current] as const
    }),
  )
  const details = new Map<string, ProductDetail>()
  const availability = new Map<string, InventoryAvailability>()
  const unavailableSkus = new Set<string>()
  for (const [id, detail, current] of entries) {
    if (detail) details.set(id, detail)
    if (detail && current) availability.set(detail.sku, current)
    if (detail && !current) unavailableSkus.add(detail.sku)
  }

  const { lines, unavailableItems } = resolveLines(
    persisted,
    details,
    availability,
    unavailableSkus,
  )
  const adjusted = persisted.map((line) => {
    const detail = details.get(line.productId)
    const current = detail ? availability.get(detail.sku) : undefined
    return current
      ? {
          ...line,
          quantity: Math.min(line.quantity, current.availableQuantity),
        }
      : line
  })
  if (JSON.stringify(adjusted) !== JSON.stringify(persisted)) {
    writePersistedCart(adjusted)
  }
  return {
    id: CART_ID,
    items: lines,
    unavailableItems,
    subtotal: lines.reduce((sum, line) => sum + line.lineTotal, 0),
  }
}

export async function fetchCart(): Promise<Cart> {
  return buildCart(readPersistedCart(), true)
}

export async function addToCart(
  productId: string,
  quantity: number,
  product: {
    id: string
    name: string
    productName: string
    imageUrl: string | null
    price: number
    sku: string
  },
  productName?: string,
): Promise<Cart> {
  const lines = readPersistedCart()
  const existing = lines.find((line) => line.productId === productId)
  if (existing) {
    existing.quantity += quantity
  } else {
    lines.push({
      productId,
      sku: product.sku,
      quantity,
      productName: productName ?? product.productName,
      imageUrl: product.imageUrl ?? undefined,
      unitPrice: product.price,
    })
  }
  writePersistedCart(lines)
  return buildCart(lines)
}

export async function updateQuantity(
  productId: string,
  quantity: number,
): Promise<Cart> {
  const lines = readPersistedCart()
  if (quantity < 1) {
    const filtered = lines.filter((line) => line.productId !== productId)
    writePersistedCart(filtered)
    return buildCart(filtered)
  }
  const existing = lines.find((line) => line.productId === productId)
  if (existing) {
    existing.quantity = quantity
  } else {
    lines.push({ productId, quantity })
  }
  writePersistedCart(lines)
  return buildCart(lines)
}

export async function removeFromCart(productId: string): Promise<Cart> {
  const lines = readPersistedCart()
  const filtered = lines.filter((line) => line.productId !== productId)
  writePersistedCart(filtered)
  return buildCart(filtered)
}

export async function clearCart(): Promise<Cart> {
  writePersistedCart([])
  return { id: CART_ID, items: [], unavailableItems: [], subtotal: 0 }
}
