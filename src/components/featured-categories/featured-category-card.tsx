import { Link } from "@tanstack/react-router"
import { Image } from "#/components/ui/image"
import type { FeaturedCategory } from "./types"

interface FeaturedCategoryCardProps {
  category: FeaturedCategory
}

export function FeaturedCategoryCard({ category }: FeaturedCategoryCardProps) {
  return (
    <Link
      to="/catalog"
      search={{ categories: [category.name] }}
      className="relative block h-full w-full overflow-hidden rounded-3xl transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Image
        src={category.imageUrl}
        alt={category.name}
        containerClassName="absolute inset-0 h-full w-full"
        className="h-full w-full object-cover"
        loading="lazy"
      />

      {/* Gradient scrim for text readability */}
      <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />

      {/* Text overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6">
        <h3 className="mb-1 text-xl font-bold text-white md:text-2xl">
          {category.name}
        </h3>
        <p className="text-sm text-white/90 md:text-base">
          {category.description}
        </p>
      </div>
    </Link>
  )
}
