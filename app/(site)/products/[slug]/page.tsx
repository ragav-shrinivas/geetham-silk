import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProductBySlug, getProducts } from '@/lib/queries'
import ProductGallery from '@/components/products/ProductGallery'
import WhatsAppCTA from '@/components/products/WhatsAppCTA'
import ProductCard from '@/components/products/ProductCard'
import WhatsAppFloat from '@/components/common/WhatsAppFloat'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { SITE } from '@/lib/constants'
import PageNav from '@/components/common/PageNav'
import Link from 'next/link'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}
  return {
    title: product.meta_title ?? product.name,
    description: product.meta_description ?? product.description ?? `Shop ${product.name} at Geetham Silks, Chennai.`,
    openGraph: {
      title: product.name,
      description: product.description ?? '',
      images: product.product_images?.[0]?.url ? [product.product_images[0].url] : [],
    },
    alternates: { canonical: `/products/${slug}` },
  }
}

export const revalidate = 3600

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const related = await getProducts({ categorySlug: product.categories?.slug, limit: 4 })
  const relatedFiltered = related.filter((p) => p.id !== product.id).slice(0, 4)

  // Schema.org Product markup
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    sku: product.product_code,
    description: product.description,
    image: product.product_images?.map((i) => i.url) ?? [],
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'INR',
      availability: product.is_out_of_stock
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: SITE.name },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <div className="pt-24 min-h-screen bg-[var(--brand-cream)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Back + breadcrumbs */}
          <PageNav
            fallback="/shop"
            backLabel="Shop"
            crumbs={[
              { label: 'Shop', href: '/shop' },
              ...(product.categories
                ? [{ label: product.categories.name, href: `/shop?category=${product.categories.slug}` }]
                : []),
              { label: product.name },
            ]}
            className="mb-8"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Gallery — pinned while the details scroll past */}
            <div className="lg:sticky lg:top-36">
              <ProductGallery images={product.product_images ?? []} productName={product.name} />
            </div>

            {/* Details */}
            <div className="flex flex-col">
              {product.categories && (
                <Link href={`/shop?category=${product.categories.slug}`}
                  className="text-xs tracking-[0.2em] uppercase text-[var(--brand-rose)] mb-2 hover:underline">
                  {product.categories.name}
                </Link>
              )}

              <h1 className="font-serif text-3xl lg:text-5xl font-light text-[var(--brand-charcoal)] leading-tight mb-3">
                {product.name}
              </h1>

              <p className="text-xs text-gray-400 tracking-wider mb-5">Product Code: #{product.product_code}</p>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="font-serif text-3xl font-semibold text-[var(--brand-charcoal)]">
                  {formatPrice(product.price)}
                </span>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-lg text-gray-400 line-through">{formatPrice(product.original_price)}</span>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {product.is_new_arrival && <Badge variant="rose">New Arrival</Badge>}
                {product.is_trending && <Badge variant="gold">Trending</Badge>}
                {product.is_out_of_stock && <Badge variant="default">Out of Stock</Badge>}
                {product.is_featured && <Badge variant="pink">Featured</Badge>}
              </div>

              {/* Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-3 font-medium">Available Sizes</p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <span key={size} className="border border-[var(--brand-pink)] px-4 py-1.5 text-sm text-[var(--brand-charcoal)] hover:bg-[var(--brand-pink)]/15 hover:border-[var(--brand-rose)] transition-colors duration-300 cursor-default">
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-3 font-medium">Available Colors</p>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <span key={color} className="border border-[var(--brand-pink)] px-4 py-1.5 text-sm text-[var(--brand-charcoal)] hover:bg-[var(--brand-pink)]/15 hover:border-[var(--brand-rose)] transition-colors duration-300 cursor-default">
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* WhatsApp CTA */}
              {!product.is_out_of_stock && (
                <div className="mb-6">
                  <WhatsAppCTA product={product} size="lg" />
                </div>
              )}

              {/* Description */}
              {product.description && (
                <div className="border-t border-[var(--brand-pink)]/30 pt-6 mb-5">
                  <h2 className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-3 font-medium">Description</h2>
                  <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Material */}
              {product.material && (
                <div className="border-t border-[var(--brand-pink)]/30 pt-5 mb-5">
                  <h2 className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-2 font-medium">Material</h2>
                  <p className="text-sm text-gray-600">{product.material}</p>
                </div>
              )}

              {/* Care */}
              {product.care_instructions && (
                <div className="border-t border-[var(--brand-pink)]/30 pt-5">
                  <h2 className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-2 font-medium">Care Instructions</h2>
                  <p className="text-sm text-gray-600">{product.care_instructions}</p>
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          {relatedFiltered.length > 0 && (
            <div className="mt-24">
              <h2 className="font-serif text-3xl lg:text-4xl font-light text-[var(--brand-charcoal)] mb-8">
                You May Also <em className="italic text-[var(--brand-rose)]">Like</em>
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {relatedFiltered.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <WhatsAppFloat />
    </>
  )
}
