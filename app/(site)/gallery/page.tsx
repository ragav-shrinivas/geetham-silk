import type { Metadata } from 'next'
import { getGallery } from '@/lib/queries'
import WhatsAppFloat from '@/components/common/WhatsAppFloat'
import GalleryVideo from '@/components/gallery/GalleryVideo'
import LookbookGrid from '@/components/gallery/LookbookGrid'
import SectionHeading from '@/components/common/SectionHeading'
import Reveal from '@/components/common/Reveal'

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Explore our lookbook, films and store gallery at Geetham Silks, Chennai.',
}

export const revalidate = 3600

export default async function GalleryPage() {
  const items = await getGallery()

  return (
    <div className="pt-24 min-h-screen bg-[var(--brand-cream)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Heading */}
        <SectionHeading
          eyebrow="Lookbook"
          title="The *Gallery*"
          backdropWord="Lookbook"
          copy="Films, drapes, and moments from the boutique — presented as an editorial."
        />

        {/* Featured 9:16 film */}
        <section className="mb-24 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-[var(--brand-pink)]/20 blur-3xl pointer-events-none" />
          <Reveal direction="up" className="relative text-center mb-10">
            <p className="text-xs tracking-[0.3em] uppercase text-[var(--brand-gold)] mb-2">Featured Film</p>
            <h2 className="font-serif text-3xl lg:text-4xl font-light text-[var(--brand-charcoal)]">
              Elegance, <em className="italic text-[var(--brand-rose)]">In Motion</em>
            </h2>
          </Reveal>
          <div className="relative">
            <GalleryVideo src="/silkvideo1.mp4" />
          </div>
        </section>

        {/* Lookbook grid */}
        {items.length === 0 ? (
          <Reveal direction="up" className="text-center py-16">
            <p className="font-serif text-3xl text-gray-300">More moments coming soon</p>
          </Reveal>
        ) : (
          <>
            <Reveal direction="up" className="text-center mb-12">
              <h2 className="font-serif text-3xl lg:text-4xl font-light text-[var(--brand-charcoal)]">The Collection</h2>
              <div className="hairline w-24 mx-auto mt-5" />
            </Reveal>
            <LookbookGrid items={items} />
          </>
        )}
      </div>
      <WhatsAppFloat />
    </div>
  )
}
