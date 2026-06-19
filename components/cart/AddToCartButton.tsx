'use client'
import { useState } from 'react'
import { ShoppingBag, Check } from 'lucide-react'
import { useStore, type CartItem } from '@/lib/store/StoreProvider'
import { cn } from '@/lib/utils'

interface Props {
  item: Omit<CartItem, 'qty'>
  qty?: number
  disabled?: boolean
  /** 'full' = large primary button · 'compact' = small button for cards */
  size?: 'full' | 'compact'
  className?: string
}

export default function AddToCartButton({ item, qty = 1, disabled, size = 'full', className }: Props) {
  const { addToCart } = useStore()
  const [added, setAdded] = useState(false)

  function onClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (disabled) return
    addToCart(item, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }

  if (size === 'compact') {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label="Add to cart"
        className={cn(
          'inline-flex items-center justify-center gap-2 min-h-[44px] w-full bg-[var(--brand-charcoal)] text-white text-[11px] tracking-[0.18em] uppercase transition-colors duration-300 hover:bg-[var(--brand-rose)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed',
          className
        )}
      >
        {added ? <><Check size={14} /> Added</> : <><ShoppingBag size={14} /> Add to Cart</>}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-3 min-h-[52px] px-8 bg-[var(--brand-charcoal)] text-white text-xs tracking-[0.2em] uppercase transition-all duration-300 hover:bg-[var(--brand-rose)] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed',
        className
      )}
    >
      {added ? <><Check size={16} /> Added to Cart</> : <><ShoppingBag size={16} /> Add to Cart</>}
    </button>
  )
}
