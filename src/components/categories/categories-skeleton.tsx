import { Skeleton } from "#/components/ui/skeleton"

export function CategoriesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} className="h-56 rounded-3xl md:h-64" />
      ))}
    </div>
  )
}
