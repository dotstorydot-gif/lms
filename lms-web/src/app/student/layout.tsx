import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Link from 'next/link'
import { LayoutDashboard, BookOpen, CheckSquare, Award, LogOut } from 'lucide-react'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    return (
        <div className="min-h-screen flex bg-slate-50">
            <aside className="w-64 bg-indigo-950 text-white flex-shrink-0 flex flex-col">
                <div className="p-6">
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        Learn<span className="text-violet-400">Hub</span>
                    </h1>
                </div>
                <nav className="mt-4 flex flex-col gap-1 px-4 flex-1">
                    <Link href="/student" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-violet-600 text-white transition">
                        <LayoutDashboard size={20} />
                        Dashboard
                    </Link>
                    <Link href="/student/courses" className="flex items-center gap-3 px-4 py-3 rounded-lg text-indigo-200 hover:bg-indigo-900 hover:text-white transition">
                        <BookOpen size={20} />
                        Browse Courses
                    </Link>
                    <Link href="/student/my-learning" className="flex items-center gap-3 px-4 py-3 rounded-lg text-indigo-200 hover:bg-indigo-900 hover:text-white transition">
                        <CheckSquare size={20} />
                        My Learning
                    </Link>
                    <Link href="/student/certificates" className="flex items-center gap-3 px-4 py-3 rounded-lg text-indigo-200 hover:bg-indigo-900 hover:text-white transition">
                        <Award size={20} />
                        Certificates
                    </Link>
                </nav>
                <div className="p-4">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-900/50 border border-indigo-800">
                        <div className="h-9 w-9 rounded-full bg-violet-500 flex items-center justify-center font-bold text-white text-sm">
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user.email}</p>
                            <p className="text-xs text-indigo-400">Student</p>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b flex items-center px-8 sticky top-0 z-10">
                    <h2 className="text-lg font-medium text-slate-800">Student Portal</h2>
                </header>
                <div className="flex-1 overflow-auto p-8">{children}</div>
            </main>
        </div>
    )
}
