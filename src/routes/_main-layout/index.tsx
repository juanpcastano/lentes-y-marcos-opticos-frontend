import { createFileRoute } from "@tanstack/react-router"
import { ExamOfferBanner } from "#/components/exam-offer-banner/exam-offer-banner"
import { FeaturedCategories } from "#/components/featured-categories/featured-categories"
import { HeroCarousel } from "#/components/hero-carousel/hero-carousel"
import { TopSellers } from "#/components/top-sellers/top-sellers"
import { WhyChooseUs } from "#/components/why-choose-us/why-choose-us"

export const Route = createFileRoute("/_main-layout/")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <HeroCarousel />
      <TopSellers />
      <FeaturedCategories />
      <WhyChooseUs />
      <ExamOfferBanner />
    </div>
  )
}
