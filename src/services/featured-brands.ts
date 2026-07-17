import type { FeaturedBrand } from "#/components/featured-brands/types"

export const FEATURED_BRANDS: FeaturedBrand[] = [
  {
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHCSRVdU1hEHe-0n6fQQ1cWtdDNguj3eHCe_Uui5LgZw&s=10",
    name: "Ray-Ban",
    tagline: "Icono atemporal de estilo y calidad óptica.",
  },
  {
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Oakley_logo.svg/1280px-Oakley_logo.svg.png",
    name: "Oakley",
    tagline: "Innovación y rendimiento para cada aventura.",
  },
  {
    imageUrl:
      "https://logoeps.com/wp-content/uploads/2012/10/persol-vector-logo.png",
    name: "Persol",
    tagline: "Artesanía italiana desde 1917.",
  },
]

export async function fetchFeaturedBrands(): Promise<FeaturedBrand[]> {
  return FEATURED_BRANDS
}
