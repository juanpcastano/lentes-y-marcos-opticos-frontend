import { fetchProductById } from "#/services/products"
import { productTitle } from "#/components/catalog/types"
import type { ProductDetail } from "#/components/product-detail/types"

export type CartItem = {
  productId: string
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
  lineTotal: number
  unavailableReason?: string
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
): { lines: CartLine[]; unavailableItems: CartLine[] } {
  const lines: CartLine[] = []
  const unavailableItems: CartLine[] = []

  for (const line of persisted) {
    const product = details.get(line.productId)
    const quantity = line.quantity
    const name = product
      ? productTitle(product)
      : (line.productName ?? "Producto no disponible")
    const imageUrl = product?.imageUrl ?? line.imageUrl ?? ""
    // Precio vivo de Softix; el precio guardado es solo respaldo.
    const unitPrice = product?.price ?? line.unitPrice ?? 0
    const base = {
      productId: line.productId,
      name,
      imageUrl,
      unitPrice,
      quantity,
      lineTotal: unitPrice * quantity,
    }

    if (!product) {
      unavailableItems.push({
        ...base,
        unitPrice: line.unitPrice ?? 0,
        lineTotal: 0,
        unavailableReason: "No se pudo comprobar la disponibilidad",
      })
    } else if (!product.available || quantity > product.stock) {
      unavailableItems.push({
        ...base,
        lineTotal: 0,
        unavailableReason: product.available
          ? "El stock disponible cambió"
          : "Agotado",
      })
    } else {
      lines.push(base)
    }
  }

  return { lines, unavailableItems }
}

async function buildCart(persisted: CartItem[]): Promise<Cart> {
  if (persisted.length === 0) {
    return { id: CART_ID, items: [], unavailableItems: [], subtotal: 0 }
  }

  const ids = [...new Set(persisted.map((line) => line.productId))]
  const entries = await Promise.all(
    ids.map(async (id) => {
      const detail = await fetchProductById(id).catch(() => null)
      return [id, detail] as const
    }),
  )
  const details = new Map<string, ProductDetail>()
  for (const [id, detail] of entries) {
    if (detail) details.set(id, detail)
  }

  const { lines, unavailableItems } = resolveLines(persisted, details)
  return {
    id: CART_ID,
    items: lines,
    unavailableItems,
    subtotal: lines.reduce((sum, line) => sum + line.lineTotal, 0),
  }
}

export async function fetchCart(): Promise<Cart> {
  return buildCart(readPersistedCart())
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
