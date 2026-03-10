import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
    LayoutDashboard, BookOpen, Users, BarChart2,
    Settings, Palette, Globe
} from "lucide-react"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Get tenant info for the current user
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('tenant_id, role')
        .eq('id', user.id)
        .single()

    if (!profile?.tenant_id || !['tenant_admin', 'super_admin'].includes(profile.role)) {
        redirect('/')
    }

    const { data: tenant } = await supabase
        .from('tenants')
        .select('name, logo_url, primary_color')
        .eq('id', profile.tenant_id)
        .single()

    const primaryColor = tenant?.primary_color || '#7C3AED'

    const navItems = [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/courses', label: 'Courses', icon: BookOpen },
        { href: '/admin/students', label: 'Students', icon: Users },
        { href: '/admin/revenue', label: 'Revenue', icon: BarChart2 },
        { href: '/admin/settings', label: 'Branding & Settings', icon: Palette },
    ]

    return (
        <div className="min-h-screen flex bg-slate-50">
            <aside className="w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col">
                {/* Academy Logo/Name */}
                <div className="p-6 border-b border-slate-700">
                    {tenant?.logo_url ? (
                        <img src={tenant.logo_url} alt={tenant.name} className="h-8 object-contain" />
                    ) : (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                                style={{ backgroundColor: primaryColor }}>
                                {tenant?.name?.charAt(0) || 'A'}
                            </div>
                            <span className="font-bold text-white truncate">{tenant?.name || 'Academy'}</span>
                        </div>
                    )}
                    <p className="text-slate-400 text-xs mt-1">Admin Portal</p>
                </div>

                <nav className="flex-1 py-4 px-3 space-y-1">
                    {navItems.map(item => (
                        <Link key={item.href} href={item.href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition text-sm font-medium">
                            <item.icon size={18} />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-700">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="h-8 w-8 rounded-full flex items-center justify-center font-bold text-white text-sm"
                            style={{ backgroundColor: primaryColor }}>
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user.email}</p>
                            <p className="text-xs text-slate-400">Tenant Admin</p>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="flex-1 overflow-auto">
                <div className="p-8">{children}</div>
            </main>
        </div>
    )
}
