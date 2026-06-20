import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main-layout/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Home page</div>
}
