import type { Brand } from "#/components/brands/types"

export async function fetchBrands(): Promise<Brand[]> {
  return [
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
    {
      imageUrl:
        "https://images.pexels.com/photos/1573236/pexels-photo-1573236.jpeg?auto=compress&cs=tinysrgb&w=600",
      name: "Gucci",
      tagline: "Lujo italiano con diseño vanguardista.",
    },
    {
      imageUrl:
        "https://images.pexels.com/photos/1362558/pexels-photo-1362558.jpeg?auto=compress&cs=tinysrgb&w=600",
      name: "Prada",
      tagline: "Elegancia sofisticada y contemporánea.",
    },
    {
      imageUrl:
        "https://images.pexels.com/photos/1787242/pexels-photo-1787242.jpeg?auto=compress&cs=tinysrgb&w=600",
      name: "Vogue",
      tagline: "Moda accesible para todos los estilos.",
    },
  ]
}
