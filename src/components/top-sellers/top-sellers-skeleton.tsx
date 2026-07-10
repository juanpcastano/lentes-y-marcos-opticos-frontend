import { Skeleton } from "#/components/ui/skeleton"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "#/components/ui/carousel"

export function TopSellersSkeleton() {
  return (
    <section className="px-4 py-10 md:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="px-12">
        <Carousel
          opts={{ align: "start" }}
          className="w-full"
          aria-hidden="true"
        >
          <CarouselContent>
            {Array.from({ length: 6 }).map((_, i) => (
              <CarouselItem
                key={i}
                className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-card">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <div className="flex flex-col gap-2 p-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  )
}
