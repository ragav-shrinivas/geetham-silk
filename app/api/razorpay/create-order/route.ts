import { NextRequest, NextResponse } from 'next/server'
import { getRazorpay } from '@/lib/razorpay-server'
import { createBrowserClient } from '@supabase/ssr'

/**
 * POST /api/razorpay/create-order
 * Body: { order_id: string (our Supabase UUID), amount_inr: number }
 * Creates a Razorpay order and links it to our DB order.
 * Returns: { razorpay_order_id, amount, currency }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { order_id, amount_inr } = body as { order_id?: string; amount_inr?: number }

    if (!order_id || typeof amount_inr !== 'number' || amount_inr <= 0) {
      return NextResponse.json({ error: 'Invalid request: order_id and amount_inr required' }, { status: 400 })
    }

    const amountPaise = Math.round(amount_inr * 100)
    if (amountPaise < 100) {
      return NextResponse.json({ error: 'Minimum order amount is ₹1' }, { status: 400 })
    }

    const rzp = getRazorpay()
    const rzpOrder = await rzp.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: order_id.slice(0, 40), // Razorpay receipt max 40 chars
    })

    // Link razorpay_order_id on our DB order so admin can cross-reference
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.rpc('link_razorpay_order', {
      p_order_id: order_id,
      p_razorpay_order_id: rzpOrder.id,
    })

    return NextResponse.json({
      razorpay_order_id: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
    })
  } catch (err) {
    console.error('[razorpay/create-order]', err)
    return NextResponse.json({ error: 'Failed to create Razorpay order' }, { status: 500 })
  }
}
