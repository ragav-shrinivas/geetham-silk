/**
 * Server-only Razorpay helper.
 * Import only inside Next.js Route Handlers (app/api/**) — never in client components.
 * KEY_SECRET is kept server-side and never exposed to the browser.
 */
import Razorpay from 'razorpay'

export function getRazorpay(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) {
    throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET env vars are required')
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret })
}
