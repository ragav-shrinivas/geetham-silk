import { Suspense } from 'react'
import HeroSection from '@/components/home/HeroSection'
import BrandMarquee from '@/components/home/BrandMarquee'
import FeaturedCategories from '@/components/home/FeaturedCategories'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import BestSellers from '@/components/home/BestSellers'
import ProductDiscovery from '@/components/home/ProductDiscovery'
import PromoBanners from '@/components/home/PromoBanners'
import ProductRail from '@/components/home/ProductRail'
import RecentlyViewed from '@/components/home/RecentlyViewed'
import StoreLocation from '@/components/home/StoreLocation'
import TrustStrip from '@/components/home/TrustStrip'
import NewArrivals from '@/components/home/NewArrivals'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import AboutStrip from '@/components/home/AboutStrip'
import WhatsAppFloat from '@/components/common/WhatsAppFloat'
import { getProducts, getTestimonials, getPageSections, getCategoriesWithCount, getDiscoveryProducts, getActiveBanners } from '@/lib/queries'
import type { Metadata } from 'next'
import type { Json, PageSection } from '@/types/database'
import { SITE } from '@/lib/constants'

export const metadata: Metadata = {
  title: `${SITE.name} — Premium Sarees & Ethnic Wear Chennai`,
  alternates: { canonical: '/' },
}

// short ISR so admin-managed sections, hero slides & content appear quickly
export const revalidate = 60

/** Default registry — used when the page_sections table is empty/unreachable. */
const DEFAULT_SECTIONS: Array<Pick<PageSection, 'section_key' | 'is_visible' | 'settings'>> = [
  { section_key: 'hero', is_visible: true, settings: { duration_ms: 7000 } },
  { section_key: 'store', is_visible: true, settings: {} },
  { section_key: 'trust', is_visible: true, settings: {} },
  { section_key: 'marquee', is_visible: true, settings: {} },
  { section_key: 'categories', is_visible: true, settings: {} },
  { section_key: 'featured', is_visible: true, settings: { limit: 8 } },
  { section_key: 'bestsellers', is_visible: true, settings: { limit: 12 } },
  { section_key: 'story', is_visible: true, settings: {} },
  { section_key: 'banners', is_visible: true, settings: {} },
  { section_key: 'arrivals', is_visible: true, settings: { limit: 8 } },
  { section_key: 'trending', is_visible: true, settings: { limit: 8 } },
  { section_key: 'testimonials', is_visible: true, settings: {} },
  { section_key: 'discovery', is_visible: true, settings: {} },
  { section_key: 'recently', is_visible: true, settings: {} },
]

function setting<T>(settings: Json, key: string, fallback: T): T {
  if (settings && typeof settings === 'object' && !Array.isArray(settings) && key in settings) {
    return (settings as Record<string, unknown>)[key] as T
  }
  return fallback
}

export default async function HomePage() {
  const rows = await getPageSections('home')
  const sections = (rows.length > 0 ? rows : DEFAULT_SECTIONS).filter((s) => s.is_visible)

  const featuredSettings = sections.find((s) => s.section_key === 'featured')?.settings ?? {}
  const arrivalsSettings = sections.find((s) => s.section_key === 'arrivals')?.settings ?? {}
  const bestSettings = sections.find((s) => s.section_key === 'bestsellers')?.settings ?? {}

  const trendingSettings = sections.find((s) => s.section_key === 'trending')?.settings ?? {}

  const [featuredProducts, newArrivals, bestSellers, testimonials, categories, discoveryProducts, trendingProducts, banners] = await Promise.all([
    getProducts({ featured: true, limit: setting(featuredSettings, 'limit', 8) }),
    getProducts({ newArrival: true, limit: setting(arrivalsSettings, 'limit', 8) }),
    getProducts({ bestSeller: true, limit: setting(bestSettings, 'limit', 12) }),
    getTestimonials(),
    getCategoriesWithCount(),
    getDiscoveryProducts(24),
    getProducts({ trending: true, limit: setting(trendingSettings, 'limit', 8) }),
    getActiveBanners(),
  ])

  return (
    // pt-24 offsets the fixed, always-solid header (announcement + nav ≈ 92px) so the
    // hero begins cleanly below the navigation — same offset the rest of the app uses.
    <div className="pt-24 bg-[var(--brand-cream)]">
      {sections.map((section) => {
        const s = section.settings
        switch (section.section_key) {
          case 'hero':
            return <HeroSection key="hero" durationMs={setting(s, 'duration_ms', 7000)} />
          case 'marquee':
            return <BrandMarquee key="marquee" items={setting<string[] | undefined>(s, 'items', undefined)} />
          case 'categories':
            return <FeaturedCategories key="categories" categories={categories} />
          case 'featured':
            return <FeaturedProducts key="featured" products={featuredProducts} />
          case 'bestsellers':
            return <BestSellers key="bestsellers" products={bestSellers} />
          // legacy alias — any old 'film' rows render as best sellers now
          case 'film':
            return <BestSellers key="film" products={bestSellers} />
          case 'story':
            return <AboutStrip key="story" />
          case 'arrivals':
            return <NewArrivals key="arrivals" products={newArrivals} />
          case 'testimonials':
            return (
              <Suspense key="testimonials">
                <TestimonialsSection testimonials={testimonials} />
              </Suspense>
            )
          case 'discovery':
            return <ProductDiscovery key="discovery" products={discoveryProducts} />
          case 'banners':
            return <PromoBanners key="banners" banners={banners} />
          case 'trending':
            return <ProductRail key="trending" products={trendingProducts} eyebrow="In Demand" title="Trending *Now*" backdropWord="Trending" viewAllHref="/shop?trending=true" tone="cream" />
          case 'recently':
            return <RecentlyViewed key="recently" tone="cream" />
          case 'store':
            return <StoreLocation key="store" />
          case 'trust':
            return <TrustStrip key="trust" />
          default:
            return null
        }
      })}
      <WhatsAppFloat />
    </div>
  )
}
