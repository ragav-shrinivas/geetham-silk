export const SITE = {
  name: 'Geethams Silks',
  tagline: 'Elegance Woven in Every Thread',
  description: 'Premium sarees, kurtas & ethnic wear for women and kids in Chennai.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://geethamssilks.com',
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919677093294',
  email: 'geethamssilks@gmail.com',
  phone: '+91 96770 93294',
  address: '388, Periyar Salai, Krishna Nagar, Palavakkam, Chennai, Tamil Nadu 600041',
  instagram: 'https://www.instagram.com/geethams_silks_ecr',
  facebook: 'https://www.facebook.com/GeethamsSilks/',
  /** opens the store location in Google Maps */
  maps: 'https://www.google.com/maps/search/?api=1&query=Geethams+Silks,+388,+Periyar+Salai,+Krishna+Nagar,+Palavakkam,+Chennai+600041',
  /** keyless Google Maps embed used as the map preview */
  mapsEmbed: 'https://www.google.com/maps?q=Geethams+Silks,+388+Periyar+Salai,+Krishna+Nagar,+Palavakkam,+Chennai+600041&output=embed',
  /** Google listing with reviews (swap for a place-id link if you have one) */
  googleReviews: 'https://www.google.com/search?q=Geethams+Silks+Palavakkam+Chennai+reviews',
}

/** A single rotating announcement-bar message.
 *  `icon` is a lucide icon key resolved in AnnouncementBar (kept as a string so the
 *  data stays serialisable from Server Components / Supabase rows). */
export interface AnnouncementMessage {
  id: string
  text: string
  icon?: 'truck' | 'sparkles' | 'shield' | 'mappin' | 'gift' | 'whatsapp' | 'star' | null
  href?: string | null
}

/** Fallback announcements used until the admin adds rows to the `announcements` table.
 *  Editable here, or (once live) fully manageable from the admin dashboard. */
export const DEFAULT_ANNOUNCEMENTS: AnnouncementMessage[] = [
  { id: 'd1', text: 'Free Shipping Across India', icon: 'truck', href: null },
  { id: 'd2', text: 'New Arrivals Just Dropped', icon: 'sparkles', href: '/shop?sort=newest' },
  { id: 'd3', text: 'Secure Payments with Razorpay', icon: 'shield', href: null },
  { id: 'd4', text: 'Visit Our Palavakkam Store', icon: 'mappin', href: '/contact' },
  { id: 'd5', text: 'Handpicked Styles for Every Occasion', icon: 'star', href: '/shop' },
]

/** Default rotation interval (ms) for the announcement bar. */
export const ANNOUNCEMENT_INTERVAL_MS = 4000

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Collections', href: '/collections' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export const ADMIN_ROUTE = '/evo9-admin'
