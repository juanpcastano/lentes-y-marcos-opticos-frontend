import { Link } from "@tanstack/react-router"
import { Star } from "lucide-react"
import { Image } from "#/components/ui/image"
import type { Brand } from "./types"

interface BrandCardProps {
  brand: Brand
}

export function BrandCard({ brand }: BrandCardProps) {
  return (
    <Link
      to="/catalog"
      search={{ brands: [brand.name] }}
      className="relative block h-56 w-full overflow-hidden rounded-3xl transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:h-64"
    >
      <Image
        src={brand.imageUrl}
        alt={`Logotipo de ${brand.name}`}
        containerClassName="absolute inset-0 h-full w-full"
        className="h-full w-full object-cover"
        loading="lazy"
      />

      {/* Gradient scrim for text readability */}
      <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />

      {brand.isFeatured && (
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground shadow">
          <Star className="size-3" />
          Destacada
        </span>
      )}

      {/* Text overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-5">
        <h3 className="mb-1 text-xl font-bold text-white">{brand.name}</h3>
        <p className="text-sm text-white/90">{brand.tagline}</p>
      </div>
    </Link>
  )
}
