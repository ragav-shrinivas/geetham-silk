'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const LUXE = [0.16, 1, 0.3, 1] as const

interface CategoryCardProps {
  image: string
  title: string
  href: string
  index?: number
  /** base visual scale to normalise model presence (Sarees = 1.0 reference) */
  scale?: number
  priority?: boolean
}

const CARD_BG = [
  'linear-gradient(160deg, #342a2b 0%, #5a3a41 58%, #714a50 100%)',
  'linear-gradient(160deg, #2e2a28 0%, #4c3c3a 58%, #6c564a 100%)',
  'linear-gradient(160deg, #33272b 0%, #5a3b46 58%, #764a5a 100%)',
  'linear-gradient(160deg, #2f2b27 0%, #4a3b36 58%, #6f5642 100%)',
]

export default function CategoryCard({ image, title, href, index = 0, scale = 1, priority = false }: CategoryCardProps) {
  const [hovered, setHovered] = useState(false)

  // Subtle mouse-move parallax on the model.
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 110, damping: 18, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 110, damping: 18, mass: 0.4 })

  function handleMove(e: React.MouseEvent<HTMLElement>) {
    const r = e.currentTarget.getBoundingClientRect()
    x.set(((e.clientX - r.left) / r.width - 0.5) * 16)
    y.set(((e.clientY - r.top) / r.height - 0.5) * 12)
  }
  function onLeave() {
    setHovered(false)
    x.set(0)
    y.set(0)
  }

  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMove}
      onMouseLeave={onLeave}
      className="group relative block h-[460px] sm:h-[500px] lg:h-[540px] transition-[transform,box-shadow] duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:shadow-2xl hover:shadow-[var(--brand-rose)]/30"
    >
      {/* Clipped layers: background, spotlight, frame (stay within the card) */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0" style={{ background: CARD_BG[index % CARD_BG.length] }} />
        <div className="absolute left-1/2 top-[26%] -translate-x-1/2 w-[78%] h-[55%] rounded-full bg-[var(--brand-pink)]/25 blur-3xl transition-all duration-700 group-hover:bg-[var(--brand-pink)]/45 group-hover:scale-110" />
        <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
      </div>

      {/* Model layer — allowed to overflow (steps out of the frame on hover).
          originY:1 anchors scaling to the bottom so feet stay on the baseline. */}
      <motion.div
        className="absolute inset-x-0 bottom-0 top-8 will-change-transform"
        style={{ originX: 0.5, originY: 1 }}
        animate={{ scale: hovered ? scale * 1.12 : scale, y: hovered ? -10 : 0 }}
        transition={{ duration: 0.7, ease: LUXE }}
      >
        <motion.div style={{ x: sx, y: sy }} className="relative w-full h-full">
          <Image
            src={image}
            alt={title}
            fill
            priority={priority}
            sizes="(max-width: 640px) 80vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain object-bottom drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)]"
          />
        </motion.div>
      </motion.div>

      {/* Bottom gradient + title (above the model so text stays readable) */}
      <div className="absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-t from-black/85 via-black/25 to-transparent transition-all duration-500 group-hover:from-black/90 pointer-events-none" />

      <div className="absolute bottom-0 left-0 right-0 p-7 lg:p-8 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-2 pointer-events-none">
        <h3 className="font-serif text-3xl lg:text-[2.5rem] font-light text-white leading-none tracking-wide">
          {title}
        </h3>
        <span className="mt-3 inline-flex items-center gap-2 text-[11px] tracking-[0.28em] uppercase text-[var(--brand-pink)] opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
          Explore Collection
          <ArrowRight size={13} />
        </span>
      </div>

      {/* Gold accent line */}
      <span className="absolute bottom-0 left-0 h-[3px] w-0 bg-[var(--brand-gold)] group-hover:w-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
    </Link>
  )
}
