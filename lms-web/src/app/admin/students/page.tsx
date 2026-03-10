import { createClient } from "@/utils/supabase/server"
import { Users, BookOpen, Clock } from "lucide-react"

export default async function AdminStudentsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('user_profiles').select('tenant_id').eq('id', user!.id).single()

    const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
            id, enrolled_at, completed_at,
            user_profiles (id, full_name, avatar_url),
            courses (id, title)
        `)
        .eq('tenant_id', profile?.tenant_id)
        .order('enrolled_at', { ascending: false })
        .limit(100)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Students</h1>
                    <p className="text-slate-500 mt-1">Manage and monitor your student base.</p>
                </div>
                <div className="bg-white border rounded-xl px-5 py-3 shadow-sm flex items-center gap-2 text-slate-700">
                    <Users size={18} />
                    <span className="font-semibold">{enrollments?.length || 0}</span>
                    <span className="text-slate-400 text-sm">total enrollments</span>
                </div>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="text-left px-6 py-4 text-slate-600 font-semibold">Student</th>
                            <th className="text-left px-6 py-4 text-slate-600 font-semibold">Course</th>
                            <th className="text-left px-6 py-4 text-slate-600 font-semibold">Enrolled</th>
                            <th className="text-left px-6 py-4 text-slate-600 font-semibold">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {(!enrollments || enrollments.length === 0) ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-16 text-center text-slate-400">
                                    <Users size={36} className="mx-auto mb-3 text-slate-200" />
                                    <p>No students enrolled yet.</p>
                                </td>
                            </tr>
                        ) : (
                            enrollments.map((enrollment: any) => (
                                <tr key={enrollment.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-semibold text-sm">
                                                {enrollment.user_profiles?.full_name?.charAt(0) || '?'}
                                            </div>
                                            <span className="font-medium text-slate-900">
                                                {enrollment.user_profiles?.full_name || 'Unknown'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <BookOpen size={14} />
                                            {enrollment.courses?.title || '—'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {new Date(enrollment.enrolled_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        {enrollment.completed_at ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                                                Completed
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                                                <Clock size={10} /> In Progress
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
