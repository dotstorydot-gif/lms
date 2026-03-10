import { createClient } from "@/utils/supabase/server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Circle, PlayCircle, FileText, ChevronLeft, ChevronRight, Award } from "lucide-react"

export default async function LearnPage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Fetch full course curriculum
    const { data: course } = await supabase
        .from('courses')
        .select(`
            id, title,
            course_sections (
                id, title, order_index,
                lessons (id, title, type, order_index, is_free_preview, video_url, content, video_duration)
            )
        `)
        .eq('id', courseId)
        .single()

    if (!course) notFound()

    // Fetch enrollment + progress
    const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id, completed_at')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single()

    const { data: progressData } = enrollment ? await supabase
        .from('lesson_progress')
        .select('lesson_id, is_completed')
        .eq('enrollment_id', enrollment.id) : { data: [] }

    const completedLessonIds = new Set((progressData || []).filter((p: any) => p.is_completed).map((p: any) => p.lesson_id))

    const sections = (course.course_sections || []).sort((a: any, b: any) => a.order_index - b.order_index)
    const allLessons = sections.flatMap((s: any) => (s.lessons || []).sort((a: any, b: any) => a.order_index - b.order_index))

    // Default to first lesson
    const currentLesson = allLessons[0] as any

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col">
            {/* Top navigation bar */}
            <header className="bg-slate-800 border-b border-slate-700 h-14 flex items-center justify-between px-6 z-20 sticky top-0">
                <div className="flex items-center gap-4">
                    <Link href="/student/courses" className="text-slate-400 hover:text-white transition text-sm flex items-center gap-2">
                        <ChevronLeft size={16} />
                        Back to Courses
                    </Link>
                    <div className="h-4 w-px bg-slate-600" />
                    <h1 className="text-white font-semibold text-sm truncate max-w-xs">{course.title}</h1>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-sm text-slate-400">
                        {completedLessonIds.size} / {allLessons.length} lessons completed
                    </div>
                    {enrollment?.completed_at && (
                        <span className="flex items-center gap-2 bg-amber-500/20 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-amber-500/30">
                            <Award size={14} /> Certificate Earned
                        </span>
                    )}
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar: Curriculum */}
                <aside className="w-72 bg-slate-800 border-r border-slate-700 overflow-y-auto flex-shrink-0">
                    <div className="p-4 border-b border-slate-700">
                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Course Content</p>
                    </div>
                    <div className="py-2">
                        {sections.map((section: any) => (
                            <div key={section.id}>
                                <div className="px-4 py-2.5 bg-slate-700/50">
                                    <p className="text-slate-300 text-sm font-semibold">{section.title}</p>
                                </div>
                                {(section.lessons || [])
                                    .sort((a: any, b: any) => a.order_index - b.order_index)
                                    .map((lesson: any) => (
                                        <div key={lesson.id} className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-700 transition border-l-2 ${lesson.id === currentLesson?.id ? 'border-violet-500 bg-slate-700' : 'border-transparent'
                                            }`}>
                                            {completedLessonIds.has(lesson.id) ? (
                                                <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
                                            ) : lesson.type === 'video' ? (
                                                <PlayCircle size={16} className="text-slate-400 flex-shrink-0" />
                                            ) : (
                                                <FileText size={16} className="text-slate-400 flex-shrink-0" />
                                            )}
                                            <span className={`text-sm flex-1 min-w-0 line-clamp-2 ${lesson.id === currentLesson?.id ? 'text-white' : 'text-slate-300'
                                                }`}>{lesson.title}</span>
                                        </div>
                                    ))}
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Main content: Lesson Viewer */}
                <main className="flex-1 overflow-y-auto bg-slate-900">
                    {currentLesson ? (
                        <div className="max-w-4xl mx-auto px-8 py-8">
                            {currentLesson.type === 'video' ? (
                                <div>
                                    <div className="aspect-video bg-black rounded-xl overflow-hidden mb-6 shadow-2xl">
                                        {currentLesson.video_url ? (
                                            <iframe src={currentLesson.video_url} className="w-full h-full" allowFullScreen />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-500">
                                                <PlayCircle size={64} className="opacity-30" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl p-8 mb-6 prose prose-lg max-w-none">
                                    {currentLesson.content || <p className="text-slate-400 italic">No content yet for this lesson.</p>}
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{currentLesson.title}</h2>
                                    <p className="text-slate-400 capitalize mt-1">{currentLesson.type} lesson</p>
                                </div>

                                <button className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition font-semibold shadow-lg">
                                    <CheckCircle size={18} />
                                    Mark Complete
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-500">
                            No lessons available yet.
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
