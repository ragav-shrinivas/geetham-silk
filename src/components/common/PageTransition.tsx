'use client'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useLenis } from 'lenis/react'
import { LUXE } from '@/lib/motion'

/**
 * Route transition: on every pathname change the incoming page rises in
 * under a cream veil that wipes upward. Entry-only by design — App Router
 * unmounts the old page immediately, so exit choreography would require
 * freezing the router; the veil covers the swap instead.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const reduced = useReducedMotion()
  const lenis = useLenis()
  const firstRender = useRef(true)

  // keep Lenis's position in sync on navigation: honor #anchors (after the
  // entrance settles), otherwise jump to top
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const hash = window.location.hash
    if (hash) {
      const t = setTimeout(() => lenis?.scrollTo(hash, { offset: -110 }), 450)
      return () => clearTimeout(t)
    }
    lenis?.scrollTo(0, { immediate: true, force: true })
  }, [pathname, lenis])

  if (reduced) return <>{children}</>

  return (
    <div key={pathname} className="relative">
      {/* veil wipes up and away */}
      <motion.div
        aria-hidden
        className="page-veil"
        initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
        animate={{ clipPath: 'inset(0% 0% 100% 0%)' }}
        transition={{ duration: 0.85, ease: LUXE, delay: 0.05 }}
        style={{ willChange: 'clip-path' }}
      />
      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: LUXE, delay: 0.15 }}
      >
        {children}
      </motion.div>
    </div>
  )
}
