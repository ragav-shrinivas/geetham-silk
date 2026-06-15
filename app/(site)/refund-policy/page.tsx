import type { Metadata } from 'next'
import { SITE } from '@/lib/constants'

export const metadata: Metadata = { title: 'Refund Policy' }

export default function RefundPolicyPage() {
  return (
    <div className="pt-24 min-h-screen bg-[var(--brand-cream)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 prose prose-sm prose-gray">
        <h1 className="font-serif text-4xl font-light text-[var(--brand-charcoal)] not-prose mb-8">Refund Policy</h1>
        <p className="text-gray-500 text-sm not-prose mb-8">Last updated: June 2026</p>

        <h2>WhatsApp Commerce Model</h2>
        <p>Geetham Silks operates exclusively through WhatsApp-based enquiry and in-store purchase. All purchases are finalized in-store or via direct WhatsApp arrangement.</p>

        <h2>Exchange Policy</h2>
        <p>We offer exchanges on eligible items within 7 days of purchase, subject to the item being in its original condition with tags intact. Please contact us on WhatsApp or visit our store.</p>

        <h2>Damaged or Defective Items</h2>
        <p>If you receive a damaged or defective item, please contact us within 24 hours of purchase via WhatsApp with photos. We will arrange a replacement or exchange.</p>

        <h2>No Online Payments</h2>
        <p>As this website does not process any online payments, online refunds are not applicable. All financial arrangements are handled directly through our store.</p>

        <h2>Contact</h2>
        <p>For refund or exchange queries: <a href={`https://wa.me/${SITE.whatsapp}`}>WhatsApp us</a> or call {SITE.phone}.</p>
      </div>
    </div>
  )
}
