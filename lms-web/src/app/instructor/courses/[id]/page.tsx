import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Plus, GripVertical, Settings2, Video, FileText, CheckCircle2 } from "lucide-react"

export default async function CourseBuilderPage({ params }: { params: Promise<{ id: string }> }) {

    const { id } = await params
    const supabase = await createClient()

    // Fetch the course and its highly nested curriculum (sections -> lessons)
    const { data: course } = await supabase
        .from('courses')
        .select(`
            *,
            course_sections (
                id, title, order_index,
                lessons (
                    id, title, type, order_index, is_free_preview
                )
            )
        `)
        .eq('id', id)
        .single()

    if (!course) {
        notFound()
    }

    // Sort sections explicitly
    const sections = (course.course_sections || []).sort((a: any, b: any) => a.order_index - b.order_index)

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-24">

            {/* Header Actions */}
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border sticky top-20 z-10">
                <div className="flex items-center gap-4">
                    <Link
                        href="/instructor/courses"
                        className="p-2 text-slate-500 hover:text-slate-900 transition hover:bg-slate-50 rounded-lg"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-slate-900">{course.title}</h1>
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold uppercase">
                                {course.status}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">/{course.slug}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border rounded-lg text-slate-700 hover:bg-slate-50 transition text-sm font-medium">
                        <Settings2 size={16} />
                        Settings
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition text-sm font-medium">
                        <Save size={16} />
                        Save Draft
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-medium">
                        <CheckCircle2 size={16} />
                        Publish Course
                    </button>
                </div>
            </div>

            {/* Curriculum Builder */}
            <div className="bg-slate-100 p-8 rounded-2xl border-2 border-dashed border-slate-300">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Curriculum</h2>
                        <p className="text-slate-500 text-sm">Organize your course into sections and lessons.</p>
                    </div>
                </div>

                {/* Sections List */}
                <div className="space-y-6">
                    {sections.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200">
                            <p className="text-slate-500 font-medium">Your course curriculum is empty.</p>
                            <p className="text-sm text-slate-400 mt-1">Start by adding your first section.</p>
                        </div>
                    ) : (
                        sections.map((section: any) => (
                            <div key={section.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transform transition hover:shadow-md">
                                {/* Section Header */}
                                <div className="bg-slate-50 border-b p-4 flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <GripVertical size={18} className="text-slate-300 cursor-move hover:text-slate-500" />
                                        <span className="font-semibold text-slate-800">
                                            Section {section.order_index + 1}: {section.title}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
                                        <button className="text-red-500 hover:text-red-600 text-sm font-medium">Delete</button>
                                    </div>
                                </div>

                                {/* Lessons within Section */}
                                <div className="p-4 space-y-2">
                                    {(section.lessons || []).sort((a: any, b: any) => a.order_index - b.order_index).map((lesson: any) => (
                                        <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg bg-white hover:border-blue-300 transition group/lesson cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                <GripVertical size={16} className="text-slate-200 cursor-move hover:text-slate-400" />
                                                <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-500">
                                                    {lesson.type === 'video' ? <Video size={16} /> : <FileText size={16} />}
                                                </div>
                                                <span className="text-sm font-medium text-slate-700">
                                                    {lesson.order_index + 1}. {lesson.title}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {lesson.is_free_preview && (
                                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded-sm border border-blue-100">Free Preview</span>
                                                )}
                                                <button className="text-slate-400 hover:text-blue-600 transition opacity-0 group-hover/lesson:opacity-100">
                                                    Edit Content
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    <button className="w-full mt-2 py-3 border-2 border-dashed border-slate-200 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300 transition flex justify-center items-center gap-2">
                                        <Plus size={16} />
                                        Add Lesson
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-6 flex justify-center">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 shadow-sm rounded-lg text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition font-medium">
                        <Plus size={18} />
                        New Section
                    </button>
                </div>
            </div>

        </div>
    )
}
