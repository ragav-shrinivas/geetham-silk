'use client'
import { motion, useReducedMotion } from 'framer-motion'
import ProductCard from '@/components/products/ProductCard'
import { LUXE } from '@/lib/motion'
import type { ProductWithImages } from '@/types/database'

/**
 * Shop grid with choreographed re-entry: the server filters, and the grid
 * (remounted via key on the filter signature) staggers the pieces back in.
 */
export default function ShopGrid({ products }: { products: ProductWithImages[] }) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      initial={reduced ? false : 'hidden'}
      animate="shown"
      variants={{ shown: { transition: { staggerChildren: 0.06 } }, hidden: {} }}
      className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6"
    >
      {products.map((product) => (
        <motion.div
          key={product.id}
          variants={{
            hidden: { opacity: 0, y: 30 },
            shown: { opacity: 1, y: 0, transition: { duration: 0.7, ease: LUXE } },
          }}
        >
          <ProductCard product={product} animate={false} />
        </motion.div>
      ))}
    </motion.div>
  )
}
