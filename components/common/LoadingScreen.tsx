'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Wordmark from '@/components/common/Wordmark'

const LUXE = [0.16, 1, 0.3, 1] as const

export default function LoadingScreen() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem('gs_intro_seen')) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false)
      return
    }
    const t = setTimeout(() => {
      setLoading(false)
      sessionStorage.setItem('gs_intro_seen', '1')
    }, 3400)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    document.body.style.overflow = loading ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [loading])

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1, ease: LUXE } }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 42%, #fffefc 0%, transparent 70%),' +
              'linear-gradient(180deg, #fdfaf5 0%, #f8efe4 100%)',
          }}
        >
          {/* 3 · Rose-gold glow blooming behind the peacock */}
          <motion.div
            className="absolute rounded-full bg-[var(--brand-pink)]/25 blur-3xl"
            initial={{ width: 120, height: 120, opacity: 0 }}
            animate={{ width: [120, 460, 420], height: [120, 460, 420], opacity: [0, 0.75, 0.5] }}
            transition={{ duration: 2.8, ease: LUXE, times: [0, 0.55, 1] }}
          />
          <motion.div
            className="absolute rounded-full bg-[var(--brand-gold)]/15 blur-2xl"
            initial={{ width: 80, height: 80, opacity: 0 }}
            animate={{ width: 300, height: 300, opacity: 0.5 }}
            transition={{ duration: 2.4, delay: 0.3, ease: LUXE }}
          />

          {/* Brand name reveals elegantly */}
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.4, delay: 0.4, ease: LUXE }}
            className="relative z-10 text-center"
          >
            <Wordmark size="xl" shine tagline />
          </motion.div>

          {/* shimmer progress */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.8 }}
            className="absolute bottom-[14%] h-px w-44 bg-[var(--brand-gold)]/20 overflow-hidden"
          >
            <motion.div
              className="h-full w-1/2 bg-gradient-to-r from-transparent via-[var(--brand-rose)] to-transparent"
              animate={{ x: ['-100%', '300%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
