'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getRecentlyViewed } from '@/lib/recentlyViewed'
import ProductRail from '@/components/home/ProductRail'
import type { ProductWithImages } from '@/types/database'

/** Reads recently-viewed slugs from localStorage and renders them as a rail.
 *  `excludeSlug` skips the product currently being viewed (on PDP). */
export default function RecentlyViewed({ excludeSlug, tone = 'cream' }: { excludeSlug?: string; tone?: 'cream' | 'white' }) {
  const [products, setProducts] = useState<ProductWithImages[]>([])

  useEffect(() => {
    const slugs = getRecentlyViewed().filter((s) => s !== excludeSlug)
    if (slugs.length === 0) return
    const supabase = createClient()
    supabase
      .from('products')
      .select('*, product_images(*), categories(*), collections(*)')
      .in('slug', slugs)
      .eq('is_active', true)
      .then(({ data }) => {
        const rows = (data as unknown as ProductWithImages[]) ?? []
        // preserve recency order
        const ordered = slugs.map((s) => rows.find((r) => r.slug === s)).filter(Boolean) as ProductWithImages[]
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProducts(ordered)
      })
  }, [excludeSlug])

  if (products.length === 0) return null

  return (
    <ProductRail
      products={products}
      eyebrow="Continue Browsing"
      title="Recently *Viewed*"
      tone={tone}
    />
  )
}
