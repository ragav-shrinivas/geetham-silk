import type { Metadata } from 'next'
import { SITE } from '@/lib/constants'
import PageNav from '@/components/common/PageNav'

export const metadata: Metadata = { title: 'Privacy Policy' }

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--brand-cream)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 prose prose-sm prose-gray">
        <PageNav fallback="/" backLabel="Home" crumbs={[{ label: 'Privacy Policy' }]} className="not-prose mb-10" />
        <h1 className="font-serif text-4xl font-light text-[var(--brand-charcoal)] not-prose mb-8">Privacy Policy</h1>
        <p className="text-[var(--brand-charcoal)]/85 text-sm not-prose mb-8">Last updated: June 2026</p>

        <h2>Information We Collect</h2>
        <p>We collect information you voluntarily provide when contacting us via WhatsApp or email, including your name, phone number, and enquiry details.</p>

        <h2>How We Use Your Information</h2>
        <p>Information is used solely to respond to your enquiries and provide product information. We do not sell or share your personal data with third parties.</p>

        <h2>WhatsApp Communication</h2>
        <p>When you click &quot;Enquire on WhatsApp,&quot; you are directed to WhatsApp Messenger. Any communication through WhatsApp is subject to WhatsApp&apos;s own Privacy Policy.</p>

        <h2>Cookies</h2>
        <p>This website uses minimal cookies for basic functionality and analytics. No advertising cookies are used.</p>

        <h2>Contact</h2>
        <p>For privacy concerns, contact us at <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
      </div>
    </div>
  )
}
