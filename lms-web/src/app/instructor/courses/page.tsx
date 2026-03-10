import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { Plus, MoreVertical, Edit, Eye, Trash2 } from "lucide-react"

export default async function InstructorCoursesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch courses belonging strictly to this instructor
    // (In a real setup, we also filter by tenant_id based on the active session)
    const { data: courses } = await supabase
        .from('courses')
        .select('id, title, status, price, level, created_at')
        .eq('instructor_id', user?.id)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Courses</h1>
                    <p className="text-slate-500 mt-2">Manage your curriculum, edit content, and publish to the academy.</p>
                </div>
                <Link
                    href="/instructor/courses/new"
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-medium"
                >
                    <Plus size={20} />
                    Create Course
                </Link>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b text-sm text-slate-500 uppercase tracking-wider">
                            <th className="p-4 font-medium">Course Title</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium">Level</th>
                            <th className="p-4 font-medium">Price</th>
                            <th className="p-4 font-medium text-right">Settings</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {(!courses || courses.length === 0) && (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-slate-500 flex-1 flex flex-col justify-center items-center">
                                    <BookOpen size={48} className="text-slate-200 mb-4" />
                                    <p className="text-lg font-medium text-slate-900">No courses yet</p>
                                    <p className="mt-1">Click "Create Course" to start building your first curriculum.</p>
                                </td>
                            </tr>
                        )}
                        {courses?.map((course) => (
                            <tr key={course.id} className="hover:bg-slate-50 transition group">
                                <td className="p-4">
                                    <p className="font-semibold text-slate-900">{course.title}</p>
                                    <p className="text-sm text-slate-500">{new Date(course.created_at).toLocaleDateString()}</p>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                                ${course.status === 'published' ? 'bg-emerald-100 text-emerald-700' :
                                            course.status === 'draft' ? 'bg-amber-100 text-amber-700' :
                                                'bg-slate-100 text-slate-700'}
                            `}>
                                        {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                                    </span>
                                </td>
                                <td className="p-4 text-slate-600 capitalize">
                                    {course.level.replace('_', ' ')}
                                </td>
                                <td className="p-4 font-medium text-slate-800">
                                    {course.price ? `$${course.price.toFixed(2)}` : 'Free'}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link
                                            href={`/instructor/courses/${course.id}`}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                            title="Edit Course Builder"
                                        >
                                            <Edit size={18} />
                                        </Link>
                                        <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition" title="Preview">
                                            <Eye size={18} />
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
