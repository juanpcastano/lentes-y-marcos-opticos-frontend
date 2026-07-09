import { Skeleton } from "#/components/ui/skeleton"

export function WhyChooseUsSkeleton() {
  return (
    <section className="bg-muted px-4 py-10 md:px-6 md:py-16 lg:px-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center">
        {/* Image skeleton */}
        <Skeleton className="aspect-[4/3] w-full rounded-3xl" />

        {/* Content skeleton */}
        <div className="flex flex-col gap-6">
          <Skeleton className="h-8 w-3/4" />

          {/* Feature rows */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-4">
              <Skeleton className="size-12 shrink-0 rounded-xl" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-full max-w-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
