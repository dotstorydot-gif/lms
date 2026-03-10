import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { BookOpen, CheckCircle, Clock, ChevronRight } from "lucide-react"

export default async function MyLearningPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
            id, enrolled_at, completed_at,
            courses (id, title, thumbnail_url, level, instructor_id,
                course_sections (
                    lessons (id)
                )
            )
        `)
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .order('enrolled_at', { ascending: false })

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Learning</h1>
                <p className="text-slate-500 mt-2">Track your progress across all enrolled courses.</p>
            </div>

            {(!enrollments || enrollments.length === 0) ? (
                <div className="bg-white rounded-2xl border shadow-sm p-16 text-center flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center">
                        <BookOpen size={32} className="text-violet-400" />
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-slate-800">No courses enrolled yet</p>
                        <p className="text-slate-500 text-sm mt-1">Browse available courses and start learning today.</p>
                    </div>
                    <Link href="/student/courses" className="px-5 py-2.5 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition text-sm">
                        Browse Courses
                    </Link>
                </div>
            ) : (
                <div className="grid gap-5">
                    {enrollments.map((enrollment: any) => {
                        const course = enrollment.courses
                        const totalLessons = (course?.course_sections || [])
                            .reduce((acc: number, s: any) => acc + (s.lessons?.length || 0), 0)
                        const isCompleted = !!enrollment.completed_at

                        return (
                            <div key={enrollment.id} className="bg-white rounded-2xl border shadow-sm p-6 flex items-center gap-6 group hover:shadow-md transition">
                                {/* Thumbnail */}
                                <div className="w-24 h-16 bg-gradient-to-br from-violet-600 to-indigo-800 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                                    {course?.thumbnail_url ? (
                                        <img src={course.thumbnail_url} className="w-full h-full object-cover" alt={course.title} />
                                    ) : (
                                        <BookOpen size={24} className="text-white/60" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-900 truncate">{course?.title}</h3>
                                    <div className="flex items-center gap-4 mt-1.5">
                                        <span className="text-xs text-slate-500 flex items-center gap-1.5">
                                            <BookOpen size={12} /> {totalLessons} lessons
                                        </span>
                                        {isCompleted ? (
                                            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                                                <CheckCircle size={12} /> Completed
                                            </span>
                                        ) : (
                                            <span className="text-xs text-slate-500 flex items-center gap-1.5">
                                                <Clock size={12} /> In Progress
                                            </span>
                                        )}
                                    </div>
                                    {/* Progress bar */}
                                    <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden w-full max-w-xs">
                                        <div className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500 w-full' : 'bg-violet-500 w-1/4'}`} />
                                    </div>
                                </div>

                                <Link
                                    href={`/student/courses/${course?.id}/learn`}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition font-medium text-sm flex-shrink-0"
                                >
                                    {isCompleted ? 'Review' : 'Continue'}
                                    <ChevronRight size={16} />
                                </Link>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
