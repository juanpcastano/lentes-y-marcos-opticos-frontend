import { cn } from "#/lib/utils"

interface WelcomeOverlayProps {
  open: boolean
  title?: string
  subtitle?: string
  className?: string
}

/**
 * Feedback breve y animado entre autenticarse y navegar al destino. Evita el
 * salto seco de la redirección y confirma que la sesión quedó lista.
 */
export function WelcomeOverlay({
  open,
  title = "¡Bienvenido!",
  subtitle = "Estamos preparando tu cuenta…",
  className,
}: WelcomeOverlayProps) {
  if (!open) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-background/85 p-6 backdrop-blur-md animate-in fade-in duration-300 motion-reduce:animate-none",
        className,
      )}
    >
      <div className="flex max-w-sm flex-col items-center text-center">
        <div className="relative mb-6 flex size-24 items-center justify-center">
          <span className="absolute size-24 rounded-full border border-primary/40 animate-[welcome-ring_1.3s_ease-out_infinite] motion-reduce:animate-none" />
          <span className="absolute size-24 rounded-full border border-primary/30 animate-[welcome-ring_1.3s_ease-out_0.45s_infinite] motion-reduce:animate-none" />
          <span className="absolute -top-1 -right-2 size-2 rounded-full bg-primary animate-[welcome-sparkle_1.4s_ease-in-out_infinite] motion-reduce:animate-none" />
          <span className="absolute top-3 -left-4 size-1.5 rounded-full bg-primary/70 animate-[welcome-sparkle_1.4s_ease-in-out_0.35s_infinite] motion-reduce:animate-none" />
          <span className="absolute -bottom-1 left-2 size-1.5 rounded-full bg-primary/60 animate-[welcome-sparkle_1.4s_ease-in-out_0.7s_infinite] motion-reduce:animate-none" />
          <div className="relative flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 animate-[welcome-pop_0.55s_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none">
            <svg
              viewBox="0 0 24 24"
              className="size-10"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path
                d="M4 12.5 9.5 18 20 6.5"
                strokeDasharray="48"
                strokeDashoffset="48"
                className="animate-[welcome-check_0.45s_ease-out_0.2s_forwards] motion-reduce:animate-none"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-semibold tracking-tight animate-[welcome-rise_0.5s_ease-out_0.15s_both] motion-reduce:animate-none">
          {title}
        </h2>
        <p className="mt-2 text-balance text-muted-foreground animate-[welcome-rise_0.5s_ease-out_0.25s_both] motion-reduce:animate-none">
          {subtitle}
        </p>
      </div>
    </div>
  )
}
