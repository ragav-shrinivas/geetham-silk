'use client'
import { useState } from 'react'
import { Share2, Check, Link2, MessageCircle } from 'lucide-react'

/** Share a product via the native share sheet, with copy-link + WhatsApp fallbacks. */
export default function ShareButton({ title }: { title: string }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  function url() { return typeof window !== 'undefined' ? window.location.href : '' }

  async function nativeShare() {
    const shareData = { title, text: `Check out ${title} at Geethams Silks`, url: url() }
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share(shareData) } catch { /* dismissed */ }
    } else {
      setOpen((o) => !o)
    }
  }

  async function copy() {
    try { await navigator.clipboard.writeText(url()); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { /* ignore */ }
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={nativeShare}
        aria-label="Share this product"
        className="inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-[var(--brand-charcoal)]/70 hover:text-[var(--brand-rose)] transition-colors"
      >
        <Share2 size={15} /> Share
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-20 bg-white border border-[var(--brand-pink)]/30 shadow-lg p-2 flex flex-col gap-1 w-44">
          <button onClick={copy} className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--brand-charcoal)] hover:bg-[var(--brand-pink)]/10 transition-colors">
            {copied ? <><Check size={14} className="text-green-600" /> Copied</> : <><Link2 size={14} /> Copy link</>}
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${title} — ${url()}`)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--brand-charcoal)] hover:bg-[var(--brand-pink)]/10 transition-colors"
          >
            <MessageCircle size={14} className="text-[#25D366]" /> WhatsApp
          </a>
        </div>
      )}
    </div>
  )
}
