import { createClient } from '@/lib/supabase/server'
import type { ProductWithImages } from '@/types/database'

export type ProductSort = 'featured' | 'newest' | 'price-asc' | 'price-desc'

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
    if (cat) query = query.eq('category_id', (cat as { id: string }).id)
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
