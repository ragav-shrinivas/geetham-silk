import type { CSSProperties } from 'react'

/** Four-point sparkle / twinkle — taken from the logo's accent star. */
export function Sparkle({ size = 24, className, style }: { size?: number; className?: string; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
      <path d="M12 0 C12.6 7 17 11.4 24 12 C17 12.6 12.6 17 12 24 C11.4 17 7 12.6 0 12 C7 11.4 11.4 7 12 0 Z" fill="currentColor" />
    </svg>
  )
}

/** Paisley / mango teardrop — a core motif of the logo. */
export function Paisley({ size = 28, className, style }: { size?: number; className?: string; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 32" className={className} style={style} fill="none" aria-hidden="true">
      <path d="M12 1 C19 4 23 11 21 19 C19.5 25 14 30 8 29 C3 28 1 23 3 19 C5 15 11 16 12 20"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="9.5" cy="22" r="1.4" fill="currentColor" />
    </svg>
  )
}

/**
 * Kolam dotted ring — concentric circle of dots with outward teardrops,
 * echoing the dotted arc that frames the peacock in the logo.
 */
export function KolamRing({
  size = 420,
  dots = 56,
  className,
  withTeardrops = true,
}: {
  size?: number
  dots?: number
  className?: string
  withTeardrops?: boolean
}) {
  const c = size / 2
  const rDots = c - size * 0.02
  const rTear = rDots - size * 0.07
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className} fill="none" aria-hidden="true">
      {Array.from({ length: dots }).map((_, i) => {
        const a = (i / dots) * Math.PI * 2
        const cx = c + rDots * Math.cos(a)
        const cy = c + rDots * Math.sin(a)
        return <circle key={`d${i}`} cx={cx} cy={cy} r={i % 4 === 0 ? size * 0.0065 : size * 0.0032} fill="currentColor" />
      })}
      {withTeardrops &&
        Array.from({ length: dots / 2 }).map((_, i) => {
          const a = (i / (dots / 2)) * Math.PI * 2
          const cx = c + rTear * Math.cos(a)
          const cy = c + rTear * Math.sin(a)
          const deg = (a * 180) / Math.PI + 90
          const s = size * 0.018
          return (
            <path
              key={`t${i}`}
              d={`M0 ${-s} C ${s * 0.7} ${-s * 0.2}, ${s * 0.7} ${s * 0.6}, 0 ${s} C ${-s * 0.7} ${s * 0.6}, ${-s * 0.7} ${-s * 0.2}, 0 ${-s} Z`}
              transform={`translate(${cx} ${cy}) rotate(${deg})`}
              fill="currentColor"
              opacity="0.55"
            />
          )
        })}
    </svg>
  )
}
