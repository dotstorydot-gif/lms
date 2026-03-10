import { createClient } from "@/utils/supabase/server"
import { Users, Shield, GraduationCap, Building2, Search } from "lucide-react"

const roleColors: Record<string, string> = {
    super_admin: 'bg-red-50 text-red-700 border-red-200',
    tenant_admin: 'bg-violet-50 text-violet-700 border-violet-200',
    instructor: 'bg-blue-50 text-blue-700 border-blue-200',
    student: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

const roleIcons: Record<string, any> = {
    super_admin: Shield,
    tenant_admin: Building2,
    instructor: GraduationCap,
    student: Users,
}

export default async function GlobalUsersPage() {
    const supabase = await createClient()

    const { data: users, count } = await supabase
        .from('user_profiles')
        .select(`
            id, full_name, role, created_at,
            tenants (name)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(100)

    // Group counts by role
    const roleCounts = (users || []).reduce((acc: Record<string, number>, u) => {
        acc[u.role] = (acc[u.role] || 0) + 1
        return acc
    }, {})

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Global Users</h1>
                    <p className="text-slate-500 mt-1">All users across every academy on the platform.</p>
                </div>
                <div className="bg-white border rounded-xl px-5 py-3 shadow-sm text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Users size={16} className="text-blue-500" />
                    {count || 0} total users
                </div>
            </div>

            {/* Role breakdown */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { role: 'super_admin', label: 'Super Admins' },
                    { role: 'tenant_admin', label: 'Academy Admins' },
                    { role: 'instructor', label: 'Instructors' },
                    { role: 'student', label: 'Students' },
                ].map(({ role, label }) => {
                    const Icon = roleIcons[role]
                    return (
                        <div key={role} className="bg-white rounded-2xl border shadow-sm p-5 flex items-center gap-4">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border ${roleColors[role]}`}>
                                <Icon size={18} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{roleCounts[role] || 0}</p>
                                <p className="text-xs text-slate-500">{label}</p>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b">
                    <h2 className="text-base font-semibold text-slate-900">All Users</h2>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="text-left px-6 py-3.5 font-semibold text-slate-600">User</th>
                            <th className="text-left px-6 py-3.5 font-semibold text-slate-600">Role</th>
                            <th className="text-left px-6 py-3.5 font-semibold text-slate-600">Academy</th>
                            <th className="text-left px-6 py-3.5 font-semibold text-slate-600">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {(!users || users.length === 0) ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-14 text-center text-slate-400">
                                    <Users size={32} className="mx-auto mb-2 text-slate-200" />
                                    <p>No users found.</p>
                                </td>
                            </tr>
                        ) : users.map(u => {
                            const Icon = roleIcons[u.role] || Users
                            return (
                                <tr key={u.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${roleColors[u.role] || 'bg-slate-50 text-slate-600'}`}>
                                                {(u.full_name || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-slate-900">{u.full_name || <span className="text-slate-400 italic">No name</span>}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${roleColors[u.role] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                            <Icon size={11} />
                                            {u.role.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {(u.tenants as any)?.name || <span className="text-slate-300 italic">—</span>}
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">
                                        {new Date(u.created_at).toLocaleDateString()}
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
