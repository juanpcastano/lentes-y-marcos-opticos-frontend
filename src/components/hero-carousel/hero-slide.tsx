import { Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { Image } from '#/components/ui/image'
import type { HeroSlide as HeroSlideType } from './types'

interface HeroSlideProps {
  slide: HeroSlideType
}

export function HeroSlide({ slide }: HeroSlideProps) {
  return (
    <div className="relative h-full w-full">
      <Image
        src={slide.imageUrl}
        alt={slide.title}
        containerClassName="absolute inset-0 h-full w-full"
        className="h-full w-full object-cover"
        loading="lazy"
      />

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-10 md:p-16 lg:p-18">
        <h2 className="mb-2 text-2xl font-bold text-white md:text-4xl lg:text-5xl">
          {slide.title}
        </h2>
        <p className="mb-4 max-w-xl text-sm text-white/90 md:text-base lg:text-lg">
          {slide.description}
        </p>
        {slide.actions.length > 0 && (
          <div className="flex flex-col gap-2 sm:flex-row">
            {slide.actions.map((action, idx) => (
              <Button
                key={idx}
                asChild
                variant="default"
                size="sm"
                className="md:size-default"
              >
                <Link to={action.to}>{action.label}</Link>
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
