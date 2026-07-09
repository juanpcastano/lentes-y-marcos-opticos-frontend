export interface WhyChooseUsFeature {
  icon: string
  title: string
  description: string
  variant: "primary" | "secondary"
}

export interface WhyChooseUsData {
  imageUrl: string
  title: string
  features: WhyChooseUsFeature[]
}
