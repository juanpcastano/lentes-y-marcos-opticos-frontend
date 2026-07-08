import { createFileRoute } from '@tanstack/react-router'
import { HeroCarousel } from '#/components/hero-carousel/hero-carousel'
import { FeaturedCategories } from '#/components/featured-categories/featured-categories'

export const Route = createFileRoute('/_main-layout/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <HeroCarousel />
      <FeaturedCategories />
    </div>
  )
}
