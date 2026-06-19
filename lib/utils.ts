import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function buildWhatsAppMessage(product: {
  name: string
  product_code: string
  price: number
  slug: string
}): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const productUrl = `${siteUrl}/products/${product.slug}`
  const message = `Hi Geethams Silks,

I am interested in the following product.

Product Name: ${product.name}
Product Code: ${product.product_code}
Price: ${formatPrice(product.price)}
Product Link: ${productUrl}

Please share availability and additional details.

Thank you.`
  return encodeURIComponent(message)
}

export function buildWhatsAppUrl(product: {
  name: string
  product_code: string
  price: number
  slug: string
}): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919677093294'
  const message = buildWhatsAppMessage(product)
  return `https://wa.me/${number}?text=${message}`
}

export function getPublicUrl(bucket: string, path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
}
