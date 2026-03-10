import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Link from 'next/link'
import { LayoutDashboard, BookOpen, Users, DollarSign, LogOut } from 'lucide-react'

export default async function InstructorLayout({
    children,
}: {
    children: React.ReactNode
}) {

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // TODO: Add robust RLS/Role checks here.
    // For now, assuming anyone authenticated can access the Instructor routes for demonstration.

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-slate-900 text-white flex-shrink-0">
                <div className="p-6">
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        Teaching<span className="text-emerald-500">Hub</span>
                    </h1>
                </div>

                <nav className="mt-6 flex flex-col gap-2 px-4">
                    <Link href="/instructor" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition">
                        <LayoutDashboard size={20} />
                        Dashboard
                    </Link>
                    <Link href="/instructor/courses" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">
                        <BookOpen size={20} />
                        My Courses
                    </Link>
                    <Link href="/instructor/students" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">
                        <Users size={20} />
                        Students
                    </Link>
                    <Link href="/instructor/earnings" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">
                        <DollarSign size={20} />
                        Earnings
                    </Link>
                </nav>

                <div className="absolute bottom-0 w-64 p-4">
                    <form action="/auth/signout" method="post">
                        <button type="submit" className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition">
                            <LogOut size={20} />
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 bg-white border-b flex items-center justify-between px-8 z-10 sticky top-0">
                    <h2 className="text-lg font-medium text-slate-800">Instructor Portal</h2>
                    <div className="flex items-center gap-4">
                        <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border border-emerald-200 shadow-sm">
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>
                <div className="flex-1 overflow-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
