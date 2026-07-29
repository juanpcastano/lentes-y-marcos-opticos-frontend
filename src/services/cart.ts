import { fetchProducts } from "#/services/products"
import type { CatalogProduct } from "#/components/catalog/types"

export type CartItem = {
  productId: string
  quantity: number
}

export type CartLine = {
  productId: string
  name: string
  imageUrl: string
  unitPrice: number
  quantity: number
  lineTotal: number
}

export type Cart = {
  id: string
  items: CartLine[]
  subtotal: number
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

function toCatalogIndex(
  products: CatalogProduct[],
): Map<string, CatalogProduct> {
  return new Map(products.map((p) => [p.id, p]))
}

function resolveLines(
  persisted: PersistedLine[],
  products: CatalogProduct[],
): { lines: CartLine[]; cleaned: PersistedLine[] } {
  const index = toCatalogIndex(products)
  const lines: CartLine[] = []
  const cleaned: PersistedLine[] = []
  for (const line of persisted) {
    const product = index.get(line.productId)
    if (!product) continue
    const quantity = line.quantity
    const unitPrice = product.price
    lines.push({
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      unitPrice,
      quantity,
      lineTotal: unitPrice * quantity,
    })
    cleaned.push(line)
  }
  return { lines, cleaned }
}

function computeSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.lineTotal, 0)
}

async function buildCart(persisted: PersistedLine[]): Promise<Cart> {
  if (persisted.length === 0) {
    return { id: CART_ID, items: [], subtotal: 0 }
  }
  const products = await fetchProducts()
  const { lines, cleaned } = resolveLines(persisted, products)
  if (cleaned.length !== persisted.length) {
    writePersistedCart(cleaned)
  }
  return {
    id: CART_ID,
    items: lines,
    subtotal: computeSubtotal(lines),
  }
}

export async function fetchCart(): Promise<Cart> {
  return buildCart(readPersistedCart())
}

export async function addToCart(
  productId: string,
  quantity: number,
): Promise<Cart> {
  const lines = readPersistedCart()
  const existing = lines.find((line) => line.productId === productId)
  if (existing) {
    existing.quantity += quantity
  } else {
    lines.push({ productId, quantity })
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
  return { id: CART_ID, items: [], subtotal: 0 }
}
