import { createFileRoute } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { PackageOpen } from "lucide-react"
import createOrdersQueryOptions from "#/query-options/orders"
import { Card, CardContent, CardHeader } from "#/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs"
import { formatCop } from "#/services/orders"
import type { Order } from "#/services/orders"

export const Route = createFileRoute(
  "/_main-layout/_authenticated/myaccount/orders",
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: orders } = useSuspenseQuery(createOrdersQueryOptions())

  const activeOrders = orders.filter((o) => o.status === "active")
  const finishedOrders = orders.filter((o) => o.status === "finished")

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Pedidos</h1>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Pedidos Activos</TabsTrigger>
          <TabsTrigger value="finished">Pedidos Finalizados</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4 flex flex-col gap-4">
          {activeOrders.length === 0 ? (
            <EmptyState message="No tienes pedidos activos." />
          ) : (
            activeOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          )}
        </TabsContent>

        <TabsContent value="finished" className="mt-4 flex flex-col gap-4">
          {finishedOrders.length === 0 ? (
            <EmptyState message="No tienes pedidos finalizados." />
          ) : (
            finishedOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function OrderCard({ order }: { order: Order }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="grid gap-0.5">
            <span className="font-medium">{order.id}</span>
            <span className="text-sm text-muted-foreground">
              {format(new Date(order.createdAt), "d 'de' MMMM 'de' yyyy", {
                locale: es,
              })}
            </span>
          </div>
          <span className="font-medium tabular-nums">
            {formatCop(order.total)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-1 text-sm text-muted-foreground">
          {order.items.map((item) => (
            <li key={item.name} className="flex justify-between">
              <span>
                {item.name}{" "}
                <span className="text-muted-foreground/70">
                  × {item.quantity}
                </span>
              </span>
              <span className="tabular-nums">
                {formatCop(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-4xl bg-muted/40 py-12 text-center">
      <PackageOpen className="size-8 text-muted-foreground" aria-hidden />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
