import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string
  /**
   * Clase extra para el skeleton. En carruseles con autoplay pasar
   * "animate-none": el pulse infinito compite con el rAF de Embla
   * y suma micro-cortes mientras la imagen decodifica.
   */
  skeletonClassName?: string
}

export function Image({
  src,
  alt,
  className,
  containerClassName,
  skeletonClassName,
  decoding = "async",
  draggable = false,
  ...props
}: ImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <div
      className={cn("relative overflow-hidden bg-muted", containerClassName)}
    >
      {!isLoaded && (
        <Skeleton
          className={cn("absolute inset-0 h-full w-full", skeletonClassName)}
        />
      )}

      <img
        src={src}
        alt={alt}
        decoding={decoding}
        draggable={draggable}
        onLoad={() => setIsLoaded(true)}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          className,
        )}
        {...props}
      />
    </div>
  )
}
