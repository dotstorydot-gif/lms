'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createTenant(formData: FormData) {
    const supabase = await createClient()

    // Ensure user is super admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error("Unauthorized")
    }

    const name = formData.get('name') as string
    const subdomain = formData.get('subdomain') as string

    // Basic validation
    if (!name || !subdomain) {
        return { error: 'Name and subdomain are required' }
    }

    // Ensure subdomain is alphanumeric only
    const sanitizedSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9]/g, '')

    const { data, error } = await supabase
        .from('tenants')
        .insert([
            {
                name,
                subdomain: sanitizedSubdomain,
                is_active: true
            }
        ])
        .select()
        .single()

    if (error) {
        // Check for unique constraint violation on subdomain
        if (error.code === '23505') {
            return { error: 'That subdomain is already taken' }
        }
        console.error("Error creating tenant:", error)
        return { error: 'Failed to create academy' }
    }

    revalidatePath('/super-admin/tenants')
    redirect('/super-admin/tenants')
}
