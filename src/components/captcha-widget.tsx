import { useEffect, useRef } from "react"

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined

export const CAPTCHA_ENABLED = Boolean(SITE_KEY)

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          "expired-callback"?: () => void
          theme?: "light" | "dark" | "auto"
        },
      ) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
  }
}

let scriptPromise: Promise<void> | null = null

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve()
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("No se pudo cargar el captcha"))
    document.head.appendChild(script)
  })
  return scriptPromise
}

interface CaptchaWidgetProps {
  onToken: (token: string) => void
  resetSignal: number
}

/**
 * Widget de Cloudflare Turnstile. Si no hay `VITE_TURNSTILE_SITE_KEY`, no
 * renderiza nada y el backend usa el modo de desarrollo sin captcha.
 */
export function CaptchaWidget({ onToken, resetSignal }: CaptchaWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!SITE_KEY) return
    let cancelled = false

    loadScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return
        if (widgetIdRef.current) {
          window.turnstile.remove(widgetIdRef.current)
        }
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          callback: onToken,
          "expired-callback": () => onToken(""),
          theme: "auto",
        })
      })
      .catch(() => onToken(""))

    return () => {
      cancelled = true
    }
  }, [onToken])

  useEffect(() => {
    if (
      !SITE_KEY ||
      resetSignal === 0 ||
      !widgetIdRef.current ||
      !window.turnstile
    ) {
      return
    }
    window.turnstile.reset(widgetIdRef.current)
  }, [resetSignal])

  if (!SITE_KEY) return null

  return <div ref={containerRef} className="flex justify-center" />
}
