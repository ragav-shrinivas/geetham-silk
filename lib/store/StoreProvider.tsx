'use client'
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { ProductWithImages } from '@/types/database'

/* ------------------------------------------------------------------ types */

export interface CartItem {
  id: string          // product id
  slug: string
  name: string
  price: number
  image: string | null
  size?: string | null
  qty: number
}

export interface WishlistItem {
  id: string
  slug: string
  name: string
  price: number
  image: string | null
  categoryName?: string | null
}

interface StoreValue {
  /** true once localStorage has been read on the client — guards hydration */
  ready: boolean
  // cart
  cart: CartItem[]
  cartCount: number
  cartTotal: number
  addToCart: (item: Omit<CartItem, 'qty'>, qty?: number) => void
  removeFromCart: (id: string, size?: string | null) => void
  setQty: (id: string, size: string | null | undefined, qty: number) => void
  clearCart: () => void
  // wishlist
  wishlist: WishlistItem[]
  wishlistCount: number
  inWishlist: (id: string) => boolean
  toggleWishlist: (item: WishlistItem) => void
  removeFromWishlist: (id: string) => void
  moveToCart: (id: string) => void
  // ui
  cartOpen: boolean
  openCart: () => void
  closeCart: () => void
  // quick view
  quickView: ProductWithImages | null
  openQuickView: (p: ProductWithImages) => void
  closeQuickView: () => void
}

const CART_KEY = 'gs_cart_v1'
const WISH_KEY = 'gs_wishlist_v1'

const StoreContext = createContext<StoreValue | null>(null)

/** unique line key — same product in two sizes are distinct lines */
const lineKey = (id: string, size?: string | null) => `${id}__${size ?? ''}`

/* ------------------------------------------------------------------ provider */

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [quickView, setQuickView] = useState<ProductWithImages | null>(null)

  // hydrate from localStorage once on mount
  useEffect(() => {
    try {
      const c = localStorage.getItem(CART_KEY)
      const w = localStorage.getItem(WISH_KEY)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (c) setCart(JSON.parse(c))
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (w) setWishlist(JSON.parse(w))
    } catch { /* ignore corrupt storage */ }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true)
  }, [])

  // persist
  useEffect(() => { if (ready) localStorage.setItem(CART_KEY, JSON.stringify(cart)) }, [cart, ready])
  useEffect(() => { if (ready) localStorage.setItem(WISH_KEY, JSON.stringify(wishlist)) }, [wishlist, ready])

  /* ---- cart actions ---- */
  const addToCart = useCallback((item: Omit<CartItem, 'qty'>, qty = 1) => {
    setCart((prev) => {
      const key = lineKey(item.id, item.size)
      const existing = prev.find((p) => lineKey(p.id, p.size) === key)
      if (existing) {
        return prev.map((p) => (lineKey(p.id, p.size) === key ? { ...p, qty: p.qty + qty } : p))
      }
      return [...prev, { ...item, qty }]
    })
    setCartOpen(true)
  }, [])

  const removeFromCart = useCallback((id: string, size?: string | null) => {
    setCart((prev) => prev.filter((p) => lineKey(p.id, p.size) !== lineKey(id, size)))
  }, [])

  const setQty = useCallback((id: string, size: string | null | undefined, qty: number) => {
    setCart((prev) =>
      prev
        .map((p) => (lineKey(p.id, p.size) === lineKey(id, size) ? { ...p, qty: Math.max(0, qty) } : p))
        .filter((p) => p.qty > 0)
    )
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  /* ---- wishlist actions ---- */
  const inWishlist = useCallback((id: string) => wishlist.some((w) => w.id === id), [wishlist])

  const removeFromWishlist = useCallback((id: string) => {
    setWishlist((prev) => prev.filter((w) => w.id !== id))
  }, [])

  const toggleWishlist = useCallback((item: WishlistItem) => {
    setWishlist((prev) => (prev.some((w) => w.id === item.id) ? prev.filter((w) => w.id !== item.id) : [item, ...prev]))
  }, [])

  const moveToCart = useCallback((id: string) => {
    setWishlist((prev) => {
      const item = prev.find((w) => w.id === id)
      if (item) {
        setCart((c) => {
          const key = lineKey(item.id, null)
          if (c.some((p) => lineKey(p.id, p.size) === key)) return c
          return [...c, { id: item.id, slug: item.slug, name: item.name, price: item.price, image: item.image, size: null, qty: 1 }]
        })
        setCartOpen(true)
      }
      return prev.filter((w) => w.id !== id)
    })
  }, [])

  const cartCount = cart.reduce((n, i) => n + i.qty, 0)
  const cartTotal = cart.reduce((n, i) => n + i.price * i.qty, 0)

  const value: StoreValue = {
    ready,
    cart, cartCount, cartTotal, addToCart, removeFromCart, setQty, clearCart,
    wishlist, wishlistCount: wishlist.length, inWishlist, toggleWishlist, removeFromWishlist, moveToCart,
    cartOpen, openCart: () => setCartOpen(true), closeCart: () => setCartOpen(false),
    quickView, openQuickView: (p) => setQuickView(p), closeQuickView: () => setQuickView(null),
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within <StoreProvider>')
  return ctx
}
