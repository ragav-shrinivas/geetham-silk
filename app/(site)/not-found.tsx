import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--brand-cream)]">
      <div className="text-center px-4">
        <p className="text-xs tracking-[0.3em] uppercase text-[var(--brand-rose)] mb-4">404</p>
        <h1 className="font-serif text-5xl font-light text-[var(--brand-charcoal)] mb-4">
          Page Not Found
        </h1>
        <p className="text-[var(--brand-charcoal)]/85 mb-8">The page you are looking for does not exist.</p>
        <Link href="/" className="inline-block bg-[var(--brand-darkpink)] text-white text-xs tracking-[0.2em] uppercase px-8 py-3 hover:bg-[var(--brand-rose)] transition-colors">
          Back to Home
        </Link>
      </div>
    </div>
  )
}
