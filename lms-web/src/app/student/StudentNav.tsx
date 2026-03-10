'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard, BookOpen, CheckSquare, Award,
    Video, Link2, ChevronRight
} from 'lucide-react'

const navItems = [
    { href: '/student', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/student/courses', label: 'Browse Courses', icon: BookOpen },
    { href: '/student/my-learning', label: 'My Learning', icon: CheckSquare },
    { href: '/student/live-classes', label: 'Live Classes', icon: Video, badge: 'LIVE' },
    { href: '/student/certificates', label: 'Certificates', icon: Award },
    { href: '/affiliate', label: 'Affiliate Program', icon: Link2 },
]

export default function StudentNav() {
    const pathname = usePathname()

    return (
        <nav className="mt-2 flex flex-col gap-0.5 px-3 flex-1">
            {navItems.map(item => {
                const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href)

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium group ${isActive
                                ? 'bg-violet-600 text-white shadow-md shadow-violet-900/30'
                                : 'text-indigo-200 hover:bg-indigo-900/60 hover:text-white'
                            }`}
                    >
                        <item.icon size={18} className={isActive ? 'text-white' : 'text-indigo-400 group-hover:text-white'} />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                            <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full leading-none">
                                {item.badge}
                            </span>
                        )}
                        {isActive && <ChevronRight size={14} className="text-violet-300" />}
                    </Link>
                )
            })}
        </nav>
    )
}
