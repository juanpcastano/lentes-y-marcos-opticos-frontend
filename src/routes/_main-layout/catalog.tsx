import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main-layout/catalog')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_main-layout/catalog"!</div>
}
