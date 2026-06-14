'use client'
import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { SITE } from '@/lib/constants'

export default function WhatsAppFloat() {
  return (
    <motion.a
      href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent('Hi Geethams Silks, I would like to enquire about your collection.')}`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 2, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.1 }}
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-2xl"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={26} />
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
    </motion.a>
  )
}
