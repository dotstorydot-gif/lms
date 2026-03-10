import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { Clock, BarChart2, Star, BookOpen } from "lucide-react"

export default async function BrowseCoursesPage() {
    const supabase = await createClient()

    const { data: courses } = await supabase
        .from('courses')
        .select('id, title, subtitle, slug, thumbnail_url, price, is_free, level, instructor_id')
        .eq('status', 'published')
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Browse Courses</h1>
                <p className="text-slate-500 mt-2">Explore all available courses from our instructors.</p>
            </div>

            {(!courses || courses.length === 0) ? (
                <div className="bg-white rounded-2xl border shadow-sm p-16 text-center flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center">
                        <BookOpen size={32} className="text-violet-400" />
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-slate-800">No courses published yet</p>
                        <p className="text-slate-500 text-sm mt-1">Your instructors are preparing amazing content. Check back soon!</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <Link key={course.id} href={`/student/courses/${course.id}`} className="group bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                            {/* Thumbnail */}
                            <div className="aspect-video bg-gradient-to-br from-violet-600 to-indigo-800 flex items-center justify-center">
                                {course.thumbnail_url ? (
                                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                                ) : (
                                    <BookOpen size={48} className="text-white/60" />
                                )}
                            </div>

                            {/* Course Info */}
                            <div className="p-5 flex flex-col gap-3">
                                <div>
                                    <h3 className="font-bold text-slate-900 group-hover:text-violet-700 transition-colors line-clamp-2">{course.title}</h3>
                                    {course.subtitle && (
                                        <p className="text-slate-500 text-sm mt-1 line-clamp-2">{course.subtitle}</p>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <span className="flex items-center gap-1 capitalize">
                                        <BarChart2 size={12} />
                                        {course.level.replace('_', ' ')}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Star size={12} />
                                        New
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t">
                                    <span className="font-bold text-slate-900">
                                        {course.is_free ? <span className="text-emerald-600">Free</span> : `$${course.price?.toFixed(2)}`}
                                    </span>
                                    <span className="text-xs text-violet-700 font-medium bg-violet-50 px-2 py-1 rounded-full">
                                        Enroll Now →
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
