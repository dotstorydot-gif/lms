'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

// Maps a role to the correct portal path
function roleToPath(role: string): string {
    switch (role) {
        case 'super_admin': return '/super-admin'
        case 'tenant_admin': return '/admin'
        case 'instructor': return '/instructor'
        case 'student':
        default: return '/student'
    }
}

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: 'Email and password are required' }
    }

    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
        return { error: error.message }
    }

    // Look up the user's highest-privilege role from user_tenant_roles
    const { data: roleRecord } = await supabase
        .from('user_tenant_roles')
        .select('role')
        .eq('user_id', authData.user.id)
        .eq('is_active', true)
        .order('role') // super_admin sorts before tenant_admin > instructor > student
        .limit(1)
        .single()

    const role = roleRecord?.role || 'student'
    redirect(roleToPath(role))
}
