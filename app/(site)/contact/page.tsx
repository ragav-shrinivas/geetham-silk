import type { Metadata } from 'next'
import { MapPin, Phone, Mail, MessageCircle, Clock, Star } from 'lucide-react'
import { SITE } from '@/lib/constants'
import WhatsAppFloat from '@/components/common/WhatsAppFloat'
import MapCard from '@/components/common/MapCard'
import FeedbackForm from '@/components/common/FeedbackForm'
import PageNav from '@/components/common/PageNav'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Geethams Silks. Visit us in Palavakkam or chat on WhatsApp.',
}

export default function ContactPage() {
  const waMsg = encodeURIComponent('Hi Geethams Silks, I would like to enquire about your collection.')

  return (
    <div className="pt-24 min-h-screen bg-[var(--brand-cream)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <PageNav fallback="/" backLabel="Home" crumbs={[{ label: 'Contact' }]} className="mb-12" />
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-[var(--brand-rose)] mb-3">Get In Touch</p>
          <h1 className="font-serif text-5xl font-light text-[var(--brand-charcoal)]">Contact Us</h1>
          <p className="text-gray-500 mt-4 max-w-lg mx-auto">
            Have a question? We&apos;d love to hear from you. The fastest way to reach us is via WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact details */}
          <div className="lg:col-span-2 space-y-6">
            {[
              { icon: <MessageCircle className="text-[#25D366]" size={22} />, label: 'WhatsApp (Fastest)', value: SITE.phone, href: `https://wa.me/${SITE.whatsapp}?text=${waMsg}`, external: true },
              { icon: <Phone className="text-[var(--brand-rose)]" size={22} />, label: 'Phone', value: SITE.phone, href: `tel:${SITE.phone}` },
              { icon: <Mail className="text-[var(--brand-rose)]" size={22} />, label: 'Email', value: SITE.email, href: `mailto:${SITE.email}` },
              { icon: <MapPin className="text-[var(--brand-rose)]" size={22} />, label: 'Store Address', value: SITE.address, href: null },
              { icon: <Clock className="text-[var(--brand-rose)]" size={22} />, label: 'Store Hours', value: 'Mon–Sat: 10am – 8pm\nSunday: 11am – 6pm', href: null },
            ].map((item) => (
              <div key={item.label} className="flex gap-4 bg-white p-5 border border-[var(--brand-pink)]/20">
                <div className="flex-shrink-0 mt-0.5">{item.icon}</div>
                <div>
                  <p className="text-xs tracking-[0.15em] uppercase text-gray-400 mb-1 font-medium">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} target={item.external ? '_blank' : undefined} rel={item.external ? 'noopener noreferrer' : undefined}
                      className="text-sm text-[var(--brand-charcoal)] hover:text-[var(--brand-rose)] transition-colors whitespace-pre-line">
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-sm text-[var(--brand-charcoal)] whitespace-pre-line">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* WhatsApp CTA */}
          <div className="lg:col-span-3 bg-white border border-[var(--brand-pink)]/20 p-10 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-[#25D366]/10 flex items-center justify-center mb-6">
              <MessageCircle className="text-[#25D366]" size={36} />
            </div>
            <h2 className="font-serif text-3xl font-light text-[var(--brand-charcoal)] mb-3">
              Chat on WhatsApp
            </h2>
            <p className="text-gray-500 text-sm mb-8 max-w-sm leading-relaxed">
              The quickest way to enquire about products, check availability, or get styling advice. We typically respond within minutes.
            </p>
            <a
              href={`https://wa.me/${SITE.whatsapp}?text=${waMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#25D366] text-white text-sm tracking-widest uppercase px-10 py-4 hover:bg-[#128C7E] transition-colors shadow-lg"
            >
              <MessageCircle size={18} />
              Start a Conversation
            </a>
          </div>
        </div>

        {/* Find us — clickable map */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <p className="text-xs tracking-[0.3em] uppercase text-[var(--brand-rose)] mb-3">Find Us</p>
            <h2 className="font-serif text-3xl lg:text-4xl font-light text-[var(--brand-charcoal)]">
              Visit the <em className="italic text-[var(--brand-rose)]">boutique</em>
            </h2>
          </div>
          <MapCard />
        </div>

        {/* Customer feedback */}
        <div id="feedback" className="mt-20 scroll-mt-32">
          <div className="text-center mb-8">
            <p className="text-xs tracking-[0.3em] uppercase text-[var(--brand-rose)] mb-3">Your Words</p>
            <h2 className="font-serif text-3xl lg:text-4xl font-light text-[var(--brand-charcoal)]">
              Share your <em className="italic text-[var(--brand-rose)]">experience</em>
            </h2>
            <p className="text-gray-500 text-sm mt-4 max-w-md mx-auto">
              Loved your saree? Tell us — approved reviews appear on our homepage.
            </p>
            <a
              href={SITE.googleReviews}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[var(--brand-charcoal)] hover:text-[var(--brand-rose)] link-underline transition-colors"
            >
              <Star size={13} className="fill-[var(--brand-gold)] text-[var(--brand-gold)]" />
              Read our Google reviews
            </a>
          </div>
          <div className="max-w-2xl mx-auto">
            <FeedbackForm />
          </div>
        </div>
      </div>
      <WhatsAppFloat />
    </div>
  )
}
