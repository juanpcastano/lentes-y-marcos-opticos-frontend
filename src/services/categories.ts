import type { Category } from "#/components/categories/types"

export async function fetchCategories(): Promise<Category[]> {
  return [
    {
      imageUrl:
        "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=1200&q=80",
      name: "Marcos ópticos",
      description:
        "Lentes de armazón para uso diario con la última tecnología.",
    },
    {
      imageUrl:
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
      name: "Gafas de sol",
      description: "Protección y estilo para cada ocasión.",
    },
    {
      imageUrl:
        "https://images.unsplash.com/photo-1559563458-527698bf5295?auto=format&fit=crop&w=800&q=80",
      name: "Deportivas",
      description: "Resistencia y diseño para un rendimiento óptimo.",
    },
    {
      imageUrl:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
      name: "Hombre",
      description: "Colección exclusiva de marcos masculinos.",
    },
    {
      imageUrl:
        "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80",
      name: "Mujer",
      description: "Estilo y elegancia en cada diseño femenino.",
    },
    {
      imageUrl:
        "https://images.unsplash.com/photo-1473496169904-655ba72e4200?auto=format&fit=crop&w=800&q=80",
      name: "Unisex",
      description: "Diseños versátiles para cualquier estilo.",
    },
    {
      imageUrl:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
      name: "Premium",
      description: "Las mejores marcas y materiales de alta gama.",
    },
  ]
}
