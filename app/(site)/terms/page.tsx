import type { Metadata } from 'next'
import { SITE } from '@/lib/constants'
import PageNav from '@/components/common/PageNav'

export const metadata: Metadata = { title: 'Terms & Conditions' }

export default function TermsPage() {
  return (
    <div className="pt-24 min-h-screen bg-[var(--brand-cream)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 prose prose-sm prose-gray">
        <PageNav fallback="/" backLabel="Home" crumbs={[{ label: 'Terms & Conditions' }]} className="not-prose mb-10" />
        <h1 className="font-serif text-4xl font-light text-[var(--brand-charcoal)] not-prose mb-8">Terms & Conditions</h1>
        <p className="text-gray-500 text-sm not-prose mb-8">Last updated: June 2026</p>

        <h2>About This Website</h2>
        <p>Geethams Silks operates as a WhatsApp Commerce platform. This website is for product browsing and enquiry purposes only. No online transactions or payments are processed through this site.</p>

        <h2>Product Information</h2>
        <p>Product images, prices, and availability are updated regularly. Actual product colours may vary slightly from screen representations due to photography and display settings.</p>

        <h2>Pricing</h2>
        <p>All prices displayed are in Indian Rupees (INR) and are subject to change without notice. Final pricing will be confirmed during WhatsApp consultation.</p>

        <h2>Availability</h2>
        <p>Product availability is subject to stock. Items marked &quot;Out of Stock&quot; are not available. Contact us on WhatsApp for availability updates.</p>

        <h2>Intellectual Property</h2>
        <p>All content on this website including images, text, and logos are the property of Geethams Silks and may not be reproduced without written permission.</p>

        <h2>Contact</h2>
        <p>For any queries, reach us at <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or call {SITE.phone}.</p>
      </div>
    </div>
  )
}
