import { useEffect, useRef, useState } from 'react'

// Scales fixed-size content (the 390x780 phone frame) to fill whatever
// space its container actually has, instead of rendering at a hardcoded
// size and leaving the container's leftover height as dead space below it.
// Re-measures on resize via ResizeObserver so it keeps fitting as the
// window (or the sidebar next to it) changes size.
export function useFitScale(contentWidth: number, contentHeight: number, padding = 24, maxScale = 1.5) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    function compute() {
      if (!el) return
      const w = el.clientWidth - padding * 2
      const h = el.clientHeight - padding * 2
      const next = Math.min(w / contentWidth, h / contentHeight, maxScale)
      setScale(Math.max(next, 0.4))
    }
    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    return () => ro.disconnect()
  }, [contentWidth, contentHeight, padding, maxScale])

  return { containerRef, scale }
}
