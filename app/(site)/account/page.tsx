import type { Metadata } from 'next'
import Link from 'next/link'
import { Heart, ShoppingBag, Package, MessageCircle, UserCircle } from 'lucide-react'
import { SITE } from '@/lib/constants'
import PageNav from '@/components/common/PageNav'

export const metadata: Metadata = { title: 'My Account' }

export default function AccountPage() {
  const waMsg = encodeURIComponent('Hi Geetham Silks, I need help with my order.')

  const links = [
    { href: '/wishlist', icon: Heart, label: 'Wishlist', desc: 'Pieces you’ve saved' },
    { href: '/cart', icon: ShoppingBag, label: 'Shopping Bag', desc: 'Items ready to order' },
  ]

  return (
    <div className="pt-24 min-h-screen bg-[var(--brand-cream)] pb-24 lg:pb-0">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PageNav fallback="/" backLabel="Home" crumbs={[{ label: 'Account' }]} className="mb-10" />

        <div className="text-center mb-12">
          <UserCircle size={48} strokeWidth={1} className="mx-auto text-[var(--brand-rose)] mb-4" />
          <h1 className="font-serif text-4xl lg:text-5xl font-light text-[var(--brand-charcoal)]">My Account</h1>
          <p className="text-gray-500 mt-3 max-w-md mx-auto text-sm">
            Sign-in, order history and saved addresses are arriving soon. For now your wishlist and bag are saved on this device.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {links.map(({ href, icon: Icon, label, desc }) => (
            <Link key={href} href={href} className="group flex items-center gap-4 bg-white border border-[var(--brand-pink)]/30 p-5 hover:border-[var(--brand-rose)] transition-colors">
              <Icon size={24} className="text-[var(--brand-rose)] shrink-0" />
              <div>
                <p className="font-serif text-lg font-light text-[var(--brand-charcoal)] group-hover:text-[var(--brand-rose)] transition-colors">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-white border border-[var(--brand-pink)]/30 p-6 text-center">
          <Package size={28} strokeWidth={1.2} className="mx-auto text-[var(--brand-charcoal)]/40 mb-3" />
          <p className="font-serif text-xl font-light text-[var(--brand-charcoal)] mb-1">Order tracking is coming</p>
          <p className="text-sm text-gray-500 mb-5">Need help with an order in the meantime? We’re a message away.</p>
          <a
            href={`https://wa.me/${SITE.whatsapp}?text=${waMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] text-white text-[11px] tracking-[0.2em] uppercase px-7 py-3.5 hover:bg-[#128C7E] transition-colors"
          >
            <MessageCircle size={15} /> Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
