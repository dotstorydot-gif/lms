import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        // Import Stripe lazily to avoid build-time initialization errors
        const Stripe = (await import('stripe')).default
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
            apiVersion: '2026-02-25.clover'
        })

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { courseId } = await request.json()

        if (!courseId) {
            return NextResponse.json({ error: 'Course ID required' }, { status: 400 })
        }

        // Fetch the course details
        const { data: course } = await supabase
            .from('courses')
            .select('id, title, price, currency, is_free, thumbnail_url, tenant_id')
            .eq('id', courseId)
            .eq('status', 'published')
            .single()

        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 })
        }

        // Free course — directly enroll without payment
        if (course.is_free || !course.price) {
            await supabase.from('enrollments').upsert({
                user_id: user.id,
                course_id: courseId,
                tenant_id: course.tenant_id,
                is_active: true
            }, { onConflict: 'user_id, course_id' })

            return NextResponse.json({ enrolled: true, free: true })
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin')

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: course.currency?.toLowerCase() || 'usd',
                    product_data: {
                        name: course.title,
                        images: course.thumbnail_url ? [course.thumbnail_url] : [],
                    },
                    unit_amount: Math.round(course.price * 100),
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${baseUrl}/student/courses/${courseId}/learn?payment=success`,
            cancel_url: `${baseUrl}/student/courses/${courseId}?payment=cancelled`,
            metadata: { userId: user.id, courseId },
            customer_email: user.email,
        })

        // Create pending order record
        await supabase.from('orders').insert({
            user_id: user.id,
            course_id: courseId,
            tenant_id: course.tenant_id,
            amount: course.price,
            currency: course.currency || 'USD',
            status: 'pending',
            stripe_session_id: session.id,
        })

        return NextResponse.json({ url: session.url })

    } catch (error: any) {
        console.error('Checkout error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
