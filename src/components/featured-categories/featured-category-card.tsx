import { Image } from "#/components/ui/image"
import type { FeaturedCategory } from "./types"

interface FeaturedCategoryCardProps {
  category: FeaturedCategory
}

export function FeaturedCategoryCard({ category }: FeaturedCategoryCardProps) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl">
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
    </div>
  )
}
