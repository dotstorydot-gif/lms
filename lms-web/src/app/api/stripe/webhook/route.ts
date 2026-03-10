import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role client for webhook (bypasses RLS)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
    }

    // Lazy import Stripe
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
        apiVersion: '2026-02-25.clover'
    })

    let event: import('stripe').Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message)
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as import('stripe').Stripe.Checkout.Session
        const { userId, courseId } = session.metadata || {}

        if (userId && courseId) {
            // 1. Update order status
            await supabaseAdmin
                .from('orders')
                .update({
                    status: 'completed',
                    stripe_payment_intent_id: session.payment_intent as string,
                    completed_at: new Date().toISOString()
                })
                .eq('stripe_session_id', session.id)

            // 2. Enroll the student
            const { data: courseData } = await supabaseAdmin
                .from('courses')
                .select('tenant_id')
                .eq('id', courseId)
                .single()

            await supabaseAdmin
                .from('enrollments')
                .upsert({
                    user_id: userId,
                    course_id: courseId,
                    tenant_id: courseData?.tenant_id,
                    is_active: true
                }, { onConflict: 'user_id, course_id' })

            console.log(`✓ Enrolled user ${userId} in course ${courseId}`)
        }
    }

    return NextResponse.json({ received: true })
}
