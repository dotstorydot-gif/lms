import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
        .from('user_profiles')
        .select('tenant_id, role')
        .eq('id', user.id)
        .single()

    if (!profile || !['instructor', 'tenant_admin', 'super_admin'].includes(profile.role)) {
        return NextResponse.json({ error: 'Only instructors can schedule live classes' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, scheduled_at, duration_minutes, meeting_url, course_id } = body

    if (!title || !scheduled_at || !course_id) {
        return NextResponse.json({ error: 'title, scheduled_at, and course_id are required' }, { status: 400 })
    }

    const { data: liveClass, error } = await supabase
        .from('live_classes')
        .insert({
            title, description, scheduled_at, duration_minutes: duration_minutes || 60,
            meeting_url, course_id, instructor_id: user.id,
            tenant_id: profile.tenant_id, status: 'scheduled'
        })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ liveClass })
}

export async function PATCH(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id, status, recording_url } = await request.json()

    const { error } = await supabase
        .from('live_classes')
        .update({ status, recording_url })
        .eq('id', id)
        .eq('instructor_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
}
