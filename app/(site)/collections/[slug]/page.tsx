import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getCollectionBySlug, getProducts } from '@/lib/queries'
import CollectionHero from '@/components/collections/CollectionHero'
import ProductCard from '@/components/products/ProductCard'
import Reveal, { RevealGroup, RevealItem } from '@/components/common/Reveal'
import LuxButton from '@/components/ui/lux-button'
import PageNav from '@/components/common/PageNav'
import WhatsAppFloat from '@/components/common/WhatsAppFloat'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const collection = await getCollectionBySlug(slug)
  if (!collection) return {}
  return {
    title: `${collection.name} Collection`,
    description: collection.description ?? `Explore the ${collection.name} collection at Geethams Silks, Chennai.`,
    alternates: { canonical: `/collections/${slug}` },
  }
}

export const revalidate = 3600

export default async function CollectionCampaignPage({ params }: Props) {
  const { slug } = await params
  const collection = await getCollectionBySlug(slug)
  if (!collection) notFound()

  const products = await getProducts({ collectionSlug: slug })

  return (
    <div className="min-h-screen bg-[var(--brand-cream)] relative">
      {/* Back + breadcrumbs — overlay on the dark hero, below the fixed navbar */}
      <div className="absolute top-[92px] sm:top-28 left-0 right-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PageNav
            variant="overlay"
            fallback="/collections"
            backLabel="Collections"
            crumbs={[{ label: 'Collections', href: '/collections' }, { label: collection.name }]}
            className="w-fit"
          />
        </div>
      </div>
      <CollectionHero collection={collection} productCount={products.length} />

      {/* Collection story */}
      {collection.description && (
        <section className="py-20 lg:py-28 bg-[var(--brand-sandal-light)] relative overflow-hidden">
          <span aria-hidden className="backdrop-word top-8">{collection.name.split(' ')[0]}</span>
          <Reveal direction="up" className="relative max-w-3xl mx-auto px-6 text-center">
            <p className="text-xs tracking-[0.35em] uppercase text-[var(--brand-rose)] mb-6">The Story</p>
            <p className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light leading-[1.4] text-[var(--brand-charcoal)]">
              {collection.description}
            </p>
            <div className="hairline w-24 mx-auto mt-10" />
          </Reveal>
        </section>
      )}

      {/* Pieces */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-serif text-3xl text-[var(--brand-charcoal)]/70 mb-8">Pieces arriving soon</p>
              <LuxButton href="/shop" variant="outline-charcoal" arrow>
                Browse All Products
              </LuxButton>
            </div>
          ) : (
            <>
              <Reveal direction="up" className="flex items-end justify-between mb-12">
                <h2 className="font-serif text-3xl lg:text-5xl font-light text-[var(--brand-charcoal)]">
                  The <em className="italic text-[var(--brand-rose)]">Pieces</em>
                </h2>
                <p className="text-xs tracking-[0.25em] uppercase text-[var(--brand-charcoal)]/75">
                  {products.length} — {products.length === 1 ? 'Piece' : 'Pieces'}
                </p>
              </Reveal>
              <RevealGroup stagger={0.08} className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {products.map((product) => (
                  <RevealItem key={product.id} direction="up" distance={44}>
                    <ProductCard product={product} animate={false} />
                  </RevealItem>
                ))}
              </RevealGroup>
            </>
          )}
        </div>
      </section>
      <WhatsAppFloat />
    </div>
  )
}
