import { createClient } from "@/utils/supabase/server"
import { BookOpen, Users, DollarSign, TrendingUp } from "lucide-react"

export default async function AdminDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: profile } = await supabase
        .from('user_profiles')
        .select('tenant_id')
        .eq('id', user!.id)
        .single()

    const tenantId = profile?.tenant_id

    // Parallel data fetching
    const [coursesRes, studentsRes, revenueRes] = await Promise.all([
        supabase.from('courses').select('id, status', { count: 'exact' }).eq('tenant_id', tenantId),
        supabase.from('enrollments').select('id', { count: 'exact' }).eq('tenant_id', tenantId),
        supabase.from('orders').select('amount').eq('tenant_id', tenantId).eq('status', 'completed'),
    ])

    const totalRevenue = (revenueRes.data || []).reduce((sum, o) => sum + (o.amount || 0), 0)
    const publishedCourses = (coursesRes.data || []).filter(c => c.status === 'published').length

    const stats = [
        { label: 'Total Courses', value: coursesRes.count || 0, sub: `${publishedCourses} published`, icon: BookOpen, color: 'bg-violet-50 text-violet-600' },
        { label: 'Total Students', value: studentsRes.count || 0, sub: 'enrolled across all courses', icon: Users, color: 'bg-blue-50 text-blue-600' },
        { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, sub: 'from completed orders', icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
        { label: 'Growth', value: '+0%', sub: 'this month', icon: TrendingUp, color: 'bg-amber-50 text-amber-600' },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Academy Dashboard</h1>
                <p className="text-slate-500 mt-1">Your academy at a glance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                {stats.map(stat => (
                    <div key={stat.label} className="bg-white rounded-2xl border shadow-sm p-6">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.color}`}>
                            <stat.icon size={22} />
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                        <p className="text-sm font-medium text-slate-700 mt-0.5">{stat.label}</p>
                        <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>
                    </div>
                ))}
            </div>

            {/* Recent Enrollments */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                    <h2 className="text-lg font-semibold text-slate-900">Recent Enrollments</h2>
                </div>
                <div className="p-8 text-center text-slate-400">
                    <Users size={36} className="mx-auto mb-3 text-slate-200" />
                    <p>Enrollment data will appear here as students join your courses.</p>
                </div>
            </div>
        </div>
    )
}
