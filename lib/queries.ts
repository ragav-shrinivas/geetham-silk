import { createClient } from '@/lib/supabase/server'
import { createClient as createAnonClient } from '@supabase/supabase-js'
import { unstable_cache } from 'next/cache'
import type { ProductWithImages } from '@/types/database'
import type { AnnouncementMessage } from '@/lib/constants'

/**
 * Active announcement-bar messages, ordered.
 *
 * Runs site-wide (rendered in the root layout), so it's a CACHED, cookieless
 * public read — one shared fetch per 5-min window instead of a Supabase round
 * trip on every request. Admin writes can `revalidateTag('announcements')`.
 *
 * Returns [] if the `announcements` table doesn't exist yet or on any error —
 * the bar then falls back to DEFAULT_ANNOUNCEMENTS, so this is safe to ship
 * before the migration lands.
 */
export const getAnnouncements = unstable_cache(
  async (): Promise<AnnouncementMessage[]> => {
    try {
      const sb = createAnonClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data, error } = await sb
        .from('announcements')
        .select('id, text, icon, href')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
      if (error || !data) return []
      return data as AnnouncementMessage[]
    } catch {
      return []
    }
  },
  ['announcements'],
  { revalidate: 300, tags: ['announcements'] }
)

export type ProductSort = 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'bestselling'

export async function getProducts(opts?: {
  categorySlug?: string
  collectionSlug?: string
  featured?: boolean
  trending?: boolean
  newArrival?: boolean
  bestSeller?: boolean
  search?: string
  sort?: ProductSort
  limit?: number
  offset?: number
}) {
  const supabase = await createClient()
  let query = supabase
    .from('products')
    .select(`
      *,
      product_images(*),
      categories(*),
      collections(*)
    `)
    .eq('is_active', true)

  // best sellers follow the admin-controlled order unless an explicit sort is set
  if (opts?.bestSeller && !opts?.sort) {
    query = query.order('best_seller_order', { ascending: true }).order('created_at', { ascending: false })
  } else {
    switch (opts?.sort) {
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'price-asc':
        query = query.order('price', { ascending: true })
        break
      case 'price-desc':
        query = query.order('price', { ascending: false })
        break
      case 'bestselling':
        query = query.order('is_best_seller', { ascending: false }).order('best_seller_order', { ascending: true })
        break
      case 'featured':
        query = query.order('is_featured', { ascending: false }).order('display_order', { ascending: true })
        break
      default:
        query = query.order('display_order', { ascending: true }).order('created_at', { ascending: false })
    }
  }

  if (opts?.featured) query = query.eq('is_featured', true)
  if (opts?.trending) query = query.eq('is_trending', true)
  if (opts?.newArrival) query = query.eq('is_new_arrival', true)
  if (opts?.bestSeller) query = query.eq('is_best_seller', true)
  if (opts?.search) query = query.ilike('name', `%${opts.search}%`)
  if (opts?.categorySlug) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', opts.categorySlug)
      .single()
    if (cat) {
      const catId = (cat as { id: string }).id
      // include any child subcategories so a parent shows everything beneath it
      const { data: children } = await supabase
        .from('categories')
        .select('id')
        .eq('parent_id', catId)
      const ids = [catId, ...((children ?? []) as { id: string }[]).map((c) => c.id)]
      query = query.in('category_id', ids)
    }
  }
  if (opts?.collectionSlug) {
    const { data: col } = await supabase
      .from('collections')
      .select('id')
      .eq('slug', opts.collectionSlug)
      .single()
    if (col) query = query.eq('collection_id', (col as { id: string }).id)
  }
  if (opts?.limit) query = query.limit(opts.limit)
  if (opts?.offset) query = query.range(opts.offset, opts.offset + (opts.limit ?? 20) - 1)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as ProductWithImages[]
}

export async function getProductRating(productId: string): Promise<{ avg: number; count: number }> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('product_reviews')
    .select('rating')
    .eq('product_id', productId)
    .eq('is_approved', true)
  const rows = (data ?? []) as { rating: number }[]
  if (rows.length === 0) return { avg: 0, count: 0 }
  const avg = rows.reduce((s, r) => s + r.rating, 0) / rows.length
  return { avg: Math.round(avg * 10) / 10, count: rows.length }
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select(`*, product_images(*), categories(*), collections(*)`)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  if (error) return null
  return data as ProductWithImages
}

