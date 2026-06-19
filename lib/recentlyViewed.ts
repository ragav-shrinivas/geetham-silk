'use client'

const KEY = 'gs_recently_viewed'
const MAX = 12

/** Record a product slug as recently viewed (most-recent first, de-duped). */
export function recordView(slug: string) {
  if (typeof window === 'undefined') return
  try {
    const list: string[] = JSON.parse(localStorage.getItem(KEY) || '[]')
    const next = [slug, ...list.filter((s) => s !== slug)].slice(0, MAX)
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch { /* ignore */ }
}

export function getRecentlyViewed(): string[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}
