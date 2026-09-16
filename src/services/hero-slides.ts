import { api } from "#/lib/api"
import type { HeroSlide } from "#/components/hero-carousel/types"

export async function fetchHeroSlides(): Promise<HeroSlide[]> {
  return api.get<HeroSlide[]>("/hero-slides")
}
