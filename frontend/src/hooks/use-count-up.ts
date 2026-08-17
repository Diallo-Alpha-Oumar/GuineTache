import { useEffect, useRef, useState } from 'react'

const EASE_OUT_CUBIC = (t: number) => 1 - (1 - t) ** 3

export function useCountUp(target: number, duration = 700) {
  const [value, setValue] = useState(0)
  const frame = useRef<number | null>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion || !Number.isFinite(target)) {
      setValue(target)
      return
    }

    const start = performance.now()
    const from = 0

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      setValue(Math.round(from + (target - from) * EASE_OUT_CUBIC(progress)))
      if (progress < 1) {
        frame.current = requestAnimationFrame(tick)
      }
    }

    frame.current = requestAnimationFrame(tick)
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [target, duration])

  return value
}
