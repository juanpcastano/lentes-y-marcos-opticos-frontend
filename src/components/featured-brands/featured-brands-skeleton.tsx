import { Skeleton } from "#/components/ui/skeleton"

export function FeaturedBrandsSkeleton() {
  return (
    <section className="px-4 py-10 md:px-6 lg:px-8">
      {/* Header skeleton */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <Skeleton className="mb-2 h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-5 w-24 rounded-4xl" />
      </div>

      {/* Grid skeleton - right-side dominant */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:grid-rows-2 md:h-[28rem]">
        {/* Large right card */}
        <Skeleton className="h-56 rounded-3xl md:h-full md:row-span-2 md:order-2" />
        {/* Small left cards */}
        <Skeleton className="h-56 rounded-3xl md:h-full md:order-1" />
        <Skeleton className="h-56 rounded-3xl md:h-full md:order-3" />
      </div>
    </section>
  )
}
