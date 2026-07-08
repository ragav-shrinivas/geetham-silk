'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LayoutGrid, Heart, ShoppingBag, User } from 'lucide-react'
import { useStore } from '@/lib/store/StoreProvider'
import { cn } from '@/lib/utils'

/**
 * App-style bottom navigation for mobile (< lg). Thumb-friendly, sticky, with
 * live cart/wishlist count badges. Cart opens the drawer instead of navigating.
 */
export default function BottomNav() {
  const pathname = usePathname()
  const { cartCount, wishlistCount, openCart, ready } = useStore()

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))

  const tabClass = (active: boolean) =>
    cn(
      'relative flex flex-col items-center justify-center gap-1 flex-1 min-h-[56px] text-[10px] tracking-[0.08em] uppercase transition-colors duration-200',
      active ? 'text-[var(--brand-rose)]' : 'text-[var(--brand-charcoal)]/80'
    )

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-[80] bg-white/95 backdrop-blur-md border-t border-[var(--brand-pink)]/30 flex items-stretch"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Primary"
    >
      <Link href="/" className={tabClass(isActive('/'))}>
        <Home size={20} strokeWidth={isActive('/') ? 2.2 : 1.7} />
        Home
      </Link>

      <Link href="/shop" className={tabClass(isActive('/shop'))}>
        <LayoutGrid size={20} strokeWidth={isActive('/shop') ? 2.2 : 1.7} />
        Shop
      </Link>

      <Link href="/wishlist" className={tabClass(isActive('/wishlist'))}>
        <span className="relative">
          <Heart size={20} strokeWidth={isActive('/wishlist') ? 2.2 : 1.7} />
          {ready && wishlistCount > 0 && <CountBadge n={wishlistCount} />}
        </span>
        Wishlist
      </Link>

      <button type="button" onClick={openCart} className={tabClass(false)} aria-label="Open cart">
        <span className="relative">
          <ShoppingBag size={20} strokeWidth={1.7} />
          {ready && cartCount > 0 && <CountBadge n={cartCount} />}
        </span>
        Cart
      </button>

      <Link href="/account" className={tabClass(isActive('/account'))}>
        <User size={20} strokeWidth={isActive('/account') ? 2.2 : 1.7} />
        Account
      </Link>
    </nav>
  )
}

function CountBadge({ n }: { n: number }) {
  return (
    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[var(--brand-rose)] text-white text-[9px] font-medium flex items-center justify-center tabular-nums">
      {n > 9 ? '9+' : n}
    </span>
  )
}
