import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import StudentNav from "./StudentNav"
import NotificationBell from "@/components/NotificationBell"

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Grab display name if available
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single()

    const displayName = profile?.full_name || user.email || ''
    const initials = displayName.charAt(0).toUpperCase()

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-indigo-950 text-white flex-shrink-0 flex flex-col">
                {/* Logo */}
                <div className="px-6 py-5 border-b border-indigo-900">
                    <h1 className="text-xl font-bold tracking-tight text-white">
                        Learn<span className="text-violet-400">Hub</span>
                    </h1>
                    <p className="text-indigo-400 text-xs mt-0.5">Student Portal</p>
                </div>

                {/* Navigation */}
                <StudentNav />

                {/* User footer */}
                <div className="p-4 border-t border-indigo-900">
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-indigo-900/60">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt={displayName}
                                className="h-8 w-8 rounded-full object-cover flex-shrink-0" />
                        ) : (
                            <div className="h-8 w-8 rounded-full bg-violet-500 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                                {initials}
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white truncate">{displayName}</p>
                            <p className="text-xs text-indigo-400">Student</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b flex items-center px-8 sticky top-0 z-10 gap-4">
                    <h2 className="text-base font-semibold text-slate-700 flex-1">Student Portal</h2>
                    <NotificationBell />
                </header>
                <div className="flex-1 overflow-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
