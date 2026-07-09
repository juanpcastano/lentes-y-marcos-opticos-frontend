import { Skeleton } from "#/components/ui/skeleton"

export function HeroCarouselSkeleton() {
  return (
    <div className="relative w-full overflow-hidden h-64 md:h-96 lg:h-[28rem]">
      {/* Image skeleton */}
      <Skeleton className="absolute inset-0 h-full w-full rounded-none" />

      {/* Text skeleton overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 lg:p-12">
        <Skeleton className="mb-2 h-8 w-3/4 md:h-10 lg:h-12" />
        <Skeleton className="mb-4 h-4 w-2/3 md:h-5 lg:h-6" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-4xl" />
          <Skeleton className="h-9 w-28 rounded-4xl" />
        </div>
      </div>
    </div>
  )
}
