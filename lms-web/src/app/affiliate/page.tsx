import { createClient } from "@/utils/supabase/server"
import { headers } from "next/headers"
import AffiliateDashboardClient from "./AffiliateDashboardClient"

export default async function AffiliatePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const headersList = await headers()
    const host = headersList.get('host') || 'localhost:3000'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const baseUrl = `${protocol}://${host}/student/courses`

    const { data: affiliate } = await supabase
        .from('affiliates')
        .select('id, referral_code, status, commission_percent, total_earnings, total_paid')
        .eq('user_id', user?.id)
        .single()

    const { data: referrals } = affiliate
        ? await supabase
            .from('affiliate_referrals')
            .select('id, status, commission_amount, click_at, courses(title)')
            .eq('affiliate_id', affiliate.id)
            .order('click_at', { ascending: false })
            .limit(50)
        : { data: [] }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Affiliate Program</h1>
                <p className="text-slate-500 mt-1">Earn commissions by referring students to our courses.</p>
            </div>
            <AffiliateDashboardClient
                affiliate={affiliate}
                referrals={(referrals || []) as any[]}
                baseUrl={baseUrl}
            />
        </div>
    )
}
