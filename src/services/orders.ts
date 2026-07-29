import { clearCart } from "#/services/cart"

export type OrderItem = {
  name: string
  quantity: number
  price: number
}

export type OrderStatus = "active" | "finished"
export type PaymentStatus = "pending" | "paid"

export type OrderShippingAddress = {
  id: string
  label: string
  street: string
  details: string
}

export type Order = {
  id: string
  createdAt: string
  status: OrderStatus
  items: OrderItem[]
  total: number
  shippingAddress: OrderShippingAddress
  shippingDate: string
  paymentStatus: PaymentStatus
  transactionId: string
}

const copFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
})

export function formatCop(value: number): string {
  return copFormatter.format(value)
}

const MOCK_ORDERS_KEY = "mock_orders"

function readPersistedOrders(): Order[] {
  const stored = localStorage.getItem(MOCK_ORDERS_KEY)
  if (!stored) return []
  try {
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (o): o is Order =>
        o !== null &&
        typeof o === "object" &&
        typeof (o as Order).id === "string" &&
        typeof (o as Order).status === "string",
    )
  } catch {
    return []
  }
}

function writePersistedOrders(orders: Order[]): void {
  localStorage.setItem(MOCK_ORDERS_KEY, JSON.stringify(orders))
}

function genOrderId(): string {
  return `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`
}

const DEFAULT_ORDERS: Order[] = [
  {
    id: "ORD-1042",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    items: [
      { name: "Lentes de sol Ray-Ban Aviator", quantity: 1, price: 459000 },
      { name: "Estuche rígido", quantity: 1, price: 35000 },
    ],
    total: 494000,
    shippingAddress: {
      id: "addr-1",
      label: "Casa",
      street: "Carrera 5 # 12-34",
      details: "Apto 302, Torre 2",
    },
    shippingDate: (() => {
      const d = new Date()
      d.setDate(d.getDate() + 5)
      return d.toISOString().slice(0, 10)
    })(),
    paymentStatus: "paid",
    transactionId: "tx-default-1",
  },
  {
    id: "ORD-1015",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: "finished",
    items: [
      { name: "Lentes de sol Tom Ford", quantity: 1, price: 625000 },
      { name: "Paño microfibra", quantity: 2, price: 8000 },
    ],
    total: 641000,
    shippingAddress: {
      id: "addr-1",
      label: "Casa",
      street: "Carrera 5 # 12-34",
      details: "Apto 302, Torre 2",
    },
    shippingDate: (() => {
      const d = new Date()
      d.setDate(d.getDate() - 25)
      return d.toISOString().slice(0, 10)
    })(),
    paymentStatus: "paid",
    transactionId: "tx-default-2",
  },
]

function ensureDefaultOrders(): void {
  if (localStorage.getItem(MOCK_ORDERS_KEY) === null) {
    writePersistedOrders(DEFAULT_ORDERS)
  }
}

export async function fetchOrders(): Promise<Order[]> {
  ensureDefaultOrders()
  return readPersistedOrders()
}

export async function createOrder(data: {
  items: OrderItem[]
  shippingAddress: OrderShippingAddress
  shippingDate: string
}): Promise<Order> {
  ensureDefaultOrders()
  const order: Order = {
    id: genOrderId(),
    createdAt: new Date().toISOString(),
    status: "active",
    items: data.items,
    total: data.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    shippingAddress: data.shippingAddress,
    shippingDate: data.shippingDate,
    paymentStatus: "pending",
    transactionId: "",
  }
  const orders = readPersistedOrders()
  orders.unshift(order)
  writePersistedOrders(orders)
  await clearCart()
  return order
}

export async function confirmPayment(
  orderId: string,
  transactionId: string,
): Promise<Order> {
  ensureDefaultOrders()
  const orders = readPersistedOrders()
  const order = orders.find((o) => o.id === orderId)
  if (!order) throw new Error("Order not found")
  order.paymentStatus = "paid"
  order.transactionId = transactionId
  writePersistedOrders(orders)
  return order
}

export async function cancelOrder(orderId: string): Promise<Order[]> {
  ensureDefaultOrders()
  const now = new Date()
  const orders = readPersistedOrders()
  const order = orders.find((o) => o.id === orderId)
  if (!order) throw new Error("Order not found")
  if (order.status !== "active")
    throw new Error("Cannot cancel non-active order")
  const shippingDate = new Date(order.shippingDate + "T00:00:00")
  const hoursUntilShipping =
    (shippingDate.getTime() - now.getTime()) / (1000 * 60 * 60)
  if (hoursUntilShipping < 24) {
    throw new Error(
      "No se puede cancelar el pedido faltando menos de 24 horas para el envío",
    )
  }
  const filtered = orders.filter((o) => o.id !== orderId)
  writePersistedOrders(filtered)
  return filtered
}
