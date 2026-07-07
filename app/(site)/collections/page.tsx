import type { Metadata } from 'next'
import { getCollections } from '@/lib/queries'
import CampaignRow from '@/components/collections/CampaignRow'
import SectionHeading from '@/components/common/SectionHeading'
import LuxButton from '@/components/ui/lux-button'
import PageNav from '@/components/common/PageNav'
import WhatsAppFloat from '@/components/common/WhatsAppFloat'

export const metadata: Metadata = {
  title: 'Collections',
  description: 'Explore our curated collections of premium sarees and ethnic wear at Geethams Silks.',
}

export const revalidate = 3600

export default async function CollectionsPage() {
  const collections = await getCollections()

  return (
    <div className="min-h-screen bg-[var(--brand-cream)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <PageNav fallback="/" backLabel="Home" crumbs={[{ label: 'Collections' }]} className="mb-10" />
        <SectionHeading
          eyebrow="Curated For You"
          title="The *Collections*"
          backdropWord="Maison"
          copy="Each collection is a campaign — a story told in silk, drape, and detail."
          className="mb-20 lg:mb-28"
        />

        {collections.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-serif text-3xl text-gray-300 mb-8">Collections coming soon</p>
            <LuxButton href="/shop" variant="outline-charcoal" arrow>
              Shop All Products
            </LuxButton>
          </div>
        ) : (
          <div className="space-y-24 lg:space-y-36">
            {collections.map((col, i) => (
              <CampaignRow key={col.id} collection={col} index={i} />
            ))}
          </div>
        )}
      </div>
      <WhatsAppFloat />
    </div>
  )
}
