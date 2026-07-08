import { useRef } from 'react'

/**
 * Lightweight swipe-to-close for slide-in panels. Uses touch events (not Framer
 * drag) so it never hijacks the panel's own vertical scrolling — it only fires
 * when the gesture is clearly along `axis` in the dismiss direction.
 *  - axis 'x' → close on a left swipe (left-edge drawers)
 *  - axis 'y' → close on a down swipe (bottom sheets)
 */
export function useSwipeClose(onClose: () => void, axis: 'x' | 'y' = 'x') {
  const start = useRef<{ x: number; y: number } | null>(null)
  return {
    onTouchStart: (e: React.TouchEvent) => {
      const t = e.touches[0]
      start.current = { x: t.clientX, y: t.clientY }
    },
    onTouchEnd: (e: React.TouchEvent) => {
      const s = start.current
      if (!s) return
      const t = e.changedTouches[0]
      const dx = t.clientX - s.x
      const dy = t.clientY - s.y
      if (axis === 'x') {
        if (dx < -55 && Math.abs(dx) > Math.abs(dy) + 12) onClose()
      } else {
        if (dy > 65 && Math.abs(dy) > Math.abs(dx) + 12) onClose()
      }
      start.current = null
    },
  }
}
