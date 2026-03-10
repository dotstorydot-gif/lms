import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { BookOpen, CheckSquare, ChevronRight, PlayCircle, FileText, Award } from "lucide-react"
import EnrollButton from "@/components/EnrollButton"

export default async function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = await params
    const supabase = await createClient()

    const { data: course } = await supabase
        .from('courses')
        .select(`
      *,
      course_sections (
        id, title, order_index,
        lessons (
          id, title, type, video_duration, order_index, is_free_preview
        )
      )
    `)
        .eq('id', courseId)
        .eq('status', 'published')
        .single()

    if (!course) notFound()

    const sections = (course.course_sections || []).sort((a: any, b: any) => a.order_index - b.order_index)
    const totalLessons = sections.reduce((acc: number, s: any) => acc + (s.lessons?.length || 0), 0)

    // Check if current user is enrolled
    const { data: { user } } = await supabase.auth.getUser()
    let isEnrolled = false
    if (user) {
        const { data: enrollment } = await supabase
            .from('enrollments')
            .select('id')
            .eq('user_id', user.id)
            .eq('course_id', courseId)
            .single()
        isEnrolled = !!enrollment
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Course Header */}
            <div className="bg-gradient-to-br from-indigo-900 to-violet-900 text-white rounded-2xl p-8">
                <p className="text-indigo-300 text-sm font-medium mb-3 uppercase tracking-wider capitalize">
                    {course.level?.replace('_', ' ')}
                </p>
                <h1 className="text-3xl font-bold">{course.title}</h1>
                {course.subtitle && <p className="text-indigo-200 mt-2 text-lg">{course.subtitle}</p>}

                <div className="flex gap-6 mt-6 text-sm text-indigo-300">
                    <span className="flex items-center gap-2"><BookOpen size={16} /> {sections.length} sections</span>
                    <span className="flex items-center gap-2"><CheckSquare size={16} /> {totalLessons} lessons</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Curriculum */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold text-slate-900">Course Curriculum</h2>
                    {sections.map((section: any) => (
                        <div key={section.id} className="bg-white rounded-xl border shadow-sm overflow-hidden">
                            <div className="bg-slate-50 border-b px-5 py-4">
                                <h3 className="font-semibold text-slate-800">
                                    Section {section.order_index + 1}: {section.title}
                                </h3>
                            </div>
                            <div className="divide-y">
                                {(section.lessons || [])
                                    .sort((a: any, b: any) => a.order_index - b.order_index)
                                    .map((lesson: any) => (
                                        <div key={lesson.id} className="flex items-center gap-4 px-5 py-3.5">
                                            {lesson.type === 'video' ? (
                                                <PlayCircle size={18} className="text-violet-500 flex-shrink-0" />
                                            ) : (
                                                <FileText size={18} className="text-slate-400 flex-shrink-0" />
                                            )}
                                            <span className="text-sm text-slate-700 flex-1">{lesson.title}</span>
                                            {lesson.is_free_preview && (
                                                <span className="text-xs text-violet-700 font-medium bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100">
                                                    Preview
                                                </span>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Enrollment Card */}
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl border shadow-sm p-6 sticky top-24 space-y-5">
                        <div className="aspect-video rounded-xl bg-gradient-to-br from-violet-600 to-indigo-800 flex items-center justify-center">
                            {course.thumbnail_url ? (
                                <img src={course.thumbnail_url} className="w-full h-full object-cover rounded-xl" alt={course.title} />
                            ) : (
                                <PlayCircle size={48} className="text-white/60" />
                            )}
                        </div>

                        <div className="text-3xl font-bold text-slate-900">
                            {course.is_free ? (
                                <span className="text-emerald-600">Free</span>
                            ) : (
                                `$${course.price?.toFixed(2) || '0.00'}`
                            )}
                        </div>

                        <EnrollButton
                            courseId={courseId}
                            price={course.price}
                            isFree={course.is_free}
                            isEnrolled={isEnrolled}
                        />

                        <div className="space-y-2.5 text-sm text-slate-600 pt-2 border-t">
                            <p className="flex items-center gap-2"><CheckSquare size={16} className="text-emerald-500" /> {totalLessons} on-demand lessons</p>
                            <p className="flex items-center gap-2"><Award size={16} className="text-amber-500" /> Certificate on completion</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