export async function getCategories(): Promise<import('@/types/database').Category[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order')
  return (data ?? []) as import('@/types/database').Category[]
}

export async function getDiscoveryProducts(limit = 24): Promise<ProductWithImages[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, product_images(*), categories(*), collections(*)')
    .eq('is_active', true)
    .eq('show_in_discovery', true)
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data ?? []) as ProductWithImages[]
}

export interface Banner {
  id: string; title: string | null; subtitle: string | null; image_url: string
  link_url: string | null; cta_label: string | null; display_order: number
  is_active: boolean; starts_at: string | null; ends_at: string | null
}

/** Active banners within their scheduled window, ordered for display. */
export async function getActiveBanners(): Promise<Banner[]> {
  const supabase = await createClient()
  const nowIso = new Date().toISOString()
  const { data } = await supabase
    .from('banners')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
  const rows = (data ?? []) as Banner[]
  return rows.filter((b) =>
    (!b.starts_at || b.starts_at <= nowIso) && (!b.ends_at || b.ends_at >= nowIso)
  )
}

export type CategoryNode = import('@/types/database').Category & { children: import('@/types/database').Category[] }

/** Parent categories, each with their active subcategories nested under `children`. */
export async function getCategoryTree(): Promise<CategoryNode[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order')
  const all = (data ?? []) as import('@/types/database').Category[]
  const parents = all.filter((c) => !c.parent_id)
  return parents.map((p) => ({ ...p, children: all.filter((c) => c.parent_id === p.id) }))
}

export async function getCategoriesWithCount(): Promise<Array<import('@/types/database').Category & { product_count: number }>> {
  const supabase = await createClient()
  const [{ data: cats }, { data: productRows }] = await Promise.all([
    supabase.from('categories').select('*').eq('is_active', true).order('display_order'),
    supabase.from('products').select('category_id').eq('is_active', true),
  ])
  const rows = (productRows ?? []) as Array<{ category_id: string | null }>
  const catList = (cats ?? []) as Array<import('@/types/database').Category>
  // map each child category to its parent so a parent's count rolls up its subcategories
  const parentOf: Record<string, string> = {}
  for (const c of catList) if (c.parent_id) parentOf[c.id] = c.parent_id

  const countMap: Record<string, number> = {}
  for (const p of rows) {
    if (!p.category_id) continue
    const target = parentOf[p.category_id] ?? p.category_id
    countMap[target] = (countMap[target] ?? 0) + 1
  }
  // Homepage cards show only top-level categories
  return catList
    .filter((c) => !c.parent_id)
    .map((c) => ({ ...c, product_count: countMap[c.id] ?? 0 }))
}

export async function getCollections(): Promise<import('@/types/database').Collection[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('collections')
    .select('*')
    .eq('is_active', true)
    .order('display_order')
  return (data ?? []) as import('@/types/database').Collection[]
}

export async function getCollectionBySlug(slug: string): Promise<import('@/types/database').Collection | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  if (error) return null
  return data as import('@/types/database').Collection
}

export async function getTestimonials(): Promise<import('@/types/database').Testimonial[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('testimonials')
    .select('*')
    .eq('is_active', true)
    .order('display_order')
  return (data ?? []) as import('@/types/database').Testimonial[]
}

export async function getGallery(): Promise<import('@/types/database').Gallery[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('gallery')
    .select('*')
    .eq('is_active', true)
    .order('display_order')
  return (data ?? []) as import('@/types/database').Gallery[]
}

export async function getHomepageContent() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('homepage_content')
    .select('*')
    .eq('is_active', true)
  const rows = (data ?? []) as Array<{ section: string; content: unknown }>
  const map: Record<string, unknown> = {}
  for (const row of rows) map[row.section] = row.content
  return map
}

export async function getHeroSlides(): Promise<import('@/types/database').HeroSlide[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('hero_slides')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
  return (data ?? []) as import('@/types/database').HeroSlide[]
}

export async function getPageSections(page: string): Promise<import('@/types/database').PageSection[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('page_sections')
    .select('*')
    .eq('page', page)
    .order('display_order', { ascending: true })
  return (data ?? []) as import('@/types/database').PageSection[]
}

export async function getSiteSettings() {
  const supabase = await createClient()
  const { data } = await supabase.from('settings').select('*')
  const rows = (data ?? []) as Array<{ key: string; value: unknown }>
  const map: Record<string, unknown> = {}
  for (const row of rows) map[row.key] = row.value
  return map
}
