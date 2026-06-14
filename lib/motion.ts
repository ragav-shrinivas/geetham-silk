/**
 * Shared motion language for the whole site.
 * One easing, consistent durations — choreography, not decoration.
 */

/** Apple-style confident ease — used for nearly every entrance/transition. */
export const LUXE = [0.16, 1, 0.3, 1] as const

/** CSS string form of the same ease, for Tailwind arbitrary values / GSAP. */
export const LUXE_CSS = 'cubic-bezier(0.16, 1, 0.3, 1)'

/** GSAP equivalent ease name (power3.out is the closest stock curve). */
export const LUXE_GSAP = 'power3.out'

export const DUR = {
  fast: 0.45,
  base: 0.8,
  slow: 1.2,
  cinematic: 1.6,
} as const
