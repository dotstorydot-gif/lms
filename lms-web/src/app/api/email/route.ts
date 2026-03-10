import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { to, subject, html } = await request.json()

        if (!process.env.RESEND_API_KEY) {
            console.warn('RESEND_API_KEY not set — email not sent')
            return NextResponse.json({ sent: false, reason: 'No API key configured' })
        }

        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)

        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'noreply@learnhub.app',
            to,
            subject,
            html,
        })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ sent: true, id: data?.id })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

// Shared email templates
export const emailTemplates = {
    enrollment: (courseName: string, studentName: string) => `
        <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
            <h1 style="color: #7C3AED; font-size: 24px; margin-bottom: 8px;">Welcome to ${courseName}! 🎉</h1>
            <p style="color: #475569;">Hi ${studentName},</p>
            <p style="color: #475569;">You've successfully enrolled in <strong>${courseName}</strong>. Your learning journey starts now!</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/student/my-learning" 
               style="display: inline-block; background: #7C3AED; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
                Start Learning →
            </a>
        </div>
    `,
    certificate: (courseName: string, studentName: string, certUrl: string) => `
        <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
            <h1 style="color: #D97706; font-size: 24px; margin-bottom: 8px;">Certificate Earned! 🏆</h1>
            <p style="color: #475569;">Hi ${studentName},</p>
            <p style="color: #475569;">Congratulations! You've completed <strong>${courseName}</strong> and earned your certificate.</p>
            <a href="${certUrl}" 
               style="display: inline-block; background: #D97706; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
                Download Certificate →
            </a>
        </div>
    `,
    quizPassed: (quizName: string, score: number, studentName: string) => `
        <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
            <h1 style="color: #059669; font-size: 24px; margin-bottom: 8px;">Quiz Passed! ✅</h1>
            <p style="color: #475569;">Hi ${studentName},</p>
            <p style="color: #475569;">You passed <strong>${quizName}</strong> with a score of <strong>${score}%</strong>. Keep up the great work!</p>
        </div>
    `,
}
