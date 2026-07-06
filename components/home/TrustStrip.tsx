import { Truck, ShieldCheck, Sparkles, MessageCircle } from 'lucide-react'

const ITEMS = [
  { Icon: Truck, title: 'Free Shipping', copy: 'Across India on every order' },
  { Icon: ShieldCheck, title: 'Secure Payments', copy: 'Cards, UPI & wallets via Razorpay' },
  { Icon: Sparkles, title: 'Handpicked Quality', copy: 'Curated silks & ethnic wear' },
  { Icon: MessageCircle, title: 'WhatsApp Support', copy: 'Personal assistance, always' },
]

/**
 * Trust / service strip — a conversion-focused reassurance row (vertical grid,
 * no side-swipe). 2-up on mobile, 4-up on desktop.
 */
export default function TrustStrip() {
  return (
    <section className="bg-[var(--brand-cream-deep)] border-y border-[var(--brand-pink)]/30 py-10 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8">
          {ITEMS.map(({ Icon, title, copy }) => (
            <li key={title} className="flex flex-col items-center text-center gap-2.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--brand-darkpink)]/10 text-[var(--brand-darkpink)]">
                <Icon size={20} strokeWidth={1.7} />
              </span>
              <div>
                <p className="font-serif text-base text-[var(--brand-charcoal)] leading-tight">{title}</p>
                <p className="text-xs text-[var(--brand-charcoal)]/60 mt-1 leading-snug">{copy}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
