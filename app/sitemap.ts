import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SITE } from '@/lib/constants'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const { data: productsRaw } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('is_active', true)
  const products = (productsRaw ?? []) as Array<{ slug: string; updated_at: string }>

  const { data: collectionsRaw } = await supabase
    .from('collections')
    .select('slug, updated_at')
    .eq('is_active', true)
  const collections = (collectionsRaw ?? []) as Array<{ slug: string; updated_at: string }>

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE.url, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE.url}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE.url}/collections`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE.url}/gallery`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE.url}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE.url}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE.url}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE.url}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE.url}/refund-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  const productPages: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${SITE.url}/products/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const collectionPages: MetadataRoute.Sitemap = (collections ?? []).map((c) => ({
    url: `${SITE.url}/shop?collection=${c.slug}`,
    lastModified: new Date(c.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...productPages, ...collectionPages]
}
