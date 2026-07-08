'use client'
import type { ReactNode } from 'react'
import { ReactLenis, useLenis } from 'lenis/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Keeps ScrollTrigger in sync with Lenis. useLenis subscribes as soon as the
 * instance exists, so the binding can't miss on mount timing.
 */
function ScrollTriggerSync() {
  useLenis(ScrollTrigger.update)
  return null
}

/**
 * Lenis smooth scroll on its own internal RAF — wheel/trackpad input always
 * animates, independent of any external ticker wiring.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        // snappier, lighter smoothing (was heavier lerp+duration which felt laggy);
        // touch stays native (no syncTouch) so mobile scrolling is fully responsive
        lerp: 0.13,
        smoothWheel: true,
        wheelMultiplier: 1,
      }}
    >
      <ScrollTriggerSync />
      {children}
    </ReactLenis>
  )
}
