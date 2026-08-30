import { useCallback, useEffect, useRef, useState } from "react"

export function useCountdown(defaultSeconds: number) {
  const [remaining, setRemaining] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const start = useCallback(
    (secondsOverride?: number) => {
      const total = secondsOverride ?? defaultSeconds
      clear()
      setRemaining(total)
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clear()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    },
    [clear, defaultSeconds],
  )

  useEffect(() => clear, [clear])

  return { remaining, isCoolingDown: remaining > 0, start }
}
