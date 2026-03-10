import { createClient } from "@/utils/supabase/server"
import { Video, Calendar, Clock, ExternalLink, Users } from "lucide-react"

export default async function LiveClassesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Get all live classes for courses the student is enrolled in
    const { data: liveClasses } = await supabase
        .from('live_classes')
        .select(`
            id, title, description, scheduled_at, duration_minutes, status, meeting_url, recording_url,
            courses (id, title),
            user_profiles!live_classes_instructor_id_fkey (full_name)
        `)
        .gte('scheduled_at', new Date(Date.now() - 86400000 * 7).toISOString()) // last 7 days + future
        .order('scheduled_at', { ascending: true })

    const now = new Date()
    const upcoming = (liveClasses || []).filter(c => new Date(c.scheduled_at) > now && c.status === 'scheduled')
    const inProgress = (liveClasses || []).filter(c => c.status === 'live')
    const past = (liveClasses || []).filter(c => new Date(c.scheduled_at) < now && c.status !== 'live')

    const ClassCard = ({ lc, showJoin }: { lc: any; showJoin?: boolean }) => (
        <div className={`bg-white rounded-2xl border shadow-sm p-5 ${lc.status === 'live' ? 'ring-2 ring-red-400' : ''}`}>
            <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${lc.status === 'live' ? 'bg-red-50' : 'bg-violet-50'}`}>
                    <Video size={22} className={lc.status === 'live' ? 'text-red-500' : 'text-violet-500'} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900">{lc.title}</h3>
                        {lc.status === 'live' && (
                            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">● LIVE</span>
                        )}
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">{(lc.courses as any)?.title}</p>
                    {lc.description && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{lc.description}</p>}
                    <div className="flex items-center gap-4 mt-2.5 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Calendar size={12} />{new Date(lc.scheduled_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        <span className="flex items-center gap-1"><Clock size={12} />{new Date(lc.scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="flex items-center gap-1"><Users size={12} />{lc.duration_minutes}min</span>
                    </div>
                </div>
                {(showJoin || lc.status === 'live') && lc.meeting_url && (
                    <a href={lc.meeting_url} target="_blank" rel="noopener noreferrer"
                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white font-medium text-sm flex-shrink-0 transition ${lc.status === 'live' ? 'bg-red-500 hover:bg-red-600' : 'bg-violet-600 hover:bg-violet-700'}`}>
                        <ExternalLink size={15} />
                        {lc.status === 'live' ? 'Join Now' : 'Join'}
                    </a>
                )}
                {lc.recording_url && (
                    <a href={lc.recording_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-medium text-sm flex-shrink-0 hover:bg-slate-200 transition">
                        <Video size={15} /> Recording
                    </a>
                )}
            </div>
        </div>
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Live Classes</h1>
                <p className="text-slate-500 mt-1">Join live sessions with your instructors in real time.</p>
            </div>

            {inProgress.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-lg font-bold text-red-600 flex items-center gap-2"><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Happening Now</h2>
                    {inProgress.map(lc => <ClassCard key={lc.id} lc={lc} showJoin />)}
                </div>
            )}

            {upcoming.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-lg font-bold text-slate-900">Upcoming</h2>
                    {upcoming.map(lc => <ClassCard key={lc.id} lc={lc} showJoin />)}
                </div>
            )}

            {upcoming.length === 0 && inProgress.length === 0 && (
                <div className="bg-white rounded-2xl border shadow-sm p-16 text-center">
                    <Video size={36} className="mx-auto mb-3 text-slate-200" />
                    <p className="text-slate-500">No upcoming live classes scheduled. Check back soon!</p>
                </div>
            )}

            {past.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-slate-600">Past Sessions</h2>
                    {past.slice(0, 5).map(lc => <ClassCard key={lc.id} lc={lc} />)}
                </div>
            )}
        </div>
    )
}
