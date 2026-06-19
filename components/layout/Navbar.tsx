'use client'
import Link from 'next/link'
import { useState, useEffect, useRef, type FormEvent } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useLenis } from 'lenis/react'
import { Menu, X, Search, MessageCircle, ArrowRight, ShoppingBag, Heart } from 'lucide-react'
import { NAV_LINKS, SITE } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { LUXE } from '@/lib/motion'
import { useStore } from '@/lib/store/StoreProvider'
import Wordmark from '@/components/common/Wordmark'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const lenis = useLenis()
  const { cartCount, wishlistCount, openCart, ready } = useStore()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // close overlays on navigation (router is the external system we sync with)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false)
    setSearchOpen(false)
  }, [pathname])

  // lock scroll while an overlay is up. Lenis ignores `body { overflow:hidden }`
  // (it drives scroll itself), so we must stop/start the Lenis instance too.
  useEffect(() => {
    const locked = open || searchOpen
    if (locked) {
      lenis?.stop()
      document.body.style.overflow = 'hidden'
    } else {
      lenis?.start()
      document.body.style.overflow = ''
    }
    return () => {
      lenis?.start()
      document.body.style.overflow = ''
    }
  }, [open, searchOpen, lenis])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-[var(--brand-pink)]/30'
          : 'bg-transparent'
      )}
    >
      {/* Top announcement bar */}
      <div className="bg-[var(--brand-charcoal)] text-white text-[11px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] text-center py-2 px-4 whitespace-nowrap overflow-hidden">
        <span className="hidden sm:inline">Free consultation on </span>WhatsApp · +91 96770 93294
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={cn('flex items-center justify-between transition-all duration-500', scrolled ? 'h-16 lg:h-[72px]' : 'h-[72px] lg:h-24')}>
          {/* Logo — hidden over the hero, reveals once the white bar appears on scroll */}
          <motion.div
            initial={false}
            animate={{ opacity: scrolled ? 1 : 0, y: scrolled ? 0 : -8 }}
            transition={{ duration: 0.45, ease: LUXE }}
            className={cn('flex-shrink-0', !scrolled && 'pointer-events-none')}
            aria-hidden={!scrolled}
          >
            <Link href="/" aria-label="Geetham Silks — home" tabIndex={scrolled ? 0 : -1}>
              <Wordmark size="sm" />
            </Link>
          </motion.div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-9">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative text-xs tracking-[0.15em] uppercase font-medium py-1 transition-colors duration-300',
                  isActive(link.href)
                    ? 'text-[var(--brand-rose)]'
                    : scrolled
                      ? 'text-[var(--brand-charcoal)] hover:text-[var(--brand-rose)]'
                      : 'text-white/90 hover:text-[var(--brand-pink)]'
                )}
              >
                {link.label}
                <span
                  className={cn(
                    'absolute left-0 -bottom-0.5 h-px w-full origin-left transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]',
                    isActive(link.href) ? 'scale-x-100 bg-[var(--brand-rose)]' : 'scale-x-0 bg-[var(--brand-rose)]'
                  )}
                />
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search products"
              className={cn(
                'transition-colors p-1',
                scrolled ? 'text-[var(--brand-charcoal)] hover:text-[var(--brand-rose)]' : 'text-white/85 hover:text-white'
              )}
            >
              <Search size={18} />
            </button>
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className={cn(
                'relative transition-colors p-1',
                scrolled ? 'text-[var(--brand-charcoal)] hover:text-[var(--brand-rose)]' : 'text-white/85 hover:text-white'
              )}
            >
              <Heart size={18} />
              {ready && wishlistCount > 0 && <NavBadge n={wishlistCount} />}
            </Link>
            <button
              onClick={openCart}
              aria-label="Open cart"
              className={cn(
                'relative transition-colors p-1',
                scrolled ? 'text-[var(--brand-charcoal)] hover:text-[var(--brand-rose)]' : 'text-white/85 hover:text-white'
              )}
            >
              <ShoppingBag size={18} />
              {ready && cartCount > 0 && <NavBadge n={cartCount} />}
            </button>
            <a
              href={`https://wa.me/${SITE.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] text-white text-xs tracking-widest uppercase px-4 py-2 hover:bg-[#128C7E] transition-colors"
            >
              <MessageCircle size={14} />
              WhatsApp
            </a>
          </div>

          {/* Mobile actions */}
          <div className="lg:hidden flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search products"
              className={cn('p-2 transition-colors', scrolled ? 'text-[var(--brand-charcoal)]' : 'text-white/90')}
            >
              <Search size={20} />
            </button>
            <button
              className={cn('p-2 transition-colors', scrolled ? 'text-[var(--brand-charcoal)]' : 'text-white/90')}
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </div>

      <MobileMenu open={open} onClose={() => setOpen(false)} pathname={pathname} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}

/* ---------- Full-screen mobile menu — fashion-house treatment ----------
   - Truly fullscreen: fixed inset-0, 100dvh (handles mobile browser chrome),
     z-[100] above every page element, fully OPAQUE cream so nothing shows through.
   - Slide + fade in from the right (300–500ms).
   - Safe-area insets so the header/footer never tuck under notches or home bars.
   - Inner column scrolls if the links don't fit a short viewport — never clipped. */

function MobileMenu({ open, onClose, pathname }: { open: boolean; onClose: () => void; pathname: string }) {
  const reduced = useReducedMotion()
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="mobile-menu"
          initial={reduced ? { opacity: 0 } : { opacity: 0, x: '12%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, x: '12%' }}
          transition={{ duration: reduced ? 0 : 0.42, ease: LUXE }}
          className="lg:hidden fixed inset-0 z-[100] flex flex-col h-[100dvh] w-screen overflow-y-auto overscroll-contain"
          style={{
            background:
              'radial-gradient(ellipse 90% 40% at 50% 0%, rgba(232,164,184,0.20) 0%, transparent 62%),' +
              'linear-gradient(180deg, #fdf8f3 0%, #f9efe6 100%)',
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          {/* Header row — logo left, close right */}
          <div className="flex items-center justify-between px-6 pt-5 pb-2 shrink-0">
            <Wordmark size="sm" />
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="-mr-2 p-2.5 text-[var(--brand-charcoal)] active:scale-90 transition-transform"
            >
              <X size={26} />
            </button>
          </div>

          {/* Links — large touch targets, centered, scroll if they overflow */}
          <nav className="flex-1 min-h-0 flex flex-col justify-center px-9 py-6 gap-1">
            {NAV_LINKS.map((link, i) => {
              const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
              return (
                <span key={link.href} className="line-mask">
                  <motion.span
                    initial={{ y: '110%' }}
                    animate={{ y: 0 }}
                    transition={{ duration: reduced ? 0 : 0.6, ease: LUXE, delay: 0.12 + i * 0.06 }}
                    className="block"
                  >
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className={cn(
                        'group flex items-baseline gap-4 font-serif text-[2.3rem] sm:text-[2.6rem] leading-[1.35] font-light py-1.5 transition-colors duration-300',
                        active ? 'text-[var(--brand-rose)] italic' : 'text-[var(--brand-charcoal)]'
                      )}
                    >
                      <span className="text-xs tracking-[0.3em] text-[var(--brand-gold)] tabular-nums">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {link.label}
                    </Link>
                  </motion.span>
                </span>
              )
            })}
          </nav>

          {/* Footer CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.6, ease: LUXE, delay: 0.32 }}
            className="px-9 pb-10 pt-2 space-y-5 shrink-0"
          >
            <div className="hairline" />
            <a
              href={`https://wa.me/${SITE.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] text-white text-sm tracking-widest uppercase px-6 py-4 w-full active:scale-[0.98] transition-transform"
            >
              <MessageCircle size={16} />
              Enquire on WhatsApp
            </a>
            <p className="text-center text-[11px] tracking-[0.25em] uppercase text-[var(--brand-gold)]">
              Palavakkam · Chennai
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ---------- Search overlay ---------- */

function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const reduced = useReducedMotion()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [q, setQ] = useState('')

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQ('')
      // focus after the entrance settles
      const t = setTimeout(() => inputRef.current?.focus(), 350)
      return () => clearTimeout(t)
    }
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  function submit(e: FormEvent) {
    e.preventDefault()
    const term = q.trim()
    if (!term) return
    onClose()
    router.push(`/shop?search=${encodeURIComponent(term)}`)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.4, ease: LUXE }}
          className="fixed inset-0 z-[60] bg-[var(--brand-cream)]/97 backdrop-blur-md flex flex-col"
        >
          <div className="flex justify-end px-6 pt-6">
            <button onClick={onClose} aria-label="Close search" className="p-2 text-[var(--brand-charcoal)] hover:text-[var(--brand-rose)] transition-colors">
              <X size={26} />
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-3xl w-full mx-auto px-6 -mt-20">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0 : 0.6, ease: LUXE, delay: 0.1 }}
              className="text-xs tracking-[0.35em] uppercase text-[var(--brand-rose)] mb-6"
            >
              Search the boutique
            </motion.p>
            <motion.form
              onSubmit={submit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0 : 0.7, ease: LUXE, delay: 0.18 }}
              className="flex items-center gap-4 border-b-2 border-[var(--brand-charcoal)]/20 focus-within:border-[var(--brand-rose)] transition-colors duration-500 pb-3"
            >
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Sarees, kurtas, bridal…"
                aria-label="Search products"
                className="flex-1 bg-transparent font-serif text-3xl sm:text-5xl font-light text-[var(--brand-charcoal)] placeholder:text-[var(--brand-charcoal)]/25 focus:outline-none"
              />
              <button type="submit" aria-label="Search" className="text-[var(--brand-charcoal)] hover:text-[var(--brand-rose)] transition-colors p-2">
                <ArrowRight size={30} strokeWidth={1.5} />
              </button>
            </motion.form>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduced ? 0 : 0.6, delay: 0.4 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              {['Silk Sarees', 'Bridal', 'Kurtas', 'Kids Wear'].map((s) => (
                <button
                  key={s}
                  onClick={() => { onClose(); router.push(`/shop?search=${encodeURIComponent(s)}`) }}
                  className="text-[11px] tracking-[0.2em] uppercase border border-[var(--brand-charcoal)]/20 text-[var(--brand-charcoal)]/70 px-4 py-2 hover:border-[var(--brand-rose)] hover:text-[var(--brand-rose)] transition-colors duration-300"
                >
                  {s}
                </button>
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ---------- Cart / wishlist count badge ---------- */

function NavBadge({ n }: { n: number }) {
  return (
    <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[var(--brand-rose)] text-white text-[9px] font-medium flex items-center justify-center tabular-nums">
      {n > 9 ? '9+' : n}
    </span>
  )
}
