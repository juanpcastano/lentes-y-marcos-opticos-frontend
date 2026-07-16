import { useRef, useState } from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "#/components/ui/carousel"
import { cn } from "#/lib/utils"

function ZoomImage({ src, alt }: { src: string; alt: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [origin, setOrigin] = useState("50% 50%")
  const [zoomed, setZoomed] = useState(false)

  function handleMouseMove(e: React.MouseEvent) {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setOrigin(`${x}% ${y}%`)
  }

  return (
    <div
      ref={containerRef}
      className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setZoomed(true)}
      onMouseLeave={() => {
        setZoomed(false)
        setOrigin("50% 50%")
      }}
    >
      <img
        src={src}
        alt={alt}
        className={cn(
          "size-full object-cover transition-transform duration-200 ease-out",
          zoomed ? "scale-150" : "scale-100",
        )}
        style={{ transformOrigin: origin }}
      />
    </div>
  )
}

export function ProductImageGallery({
  imageUrl,
  additionalImages,
  name,
}: {
  imageUrl: string
  additionalImages: string[]
  name: string
}) {
  const images = [imageUrl, ...additionalImages]
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <div className="flex flex-col gap-4">
      <ZoomImage src={images[activeIndex]} alt={name} />
      <Carousel opts={{ align: "start" }} className="w-full">
        <CarouselContent>
          {images.map((img, i) => (
            <CarouselItem key={img + i} className="basis-1/3 sm:basis-1/4">
              <button
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-label={`Ver imagen ${i + 1} de ${name}`}
                aria-pressed={i === activeIndex}
                className={cn(
                  "relative aspect-square w-full overflow-hidden rounded-md border-2 bg-muted transition-colors",
                  i === activeIndex
                    ? "border-primary"
                    : "border-transparent hover:border-muted-foreground/40",
                )}
              >
                <img
                  src={img}
                  alt={`${name} - imagen ${i + 1}`}
                  className="size-full object-cover"
                  loading="lazy"
                />
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}
