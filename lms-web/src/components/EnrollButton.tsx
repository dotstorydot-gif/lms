'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Loader2, BookOpen } from 'lucide-react'

export default function EnrollButton({
    courseId,
    price,
    isFree,
    isEnrolled
}: {
    courseId: string
    price: number | null
    isFree: boolean
    isEnrolled: boolean
}) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    if (isEnrolled) {
        return (
            <button
                onClick={() => router.push(`/student/courses/${courseId}/learn`)}
                className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition shadow-sm flex items-center justify-center gap-2"
            >
                <BookOpen size={18} />
                Continue Learning
            </button>
        )
    }

    const handleEnroll = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId })
            })

            const data = await res.json()

            if (data.free && data.enrolled) {
                // Free course - direct redirect
                router.push(`/student/courses/${courseId}/learn`)
                return
            }

            if (data.url) {
                // Paid course - redirect to Stripe Checkout
                window.location.href = data.url
                return
            }

            if (data.error) {
                alert(`Error: ${data.error}`)
            }
        } catch (err) {
            alert('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleEnroll}
            disabled={loading}
            className="w-full py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
        >
            {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Processing...</>
            ) : isFree || !price ? (
                <><BookOpen size={18} /> Enroll Free</>
            ) : (
                <><ShoppingCart size={18} /> Enroll for ${price.toFixed(2)}</>
            )}
        </button>
    )
}
