import { Suspense } from 'react'
import HeroSection from '@/components/home/HeroSection'
import BrandMarquee from '@/components/home/BrandMarquee'
import FeaturedCategories from '@/components/home/FeaturedCategories'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import SilkFilm from '@/components/home/SilkFilm'
import NewArrivals from '@/components/home/NewArrivals'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import AboutStrip from '@/components/home/AboutStrip'
import WhatsAppFloat from '@/components/common/WhatsAppFloat'
import { getProducts, getTestimonials, getPageSections } from '@/lib/queries'
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
  { section_key: 'marquee', is_visible: true, settings: {} },
  { section_key: 'categories', is_visible: true, settings: {} },
  { section_key: 'featured', is_visible: true, settings: { limit: 8 } },
  { section_key: 'film', is_visible: true, settings: { src: '/heroimage1.jpeg' } },
  { section_key: 'story', is_visible: true, settings: {} },
  { section_key: 'arrivals', is_visible: true, settings: { limit: 8 } },
  { section_key: 'testimonials', is_visible: true, settings: {} },
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

  const [featuredProducts, newArrivals, testimonials] = await Promise.all([
    getProducts({ featured: true, limit: setting(featuredSettings, 'limit', 8) }),
    getProducts({ newArrival: true, limit: setting(arrivalsSettings, 'limit', 8) }),
    getTestimonials(),
  ])

  return (
    <>
      {sections.map((section) => {
        const s = section.settings
        switch (section.section_key) {
          case 'hero':
            return <HeroSection key="hero" durationMs={setting(s, 'duration_ms', 7000)} />
          case 'marquee':
            return <BrandMarquee key="marquee" items={setting<string[] | undefined>(s, 'items', undefined)} />
          case 'categories':
            return <FeaturedCategories key="categories" />
          case 'featured':
            return <FeaturedProducts key="featured" products={featuredProducts} />
          case 'film':
            return (
              <SilkFilm
                key="film"
                src={setting(s, 'src', '/heroimage1.jpeg')}
                heading={setting(s, 'heading', 'Six yards of poetry')}
                caption={setting(s, 'caption', 'Every drape tells a story')}
              />
            )
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
          default:
            return null
        }
      })}
      <WhatsAppFloat />
    </>
  )
}
