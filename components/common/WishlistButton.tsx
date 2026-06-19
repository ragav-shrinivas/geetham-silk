'use client'
import { Heart } from 'lucide-react'
import { useStore, type WishlistItem } from '@/lib/store/StoreProvider'
import { cn } from '@/lib/utils'

interface Props {
  item: WishlistItem
  /** 'overlay' = floating circle on a card image · 'inline' = bordered button with label */
  variant?: 'overlay' | 'inline'
  className?: string
}

export default function WishlistButton({ item, variant = 'overlay', className }: Props) {
  const { inWishlist, toggleWishlist, ready } = useStore()
  const active = ready && inWishlist(item.id)

  function onClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(item)
  }

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
        className={cn(
          'inline-flex items-center justify-center gap-2 min-h-[52px] px-6 border text-[11px] tracking-[0.2em] uppercase transition-colors duration-300',
          active
            ? 'border-[var(--brand-purple)] text-[var(--brand-purple)] bg-[var(--brand-purple)]/5'
            : 'border-[var(--brand-charcoal)]/25 text-[var(--brand-charcoal)] hover:border-[var(--brand-purple)] hover:text-[var(--brand-purple)]',
          className
        )}
      >
        <Heart size={16} className={cn('transition-transform', active && 'fill-[var(--brand-purple)] scale-110')} />
        {active ? 'Saved' : 'Wishlist'}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
      className={cn(
        'flex items-center justify-center w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md transition-all duration-300 active:scale-90 hover:bg-white',
        className
      )}
    >
      <Heart
        size={16}
        className={cn(
          'transition-all duration-300',
          active ? 'fill-[var(--brand-purple)] text-[var(--brand-purple)] scale-110' : 'text-[var(--brand-charcoal)]'
        )}
      />
    </button>
  )
}
