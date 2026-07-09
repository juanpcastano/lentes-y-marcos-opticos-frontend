import { useQuery } from "@tanstack/react-query"
import { ScanEye, Tag, CalendarDays } from "lucide-react"
import { Image } from "#/components/ui/image"
import createWhyChooseUsQueryOptions from "#/query-options/why-choose-us"
import { WhyChooseUsSkeleton } from "./why-choose-us-skeleton"
import type { WhyChooseUsFeature } from "./types"

const iconMap = {
  ScanEye,
  Tag,
  CalendarDays,
}

function FeatureItem({ feature }: { feature: WhyChooseUsFeature }) {
  const Icon = iconMap[feature.icon as keyof typeof iconMap]

  return (
    <div className="flex items-center gap-4">
      <div
        className={`flex size-14 shrink-0 items-center justify-center rounded-full ${
          feature.variant === "primary"
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground"
        }`}
      >
        <Icon className="size-8" />
      </div>
      <div>
        <h3 className="mb-1 text-lg font-semibold">{feature.title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {feature.description}
        </p>
      </div>
    </div>
  )
}

export function WhyChooseUs() {
  const { data, isLoading } = useQuery(createWhyChooseUsQueryOptions())

  if (isLoading) {
    return <WhyChooseUsSkeleton />
  }

  if (!data) {
    return null
  }

  return (
    <section className="bg-muted px-4 py-10 md:px-6 md:py-16 lg:px-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center">
        {/* Image */}
        <div className="overflow-hidden rounded-3xl">
          <Image
            src={data.imageUrl}
            alt={data.title}
            containerClassName="aspect-[4/3] w-full"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex flex-col gap-6 lg:gap-10">
          <h2 className="text-3xl font-bold lg:text-4xl">{data.title}</h2>

          <div className="flex flex-col gap-6 lg:gap-10">
            {data.features.map((feature, index) => (
              <FeatureItem key={index} feature={feature} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
