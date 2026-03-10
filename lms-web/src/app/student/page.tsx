import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { BookOpen, CheckSquare, Award, Clock } from "lucide-react"

export default async function StudentDashboard() {
    const supabase = await createClient()
    const { count: publishedCourses } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published')

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back! 👋</h1>
                <p className="text-slate-500 mt-2">Pick up where you left off or discover new courses.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Courses Enrolled', value: '0', icon: BookOpen, color: 'bg-violet-50 text-violet-600' },
                    { label: 'Lessons Completed', value: '0', icon: CheckSquare, color: 'bg-emerald-50 text-emerald-600' },
                    { label: 'Certificates Earned', value: '0', icon: Award, color: 'bg-amber-50 text-amber-600' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-2xl border shadow-sm p-6 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                            <p className="text-sm text-slate-500">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Continue Learning */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-slate-900">Continue Learning</h3>
                    <Link href="/student/my-learning" className="text-sm text-violet-600 hover:underline font-medium">View All</Link>
                </div>
                <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
                    <Clock size={36} className="text-slate-200" />
                    <p className="font-medium text-slate-600">No courses in progress yet</p>
                    <Link href="/student/courses" className="mt-2 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition">
                        Browse {publishedCourses || 0} Available Courses
                    </Link>
                </div>
            </div>

            {/* Available Courses Preview */}
            {(publishedCourses ?? 0) > 0 && (
                <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                    <div className="p-6 border-b flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-slate-900">Explore Courses</h3>
                        <Link href="/student/courses" className="text-sm text-violet-600 hover:underline font-medium">See All</Link>
                    </div>
                </div>
            )}
        </div>
    )
}
