import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_main-layout/_authenticated/orders")({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_main-layout/_authenticated/orders"!</div>
}
