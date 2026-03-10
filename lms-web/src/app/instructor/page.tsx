import { createClient } from "@/utils/supabase/server"
import { Users, BookOpen, Star, DollarSign } from "lucide-react"

export default async function InstructorDashboardOverview() {
    const supabase = await createClient()

    // Fetch quick metrics for the currently logged in Instructor
    // Requires the auth context from the layout
    const { count: courseCount } = await supabase.from('courses').select('*', { count: 'exact', head: true })

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
                    <p className="text-slate-500 mt-2">Welcome back! Here's an overview of your teaching performance.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 group-hover:text-emerald-500 transition-transform duration-500">
                        <BookOpen size={64} />
                    </div>
                    <span className="text-sm font-medium text-slate-500 relative z-10">Active Courses</span>
                    <span className="text-3xl font-bold text-slate-900 mt-3 relative z-10">{courseCount || 0}</span>
                </div>

                <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 group-hover:text-amber-500 transition-transform duration-500">
                        <Users size={64} />
                    </div>
                    <span className="text-sm font-medium text-slate-500 relative z-10">Total Students</span>
                    <span className="text-3xl font-bold text-slate-900 mt-3 relative z-10">0</span>
                </div>

                <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 group-hover:text-yellow-500 transition-transform duration-500">
                        <Star size={64} />
                    </div>
                    <span className="text-sm font-medium text-slate-500 relative z-10">Average Rating</span>
                    <span className="text-3xl font-bold text-slate-900 mt-3 relative z-10">-- / 5.0</span>
                </div>

                <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 group-hover:text-green-500 transition-transform duration-500">
                        <DollarSign size={64} />
                    </div>
                    <span className="text-sm font-medium text-slate-500 relative z-10">Total Revenue</span>
                    <span className="text-3xl font-bold text-slate-900 mt-3 relative z-10">$0.00</span>
                </div>
            </div>

            {/* Data tables container */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Enrollments */}
                <div className="bg-white rounded-2xl border shadow-sm overflow-hidden lg:col-span-2 flex flex-col">
                    <div className="p-6 border-b">
                        <h3 className="text-lg font-semibold text-slate-900">Recent Enrollments</h3>
                    </div>
                    <div className="p-12 text-center text-slate-500 flex-1 flex flex-col justify-center items-center">
                        <Users size={32} className="text-slate-300 mb-3" />
                        <p>No recent student activity.</p>
                        <p className="text-sm mt-1">When students enroll in your courses, they will appear here.</p>
                    </div>
                </div>

                {/* Quick Actions / Notifications */}
                <div className="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b">
                        <h3 className="text-lg font-semibold text-slate-900">Notifications</h3>
                    </div>
                    <div className="p-8 text-center text-slate-500 flex-1 flex justify-center items-center">
                        You're all caught up!
                    </div>
                </div>
            </div>

        </div>
    )
}
