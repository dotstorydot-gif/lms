import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { CheckCircle, CreditCard, Building2, Zap, Shield, Star, Plus } from "lucide-react"

const PLAN_TIERS = [
    {
        id: 'starter',
        name: 'Starter',
        price: 49,
        color: 'from-slate-600 to-slate-700',
        accent: 'text-slate-600 bg-slate-50 border-slate-200',
        icon: Zap,
        features: [
            'Up to 10 courses',
            '500 students',
            '5 GB storage',
            'Quizzes & certificates',
            'Email notifications',
        ],
    },
    {
        id: 'pro',
        name: 'Professional',
        price: 149,
        color: 'from-violet-600 to-indigo-700',
        accent: 'text-violet-600 bg-violet-50 border-violet-200',
        icon: Star,
        popular: true,
        features: [
            'Unlimited courses',
            '5,000 students',
            '50 GB storage',
            'Live classes (Zoom)',
            'Affiliate program',
            'Custom branding',
            'Custom domain',
        ],
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 399,
        color: 'from-amber-500 to-orange-600',
        accent: 'text-amber-600 bg-amber-50 border-amber-200',
        icon: Shield,
        features: [
            'Unlimited everything',
            'Unlimited students',
            '500 GB storage',
            'Priority support',
            'Stripe Connect payouts',
            'Custom contract & SLA',
            'White-label mobile app',
        ],
    },
]

export default async function PlansPage() {
    const supabase = await createClient()

    // Fetch all tenants and their current plan
    const { data: tenants } = await supabase
        .from('tenants')
        .select('id, name, plan, is_active, created_at')
        .order('created_at', { ascending: false })

    // Group tenants by plan
    const tenantsByPlan = (tenants || []).reduce((acc: Record<string, number>, t) => {
        const plan = t.plan || 'starter'
        acc[plan] = (acc[plan] || 0) + 1
        return acc
    }, {})

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Subscription Plans</h1>
                    <p className="text-slate-500 mt-1">Manage SaaS tiers and tenant plan assignments.</p>
                </div>
                <div className="flex items-center gap-3 bg-white border shadow-sm rounded-xl px-5 py-3">
                    <CreditCard size={18} className="text-violet-500" />
                    <span className="text-sm font-semibold text-slate-700">{tenants?.length || 0} active academies</span>
                </div>
            </div>

            {/* Plan Tier Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PLAN_TIERS.map(plan => (
                    <div key={plan.id} className={`relative bg-white rounded-2xl border shadow-sm overflow-hidden ${plan.popular ? 'ring-2 ring-violet-500' : ''}`}>
                        {plan.popular && (
                            <div className="absolute top-0 left-0 right-0 text-center py-1.5 bg-violet-600 text-white text-xs font-bold tracking-wide">
                                MOST POPULAR
                            </div>
                        )}
                        <div className={`p-6 bg-gradient-to-br ${plan.color} text-white ${plan.popular ? 'pt-10' : ''}`}>
                            <div className="flex items-center justify-between">
                                <plan.icon size={24} />
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full bg-white/20`}>
                                    {tenantsByPlan[plan.id] || 0} academies
                                </span>
                            </div>
                            <h2 className="text-xl font-bold mt-3">{plan.name}</h2>
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-4xl font-bold">${plan.price}</span>
                                <span className="text-white/70 text-sm">/mo per academy</span>
                            </div>
                        </div>
                        <div className="p-6 space-y-3">
                            {plan.features.map(f => (
                                <div key={f} className="flex items-center gap-2 text-sm text-slate-700">
                                    <CheckCircle size={15} className="text-emerald-500 flex-shrink-0" />
                                    {f}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Tenants Table */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <Building2 size={18} />
                        Academy Plan Assignments
                    </h2>
                    <Link href="/super-admin/tenants/new"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                        <Plus size={16} /> New Academy
                    </Link>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="text-left px-6 py-3.5 font-semibold text-slate-600">Academy</th>
                            <th className="text-left px-6 py-3.5 font-semibold text-slate-600">Plan</th>
                            <th className="text-left px-6 py-3.5 font-semibold text-slate-600">Status</th>
                            <th className="text-left px-6 py-3.5 font-semibold text-slate-600">Since</th>
                            <th className="text-right px-6 py-3.5 font-semibold text-slate-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {(!tenants || tenants.length === 0) ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-14 text-center text-slate-400">
                                    <Building2 size={32} className="mx-auto mb-2 text-slate-200" />
                                    <p>No academies yet.</p>
                                </td>
                            </tr>
                        ) : tenants.map(tenant => {
                            const plan = tenant.plan || 'starter'
                            const tier = PLAN_TIERS.find(p => p.id === plan) || PLAN_TIERS[0]
                            return (
                                <tr key={tenant.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br ${tier.color}`}>
                                                {tenant.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-slate-900">{tenant.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${tier.accent}`}>
                                            <tier.icon size={11} />
                                            {tier.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${tenant.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                            {tenant.is_active ? 'Active' : 'Suspended'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">
                                        {new Date(tenant.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/super-admin/tenants/${tenant.id}`}
                                            className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                            Manage →
                                        </Link>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
