'use client'
import { Printer } from 'lucide-react'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden inline-flex items-center gap-2 bg-[var(--brand-charcoal)] text-white text-[11px] tracking-[0.2em] uppercase px-6 py-3 hover:bg-[var(--brand-rose)] transition-colors"
    >
      <Printer size={14} /> Print / Save PDF
    </button>
  )
}
