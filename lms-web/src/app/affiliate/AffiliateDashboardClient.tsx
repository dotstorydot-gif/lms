'use client'

import { useState } from 'react'
import { Copy, Check, Link2, TrendingUp, DollarSign, Users, ExternalLink, AlertCircle } from 'lucide-react'

export default function AffiliateDashboardClient({
    affiliate,
    referrals,
    baseUrl
}: {
    affiliate: {
        id: string
        referral_code: string
        status: string
        commission_percent: number
        total_earnings: number
        total_paid: number
    } | null
    referrals: Array<{
        id: string
        status: string
        commission_amount: number | null
        click_at: string
        courses: { title: string } | null
    }>
    baseUrl: string
}) {
    const [copied, setCopied] = useState(false)
    const [applying, setApplying] = useState(false)
    const [applied, setApplied] = useState(false)

    const referralLink = `${baseUrl}?ref=${affiliate?.referral_code}`

    const copyLink = async () => {
        await navigator.clipboard.writeText(referralLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
    }

    const applyForAffiliate = async () => {
        setApplying(true)
        try {
            await fetch('/api/affiliate/apply', { method: 'POST' })
            setApplied(true)
        } finally {
            setApplying(false)
        }
    }

    const pendingEarnings = (affiliate?.total_earnings || 0) - (affiliate?.total_paid || 0)
    const conversions = referrals.filter(r => r.status === 'converted').length
    const totalClicks = referrals.length

    if (!affiliate) {
        return (
            <div className="max-w-lg mx-auto py-16 text-center space-y-6">
                <div className="w-20 h-20 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto">
                    <Link2 size={36} className="text-violet-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Join the Affiliate Program</h2>
                    <p className="text-slate-500 mt-2 text-sm max-w-sm mx-auto">
                        Earn commissions by sharing courses with your audience. Get a unique referral link and track your earnings in real time.
                    </p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center bg-slate-50 rounded-2xl p-6">
                    <div><p className="text-2xl font-bold text-violet-600">30%</p><p className="text-xs text-slate-500 mt-1">Commission per sale</p></div>
                    <div><p className="text-2xl font-bold text-violet-600">∞</p><p className="text-xs text-slate-500 mt-1">No earning cap</p></div>
                    <div><p className="text-2xl font-bold text-violet-600">Live</p><p className="text-xs text-slate-500 mt-1">Real-time tracking</p></div>
                </div>
                {applied ? (
                    <div className="flex items-center gap-2 justify-center text-emerald-600 font-medium">
                        <Check size={18} /> Application submitted! We'll review it shortly.
                    </div>
                ) : (
                    <button onClick={applyForAffiliate} disabled={applying}
                        className="w-full py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition disabled:opacity-60">
                        {applying ? 'Applying...' : 'Apply to Become an Affiliate'}
                    </button>
                )}
            </div>
        )
    }

    if (affiliate.status === 'pending') {
        return (
            <div className="max-w-lg mx-auto py-16 text-center space-y-4">
                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto">
                    <AlertCircle size={32} className="text-amber-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Application Under Review</h2>
                <p className="text-slate-500 text-sm">Your affiliate application is pending approval. We'll notify you once it's reviewed — usually within 24 hours.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Clicks', value: totalClicks, icon: Users, color: 'text-blue-600 bg-blue-50' },
                    { label: 'Conversions', value: conversions, icon: TrendingUp, color: 'text-violet-600 bg-violet-50' },
                    { label: 'Total Earned', value: `$${affiliate.total_earnings.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
                    { label: 'Available to Pay', value: `$${pendingEarnings.toFixed(2)}`, icon: DollarSign, color: 'text-amber-600 bg-amber-50' },
                ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-2xl border shadow-sm p-5 flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.color}`}>
                            <stat.icon size={20} />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                            <p className="text-xs text-slate-500">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Referral Link */}
            <div className="bg-white rounded-2xl border shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
                        <Link2 size={20} className="text-violet-600" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-900">Your Referral Link</h2>
                        <p className="text-xs text-slate-500">Earn {affiliate.commission_percent}% commission on every successful purchase</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="flex-1 px-4 py-3 bg-slate-50 border rounded-xl text-sm text-slate-600 font-mono truncate">
                        {referralLink}
                    </div>
                    <button onClick={copyLink}
                        className={`px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-2 transition ${copied ? 'bg-emerald-600 text-white' : 'bg-violet-600 text-white hover:bg-violet-700'}`}>
                        {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy</>}
                    </button>
                </div>

                {/* Social Share */}
                <div className="mt-4 flex gap-2">
                    <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Checkout this course! 🚀')}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex-1 py-2 bg-sky-50 border border-sky-200 text-sky-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-sky-100 transition">
                        <ExternalLink size={14} /> Share on Twitter
                    </a>
                    <a href={`https://wa.me/?text=${encodeURIComponent('Check out this course: ' + referralLink)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex-1 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-emerald-100 transition">
                        <ExternalLink size={14} /> Share on WhatsApp
                    </a>
                </div>
            </div>

            {/* Referrals Table */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="p-5 border-b flex items-center justify-between">
                    <h2 className="font-bold text-slate-900">Referral Activity</h2>
                    {pendingEarnings >= 50 && (
                        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
                            Request Payout (${pendingEarnings.toFixed(2)})
                        </button>
                    )}
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="text-left px-5 py-3 text-slate-500 font-semibold">Course</th>
                            <th className="text-left px-5 py-3 text-slate-500 font-semibold">Date</th>
                            <th className="text-left px-5 py-3 text-slate-500 font-semibold">Status</th>
                            <th className="text-right px-5 py-3 text-slate-500 font-semibold">Commission</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {referrals.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-5 py-12 text-center text-slate-400">
                                    <Link2 size={28} className="mx-auto mb-2 opacity-30" />
                                    <p>No referrals yet — start sharing your link!</p>
                                </td>
                            </tr>
                        ) : referrals.map(r => (
                            <tr key={r.id} className="hover:bg-slate-50 transition">
                                <td className="px-5 py-4 text-slate-700">{r.courses?.title || 'General referral'}</td>
                                <td className="px-5 py-4 text-slate-400">{new Date(r.click_at).toLocaleDateString()}</td>
                                <td className="px-5 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${r.status === 'converted' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                        }`}>{r.status}</span>
                                </td>
                                <td className="px-5 py-4 text-right font-semibold text-slate-900">
                                    {r.commission_amount ? `$${r.commission_amount.toFixed(2)}` : '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
