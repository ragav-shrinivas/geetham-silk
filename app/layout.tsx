import type { Metadata } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import './globals.css'
import { SITE } from '@/lib/constants'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

// Jost: geometric, refined — premium boutique UI/body feel (replaces Inter)
const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Premium Sarees & Ethnic Wear Chennai`,
    template: `%s | ${SITE.name}`,
  },
  description: 'Shop premium sarees, kurtas, and kids ethnic wear at Geetham Silks, Palavakkam, Chennai. Enquire on WhatsApp for the latest collections.',
  keywords: ['sarees chennai', 'silk sarees', 'ethnic wear', 'kurtas', 'kids wear', 'palavakkam', 'geethams silks', 'women clothing chennai'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — Premium Sarees & Ethnic Wear Chennai`,
    description: 'Discover elegance at Geetham Silks — premium sarees, kurtas & kids ethnic wear in Chennai.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Geetham Silks' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name} — Premium Sarees & Ethnic Wear Chennai`,
    description: 'Discover elegance at Geetham Silks — premium sarees, kurtas & kids ethnic wear in Chennai.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: { canonical: SITE.url },
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'ClothingStore',
  name: 'Geetham Silks',
  description: 'Premium sarees, kurtas & ethnic wear for women and kids in Chennai.',
  url: 'https://geethamssilks.com',
  telephone: '+91-96770-93294',
  email: 'geethamssilks@gmail.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '388, Periyar Salai, Krishna Nagar',
    addressLocality: 'Palavakkam',
    addressRegion: 'Tamil Nadu',
    postalCode: '600041',
    addressCountry: 'IN',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 12.9489, longitude: 80.2518 },
  sameAs: [
    'https://www.instagram.com/geethams_silks_ecr',
    'https://www.facebook.com/GeethamsSilks/',
  ],
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'], opens: '10:00', closes: '20:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Sunday'], opens: '11:00', closes: '18:00' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      </head>
      <body className="antialiased font-sans bg-[var(--brand-cream)]">
        {children}
      </body>
    </html>
  )
}
