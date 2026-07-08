export interface HeroSlide {
  imageUrl: string
  title: string
  description: string
  actions: Array<{
    label: string
    to: string
  }>
}
