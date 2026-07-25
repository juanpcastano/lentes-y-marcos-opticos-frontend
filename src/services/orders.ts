export type OrderItem = {
  name: string
  quantity: number
  price: number
}

export type OrderStatus = "active" | "finished"

export type Order = {
  id: string
  createdAt: string
  status: OrderStatus
  items: OrderItem[]
  total: number
}

const copFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
})

export function formatCop(value: number): string {
  return copFormatter.format(value)
}

export async function fetchOrders(): Promise<Order[]> {
  return [
    {
      id: "ORD-1042",
      createdAt: "2026-07-20",
      status: "active",
      items: [
        {
          name: "Lentes de sol Ray-Ban Aviator",
          quantity: 1,
          price: 459000,
        },
        { name: "Estuche rígido", quantity: 1, price: 35000 },
      ],
      total: 494000,
    },
    {
      id: "ORD-1038",
      createdAt: "2026-07-18",
      status: "active",
      items: [{ name: "Montura Oakley Crosslink", quantity: 1, price: 389000 }],
      total: 389000,
    },
    {
      id: "ORD-1015",
      createdAt: "2026-06-25",
      status: "finished",
      items: [
        { name: "Lentes de sol Tom Ford", quantity: 1, price: 625000 },
        { name: "Paño microfibra", quantity: 2, price: 8000 },
      ],
      total: 641000,
    },
    {
      id: "ORD-0998",
      createdAt: "2026-06-02",
      status: "finished",
      items: [
        { name: "Montura Persol", quantity: 1, price: 549000 },
        { name: "Lentes progresivos", quantity: 1, price: 270000 },
      ],
      total: 819000,
    },
    {
      id: "ORD-0987",
      createdAt: "2026-05-14",
      status: "finished",
      items: [{ name: "Kit de limpieza", quantity: 1, price: 25000 }],
      total: 25000,
    },
  ]
}
