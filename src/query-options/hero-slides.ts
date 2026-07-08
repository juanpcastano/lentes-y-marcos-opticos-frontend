import { queryOptions } from '@tanstack/react-query'
import { fetchHeroSlides } from '#/services/hero-slides'
import type { HeroSlide } from '#/components/hero-carousel/types'
import type { UseQueryOptions } from '@tanstack/react-query'

export interface HeroSlidesParams {
  // Future filter parameters
}

export default function createHeroSlidesQueryOptions<
  TData = HeroSlide[],
  TError = Error,
>(
  params?: HeroSlidesParams,
  options?: Omit<
    UseQueryOptions<HeroSlide[], TError, TData>,
    'queryKey' | 'queryFn'
  >,
) {
  return queryOptions<HeroSlide[], TError, TData>({
    queryKey: ['hero-slides', params ?? {}],
    queryFn: fetchHeroSlides,
    ...options,
  })
}
