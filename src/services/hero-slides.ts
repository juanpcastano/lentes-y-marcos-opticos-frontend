import type { HeroSlide } from '#/components/hero-carousel/types'

export async function fetchHeroSlides(): Promise<HeroSlide[]> {
  return [
    {
      imageUrl:
        'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=1600&q=80',
      title: 'Nueva Colección de Lentes 2025',
      description:
        'Descubre los modelos más exclusivos de las mejores marcas. Estilo y protección para tu vista.',
      actions: [
        { label: 'Ver catálogo', to: '/catalog' },
        { label: 'Agendar cita', to: '/appointments' },
      ],
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1600&q=80',
      title: 'Promoción de Verano',
      description:
        '20% de descuento en lentes de sol polarizados. Solo por tiempo limitado.',
      actions: [{ label: 'Ver ofertas', to: '/catalog' }],
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1559563458-527698bf5295?auto=format&fit=crop&w=1600&q=80',
      title: 'Examen Visual Profesional',
      description:
        'Contamos con optometristas certificados y tecnología de última generación para cuidar tu salud visual.',
      actions: [{ label: 'Reservar examen', to: '/appointments' }],
    },
  ]
}
