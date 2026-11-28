import { Card, CardContent } from "#/components/ui/card"
import { Skeleton } from "#/components/ui/skeleton"

const DATA_FIELDS = ["w-16", "w-14", "w-20", "w-24"]

export function PersonalDataSkeleton() {
  return (
    <div className="grid gap-3" aria-busy="true">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-8 w-24 rounded-4xl" />
      </div>
      <Card className="p-0">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Skeleton className="size-5 rounded-full" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            {DATA_FIELDS.map((labelWidth) => (
              <div key={labelWidth} className="grid gap-1.5">
                <Skeleton className={`h-4 ${labelWidth}`} />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function NotificationsSkeleton() {
  return (
    <div className="grid gap-3" aria-busy="true">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-8 w-36 rounded-4xl" />
      </div>
      <Card className="p-0">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Skeleton className="size-5 rounded-full" />
            <Skeleton className="h-6 w-56" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-2/3" />
        </CardContent>
      </Card>
    </div>
  )
}
