import type { TopProduct } from "#/components/top-sellers/types"

export async function fetchTopSellers(): Promise<TopProduct[]> {
  return [
    {
      id: "1",
      imageUrl:
        "https://images.pexels.com/photos/5202048/pexels-photo-5202048.jpeg?auto=compress&cs=tinysrgb&w=600",
      name: "Lentes de Sol Aviator",
      brand: "Ray-Ban",
      price: 329900,
    },
    {
      id: "2",
      imageUrl:
        "https://images.pexels.com/photos/26575042/pexels-photo-26575042.jpeg?auto=compress&cs=tinysrgb&w=600",
      name: "Lentes Rectangulares Rosados",
      brand: "Persol",
      price: 3289900,
    },
    {
      id: "3",
      imageUrl:
        "https://images.pexels.com/photos/34978681/pexels-photo-34978681.jpeg?auto=compress&cs=tinysrgb&w=600",
      name: "Colección Gafas Modernas",
      brand: "Oakley",
      price: 459900,
    },
    {
      id: "4",
      imageUrl:
        "https://images.pexels.com/photos/15735139/pexels-photo-15735139.jpeg?auto=compress&cs=tinysrgb&w=600",
      name: "Lentes de Mercado",
      brand: "Prada",
      price: 379900,
    },
    {
      id: "5",
      imageUrl:
        "https://images.pexels.com/photos/2767694/pexels-photo-2767694.jpeg?auto=compress&cs=tinysrgb&w=600",
      name: "Gafas de Sol Coloridas",
      brand: "Gucci",
      price: 729900,
    },
    {
      id: "6",
      imageUrl:
        "https://images.pexels.com/photos/1013482/pexels-photo-1013482.jpeg?auto=compress&cs=tinysrgb&w=600",
      name: "Lentes de Sol Clásicos",
      brand: "Ray-Ban",
      price: 319900,
    },
    {
      id: "7",
      imageUrl:
        "https://images.pexels.com/photos/5201935/pexels-photo-5201935.jpeg?auto=compress&cs=tinysrgb&w=600",
      name: "Lentes Exhibidos en Rack",
      brand: "Ray-Ban",
      price: 499900,
    },
    {
      id: "8",
      imageUrl:
        "https://images.pexels.com/photos/121795/pexels-photo-121795.jpeg?auto=compress&cs=tinysrgb&w=600",
      name: "Gafas Reflectantes",
      brand: "Prada",
      price: 619900,
    },
    {
      id: "9",
      imageUrl:
        "https://images.pexels.com/photos/5766156/pexels-photo-5766156.jpeg?auto=compress&cs=tinysrgb&w=600",
      name: "Lentes Marco Metálico",
      brand: "Persol",
      price: 689900,
    },
    {
      id: "10",
      imageUrl:
        "https://images.pexels.com/photos/5472300/pexels-photo-5472300.jpeg?auto=compress&cs=tinysrgb&w=600",
      name: "Lentes de Sol Azul Marino",
      brand: "Ray-Ban",
      price: 349900,
    },
  ]
}
