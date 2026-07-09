import type { FeaturedCategory } from "#/components/featured-categories/types"

export async function fetchFeaturedCategories(): Promise<FeaturedCategory[]> {
  return [
    {
      imageUrl:
        "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=1200&q=80",
      name: "Ópticos",
      description:
        "Lentes de armazón para uso diario con la última tecnología.",
    },
    {
      imageUrl:
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
      name: "Sol",
      description: "Protección y estilo para cada ocasión.",
    },
    {
      imageUrl:
        "https://images.unsplash.com/photo-1559563458-527698bf5295?auto=format&fit=crop&w=800&q=80",
      name: "Niños",
      description: "Resistencia y diseño pensado para los más pequeños.",
    },
  ]
}
