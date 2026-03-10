'use client'

import { useState } from 'react'
import { Calendar, Clock, Link2, Save, Loader2, Video } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function NewLiveClassPage() {
    const router = useRouter()
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [scheduledAt, setScheduledAt] = useState('')
    const [duration, setDuration] = useState(60)
    const [meetingUrl, setMeetingUrl] = useState('')
    const [saving, setSaving] = useState(false)
    const [courseId, setCourseId] = useState('')

    const handleCreate = async () => {
        if (!title || !scheduledAt || !courseId) return
        setSaving(true)
        try {
            const res = await fetch('/api/live-class', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, scheduled_at: scheduledAt, duration_minutes: duration, meeting_url: meetingUrl, course_id: courseId })
            })
            if (res.ok) router.push('/instructor')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 py-8">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center">
                    <Video size={24} className="text-violet-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Schedule a Live Class</h1>
                    <p className="text-slate-500 text-sm">All enrolled students will be notified automatically.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Week 3 Q&A Session"
                        className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-violet-500" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Course ID</label>
                    <input value={courseId} onChange={e => setCourseId(e.target.value)} placeholder="Paste course UUID"
                        className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-violet-500 font-mono text-sm" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Date & Time</label>
                        <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}
                            className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Duration (minutes)</label>
                        <input type="number" min={15} max={480} value={duration} onChange={e => setDuration(+e.target.value)}
                            className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-violet-500" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Meeting URL (Zoom / Google Meet)</label>
                    <div className="flex">
                        <span className="px-4 py-2.5 bg-slate-50 border border-r-0 rounded-l-lg text-slate-400"><Link2 size={18} /></span>
                        <input value={meetingUrl} onChange={e => setMeetingUrl(e.target.value)} placeholder="https://zoom.us/j/..."
                            className="flex-1 px-4 py-2.5 border rounded-r-lg outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Description (optional)</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                        placeholder="What will you cover in this session?"
                        className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-violet-500 resize-none text-sm" />
                </div>
            </div>

            <div className="flex justify-end">
                <button onClick={handleCreate} disabled={saving || !title || !scheduledAt || !courseId}
                    className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition disabled:opacity-50">
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {saving ? 'Scheduling...' : 'Schedule Class'}
                </button>
            </div>
        </div>
    )
}
