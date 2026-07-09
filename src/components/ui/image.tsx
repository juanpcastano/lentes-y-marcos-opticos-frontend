import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string
}

export function Image({
  src,
  alt,
  className,
  containerClassName,
  ...props
}: ImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <div
      className={cn("relative overflow-hidden bg-muted", containerClassName)}
    >
      {!isLoaded && <Skeleton className="absolute inset-0 h-full w-full" />}

      <img
        src={src}
        alt={alt}
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
