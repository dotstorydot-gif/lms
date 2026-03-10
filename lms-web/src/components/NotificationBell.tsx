'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, CheckCheck, BookOpen, Award, PlayCircle, Zap } from 'lucide-react'
import Link from 'next/link'

type Notification = {
    id: string
    type: string
    title: string
    body: string | null
    is_read: boolean
    action_url: string | null
    created_at: string
}

const typeIcon = (type: string) => {
    switch (type) {
        case 'enrollment': return <BookOpen size={16} className="text-violet-500" />
        case 'certificate_issued': return <Award size={16} className="text-amber-500" />
        case 'quiz_passed': return <CheckCheck size={16} className="text-emerald-500" />
        case 'new_lesson': return <PlayCircle size={16} className="text-blue-500" />
        default: return <Zap size={16} className="text-slate-400" />
    }
}

export default function NotificationBell() {
    const [open, setOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    const unreadCount = notifications.filter(n => !n.is_read).length

    const fetchNotifications = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/notifications')
            const data = await res.json()
            setNotifications(data.notifications || [])
        } finally {
            setLoading(false)
        }
    }

    const markAllRead = async () => {
        await fetch('/api/notifications', { method: 'PATCH' })
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    }

    useEffect(() => {
        fetchNotifications()
        // Poll every 30 seconds for new notifications
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [])

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => { setOpen(o => !o); if (!open) fetchNotifications() }}
                className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                        <h3 className="font-semibold text-slate-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-xs text-violet-600 hover:text-violet-800 font-medium">
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="py-8 text-center text-slate-400 text-sm">Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className="py-10 text-center text-slate-400">
                                <Bell size={28} className="mx-auto mb-2 opacity-30" />
                                <p className="text-sm">You're all caught up!</p>
                            </div>
                        ) : (
                            notifications.slice(0, 20).map(notif => (
                                <Link
                                    key={notif.id}
                                    href={notif.action_url || '#'}
                                    onClick={() => setOpen(false)}
                                    className={`flex items-start gap-3 px-4 py-3.5 hover:bg-slate-50 transition border-b last:border-0 ${!notif.is_read ? 'bg-violet-50/50' : ''}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${!notif.is_read ? 'bg-violet-100' : 'bg-slate-100'}`}>
                                        {typeIcon(notif.type)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className={`text-sm font-medium leading-tight ${!notif.is_read ? 'text-slate-900' : 'text-slate-600'}`}>
                                            {notif.title}
                                        </p>
                                        {notif.body && <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{notif.body}</p>}
                                        <p className="text-xs text-slate-300 mt-1">
                                            {new Date(notif.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {!notif.is_read && (
                                        <div className="w-2 h-2 bg-violet-500 rounded-full flex-shrink-0 mt-1.5" />
                                    )}
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
