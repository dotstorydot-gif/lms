import { createClient } from "@/utils/supabase/server"
import { DollarSign, TrendingUp, ShoppingCart, Award } from "lucide-react"

export default async function RevenueAdminPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('user_profiles').select('tenant_id').eq('id', user!.id).single()

    const { data: orders } = await supabase
        .from('orders')
        .select(`
            id, amount, currency, status, created_at,
            courses (title),
            user_profiles (full_name)
        `)
        .eq('tenant_id', profile?.tenant_id)
        .order('created_at', { ascending: false })
        .limit(50)

    const completedOrders = (orders || []).filter(o => o.status === 'completed')
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.amount || 0), 0)
    const pendingRevenue = (orders || []).filter(o => o.status === 'pending').reduce((sum, o) => sum + (o.amount || 0), 0)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Revenue</h1>
                <p className="text-slate-500 mt-1">Track your academy's financial performance.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                    { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
                    { label: 'Pending Payments', value: `$${pendingRevenue.toFixed(2)}`, icon: TrendingUp, color: 'bg-amber-50 text-amber-600' },
                    { label: 'Total Orders', value: orders?.length || 0, icon: ShoppingCart, color: 'bg-violet-50 text-violet-600' },
                ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-2xl border shadow-sm p-6 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                            <stat.icon size={22} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                            <p className="text-sm text-slate-500">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                    <h2 className="text-lg font-semibold text-slate-900">Order History</h2>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="text-left px-6 py-4 text-slate-600 font-semibold">Student</th>
                            <th className="text-left px-6 py-4 text-slate-600 font-semibold">Course</th>
                            <th className="text-left px-6 py-4 text-slate-600 font-semibold">Amount</th>
                            <th className="text-left px-6 py-4 text-slate-600 font-semibold">Date</th>
                            <th className="text-left px-6 py-4 text-slate-600 font-semibold">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {(!orders || orders.length === 0) ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-14 text-center text-slate-400">
                                    <ShoppingCart size={36} className="mx-auto mb-3 text-slate-200" />
                                    <p>No orders yet.</p>
                                </td>
                            </tr>
                        ) : orders.map((order: any) => (
                            <tr key={order.id} className="hover:bg-slate-50 transition">
                                <td className="px-6 py-4 font-medium text-slate-900">{(order.user_profiles as any)?.full_name || '—'}</td>
                                <td className="px-6 py-4 text-slate-600">{(order.courses as any)?.title || '—'}</td>
                                <td className="px-6 py-4 font-semibold text-slate-900">${order.amount?.toFixed(2)}</td>
                                <td className="px-6 py-4 text-slate-500">{new Date(order.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${order.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                                            order.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                                                'bg-red-50 text-red-700'
                                        }`}>
                                        {order.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
