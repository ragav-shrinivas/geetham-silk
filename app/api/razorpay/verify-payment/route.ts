import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { createBrowserClient } from '@supabase/ssr'

/**
 * POST /api/razorpay/verify-payment
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id }
 *
 * Security model:
 *   1. HMAC-SHA256 verification against KEY_SECRET (server-only, never sent to client).
 *   2. Only on signature match do we call mark_order_paid in Supabase.
 *   3. mark_order_paid is idempotent — duplicate calls are safe.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id,
    } = body as {
      razorpay_order_id?: string
      razorpay_payment_id?: string
      razorpay_signature?: string
      order_id?: string
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const secret = process.env.RAZORPAY_KEY_SECRET
    if (!secret) {
      console.error('[verify-payment] RAZORPAY_KEY_SECRET not configured')
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
    }

    // HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`
    const expected = createHmac('sha256', secret).update(payload).digest('hex')

    // Timing-safe comparison to prevent timing attacks
    const expectedBuf = Buffer.from(expected, 'hex')
    const receivedBuf = Buffer.from(razorpay_signature, 'hex')
    const signaturesMatch =
      expectedBuf.length === receivedBuf.length &&
      timingSafeEqual(expectedBuf, receivedBuf)

    if (!signaturesMatch) {
      console.warn('[verify-payment] Signature mismatch for order', order_id)
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    // Signature valid — mark order as paid in Supabase
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { error: dbError } = await supabase.rpc('mark_order_paid', {
      p_order_id: order_id,
      p_razorpay_order_id: razorpay_order_id,
      p_razorpay_payment_id: razorpay_payment_id,
    })

    if (dbError) {
      console.error('[verify-payment] DB update failed', dbError)
      return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[verify-payment] Unexpected error', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
