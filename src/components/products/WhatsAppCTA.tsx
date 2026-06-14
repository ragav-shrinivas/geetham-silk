'use client'
import { MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { buildWhatsAppUrl } from '@/lib/utils'
import type { Product } from '@/types/database'

interface WhatsAppCTAProps {
  product: Pick<Product, 'name' | 'product_code' | 'price' | 'slug'>
  size?: 'default' | 'lg'
  className?: string
}

export default function WhatsAppCTA({ product, size = 'default', className = '' }: WhatsAppCTAProps) {
  const url = buildWhatsAppUrl(product)

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        inline-flex items-center justify-center gap-3 bg-[#25D366] text-white font-medium tracking-widest uppercase transition-colors hover:bg-[#128C7E] shadow-lg
        ${size === 'lg' ? 'text-sm px-8 py-4 w-full' : 'text-xs px-6 py-3'}
        ${className}
      `}
    >
      <MessageCircle size={size === 'lg' ? 20 : 16} />
      Enquire on WhatsApp
    </motion.a>
  )
}
