export interface HeroSlide {
  id: string
  imageUrl: string
  title: string
  description: string | null
  actions: Array<{
    label: string
    to: string
  }>
}
