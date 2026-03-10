import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
        .from('user_profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!profile?.tenant_id) return NextResponse.json({ error: 'No tenant found' }, { status: 400 })

    // Check if already applied
    const { data: existing } = await supabase
        .from('affiliates')
        .select('id, status')
        .eq('user_id', user.id)
        .single()

    if (existing) return NextResponse.json({ affiliate: existing })

    // Create pending affiliate profile
    const { data: affiliate, error } = await supabase
        .from('affiliates')
        .insert({ user_id: user.id, tenant_id: profile.tenant_id, status: 'pending' })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ affiliate })
}
