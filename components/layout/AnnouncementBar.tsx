'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Truck, Sparkles, ShieldCheck, MapPin, Gift, MessageCircle, Star } from 'lucide-react'
import { DEFAULT_ANNOUNCEMENTS, ANNOUNCEMENT_INTERVAL_MS, type AnnouncementMessage } from '@/lib/constants'

const ICONS = {
  truck: Truck,
  sparkles: Sparkles,
  shield: ShieldCheck,
  mappin: MapPin,
  gift: Gift,
  whatsapp: MessageCircle,
  star: Star,
} as const

/**
 * Dynamic rotating announcement bar (replaces the old static WhatsApp line).
 *
 * - Messages come from Supabase (admin-managed) when present, else fall back to
 *   DEFAULT_ANNOUNCEMENTS in constants.
 * - Crossfades one message at a time on a fixed-height row → zero layout shift.
 * - Auto-rotation pauses when the tab is hidden and is fully disabled under
 *   prefers-reduced-motion (a single message is shown statically instead).
 * - A message with `href` becomes a link; otherwise it's plain text.
 */
export default function AnnouncementBar({
  messages,
  intervalMs = ANNOUNCEMENT_INTERVAL_MS,
}: {
  messages?: AnnouncementMessage[]
  intervalMs?: number
}) {
  const items = messages && messages.length > 0 ? messages : DEFAULT_ANNOUNCEMENTS
  const reduced = useReducedMotion()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (reduced || items.length <= 1) return
    let timer: ReturnType<typeof setInterval> | null = null
    const start = () => {
      if (timer) return
      timer = setInterval(() => setIndex((i) => (i + 1) % items.length), intervalMs)
    }
    const stop = () => {
      if (timer) { clearInterval(timer); timer = null }
    }
    const onVisibility = () => (document.hidden ? stop() : start())
    start()
    document.addEventListener('visibilitychange', onVisibility)
    return () => { stop(); document.removeEventListener('visibilitychange', onVisibility) }
  }, [items.length, intervalMs, reduced])

  const active = items[Math.min(index, items.length - 1)]

  return (
    <div
      className="bg-[var(--brand-darkpink)] text-white relative overflow-hidden"
      role="region"
      aria-label="Announcements"
    >
      {/* fixed-height row prevents any layout shift as messages swap */}
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-center px-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active.id}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: reduced ? 0 : 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center"
          >
            <MessageBody message={active} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function MessageBody({ message }: { message: AnnouncementMessage }) {
  const Icon = message.icon ? ICONS[message.icon] : null
  const inner = (
    <span className="flex items-center gap-2 text-[11px] sm:text-xs font-medium tracking-[0.14em] sm:tracking-[0.18em] uppercase">
      {Icon && <Icon size={13} className="shrink-0 text-[var(--brand-gold-light)]" aria-hidden />}
      <span className="truncate">{message.text}</span>
    </span>
  )
  if (message.href) {
    return (
      <Link href={message.href} className="transition-opacity hover:opacity-80">
        {inner}
      </Link>
    )
  }
  return inner
}
