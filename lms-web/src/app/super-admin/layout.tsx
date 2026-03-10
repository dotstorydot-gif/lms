import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Link from 'next/link'
import { LayoutDashboard, Users, GraduationCap, Building2, CreditCard, Settings, LogOut } from 'lucide-react'

export default async function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode
}) {

    // Verify Super Admin Auth
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // TODO: Add strict RLS check that user has role 'super_admin'

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-slate-900 text-white flex-shrink-0">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-white tracking-tight">LMS<span className="text-blue-500">Super</span></h1>
                </div>

                <nav className="mt-6 flex flex-col gap-2 px-4">
                    <Link href="/super-admin" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
                        <LayoutDashboard size={20} />
                        Dashboard
                    </Link>
                    <Link href="/super-admin/tenants" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">
                        <Building2 size={20} />
                        Academies
                    </Link>
                    <Link href="/super-admin/plans" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">
                        <CreditCard size={20} />
                        Subscriptions
                    </Link>
                    <Link href="/super-admin/users" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition">
                        <Users size={20} />
                        Global Users
                    </Link>
                </nav>

                <div className="absolute bottom-0 w-64 p-4">
                    <form action="/auth/signout" method="post">
                        <button type="submit" className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition">
                            <LogOut size={20} />
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 bg-white border-b flex items-center justify-between px-8 z-10">
                    <h2 className="text-lg font-medium text-gray-800">Super Admin Portal</h2>
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
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
