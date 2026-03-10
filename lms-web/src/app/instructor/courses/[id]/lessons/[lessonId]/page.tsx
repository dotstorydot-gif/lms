import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Video, FileText, UploadCloud, Save } from "lucide-react"

export default async function LessonEditorPage({ params }: { params: Promise<{ id: string, lessonId: string }> }) {

    const { id, lessonId } = await params
    const supabase = await createClient()

    // Fetch the specific lesson
    const { data: lesson } = await supabase
        .from('lessons')
        .select(`
            *,
            course_sections (
                course_id
            )
        `)
        .eq('id', lessonId)
        .single()

    // Ensure lesson exists and belongs to the current course
    if (!lesson || lesson.course_sections?.course_id !== id) {
        notFound()
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-24">

            <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/instructor/courses/${id}`}
                        className="p-2 text-slate-500 hover:text-slate-900 transition hover:bg-slate-50 rounded-lg"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Editing Lesson: {lesson.title}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            {lesson.type === 'video' ? <Video size={14} className="text-blue-500" /> : <FileText size={14} className="text-emerald-500" />}
                            <span className="text-sm font-medium text-slate-500 capitalize">{lesson.type} Lesson</span>
                        </div>
                    </div>
                </div>

                <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition font-medium text-sm shadow-sm">
                    <Save size={16} />
                    Save Content
                </button>
            </div>

            {/* Content Area Based on Type */}
            <div className="bg-white p-8 rounded-2xl border shadow-sm">

                {lesson.type === 'video' && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-bold text-slate-900">Video Content</h2>
                        <p className="text-sm text-slate-500 -mt-1">Provide a link to your hosted video (Vimeo Pro, YouTube Unlisted, or AWS S3 direct link).</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Video URL</label>
                                <input
                                    type="url"
                                    placeholder="https://vimeo.com/..."
                                    defaultValue={lesson.video_url || ''}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                />
                            </div>

                            {/* Video Preview Area */}
                            {lesson.video_url ? (
                                <div className="mt-4 aspect-video bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border">
                                    <p className="text-white font-medium">Video preview will appear here</p>
                                </div>
                            ) : (
                                <div className="mt-4 aspect-video bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400">
                                    <Video size={48} className="mb-4 opacity-50" />
                                    <p>No video URL provided yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {lesson.type === 'article' && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-bold text-slate-900">Article Content</h2>
                        <p className="text-sm text-slate-500 -mt-1">Write your rich-text article for students to read.</p>

                        <div className="border border-slate-300 rounded-lg overflow-hidden">
                            <div className="bg-slate-50 border-b p-2 flex gap-2">
                                {/* Placeholder toolbar */}
                                <div className="h-8 w-8 bg-white rounded border shadow-sm flex items-center justify-center font-bold text-slate-700 cursor-pointer hover:bg-slate-100">B</div>
                                <div className="h-8 w-8 bg-white rounded border shadow-sm flex items-center justify-center italic text-slate-700 cursor-pointer hover:bg-slate-100">I</div>
                                <div className="h-8 w-8 bg-white rounded border shadow-sm flex items-center justify-center underline text-slate-700 cursor-pointer hover:bg-slate-100">U</div>
                            </div>
                            <textarea
                                className="w-full h-96 p-4 outline-none resize-y prose max-w-none"
                                placeholder="Start writing your lesson..."
                                defaultValue={lesson.content || ''}
                            />
                        </div>
                    </div>
                )}

            </div>

            {/* Downloadable Resources section */}
            <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Downloadable Resources</h2>
                        <p className="text-sm text-slate-500 mt-1">Attach PDFs, ZIP files, or starter code for this lesson.</p>
                    </div>
                </div>

                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition cursor-pointer flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                        <UploadCloud size={24} />
                    </div>
                    <div>
                        <p className="text-slate-700 font-medium">Click to upload files</p>
                        <p className="text-slate-400 text-sm mt-1">SVG, PNG, JPG, PDF or ZIP (max. 10MB)</p>
                    </div>
                </div>
            </div>

        </div>
    )
}
