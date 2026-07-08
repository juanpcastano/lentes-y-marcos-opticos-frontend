import { createFileRoute } from '@tanstack/react-router'
import { HeroCarousel } from '#/components/hero-carousel/hero-carousel'

export const Route = createFileRoute('/_main-layout/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <HeroCarousel />
      <div>Home page</div>
    </div>
  )
}
