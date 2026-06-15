import type { Metadata } from 'next'
import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react'
import { SITE } from '@/lib/constants'
import { AboutHero, JourneyTimeline, Craftsmanship, StatsStrip } from '@/components/about/AboutStory'
import Reveal from '@/components/common/Reveal'
import MapCard from '@/components/common/MapCard'
import WhatsAppFloat from '@/components/common/WhatsAppFloat'

const InstagramIcon = () => (
  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
)
const FacebookIcon = () => (
  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
)

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Geetham Silks — premium ethnic wear boutique in Palavakkam, Chennai.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--brand-cream)]">
      <AboutHero />
      <JourneyTimeline />
      <Craftsmanship />
      <StatsStrip />

      {/* Visit Us */}
      <section className="py-24 bg-[var(--brand-cream)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal direction="up" className="text-center mb-12">
            <p className="text-xs tracking-[0.35em] uppercase text-[var(--brand-rose)] mb-4">Visit Us</p>
            <h2 className="font-serif text-4xl lg:text-5xl font-light text-[var(--brand-charcoal)]">
              The boutique <em className="italic text-[var(--brand-rose)]">awaits</em>
            </h2>
          </Reveal>

          <Reveal direction="up" delay={0.1}>
            <div className="bg-white border border-[var(--brand-pink)]/20 p-8 lg:p-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <MapPin className="text-[var(--brand-rose)] flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-medium text-[var(--brand-charcoal)] mb-1">Address</p>
                    <p className="text-gray-500 text-sm leading-relaxed">{SITE.address}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Phone className="text-[var(--brand-rose)] flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-medium text-[var(--brand-charcoal)] mb-1">Phone</p>
                    <a href={`tel:${SITE.phone}`} className="text-gray-500 text-sm hover:text-[var(--brand-rose)]">{SITE.phone}</a>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Mail className="text-[var(--brand-rose)] flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-medium text-[var(--brand-charcoal)] mb-1">Email</p>
                    <a href={`mailto:${SITE.email}`} className="text-gray-500 text-sm hover:text-[var(--brand-rose)]">{SITE.email}</a>
                  </div>
                </div>
                <div className="flex gap-4">
                  <MessageCircle className="text-[#25D366] flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-medium text-[var(--brand-charcoal)] mb-1">WhatsApp</p>
                    <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer"
                      className="text-gray-500 text-sm hover:text-[#25D366]">{SITE.phone}</a>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center mt-8 pt-8 border-t border-[var(--brand-pink)]/20">
                <a href={SITE.instagram} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--brand-rose)] transition-colors">
                  <InstagramIcon /> Instagram
                </a>
                <a href={SITE.facebook} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--brand-rose)] transition-colors">
                  <FacebookIcon /> Facebook
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal direction="up" delay={0.15} className="mt-6">
            <MapCard />
          </Reveal>
        </div>
      </section>
      <WhatsAppFloat />
    </div>
  )
}
