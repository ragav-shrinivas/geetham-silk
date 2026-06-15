export const SITE = {
  name: 'Geetham Silks',
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

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Collections', href: '/collections' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export const ADMIN_ROUTE = '/evo9-admin'
