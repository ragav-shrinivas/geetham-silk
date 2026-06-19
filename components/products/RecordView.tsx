'use client'
import { useEffect } from 'react'
import { recordView } from '@/lib/recentlyViewed'

/** Records the current product as recently viewed (client-only, fire once). */
export default function RecordView({ slug }: { slug: string }) {
  useEffect(() => { recordView(slug) }, [slug])
  return null
}
