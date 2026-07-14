import * as React from "react"
import { cn } from "@/lib/utils"

interface FilterSectionProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function FilterSection({
  title,
  children,
  className,
}: FilterSectionProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-sm font-semibold uppercase tracking-wide text-foreground">
        {title}
      </h4>
      {children}
    </div>
  )
}
