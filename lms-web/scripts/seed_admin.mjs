import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRole) {
    console.error("Missing env vars")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRole)

async function seedSuperAdmin() {
    console.log("Creating user...")
    const email = 'superadmin@lms.com'
    const password = 'Password123!'

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            full_name: 'System Administrator'
        }
    })

    if (authError) {
        if (authError.message.includes('already registered')) {
            console.log("User already exists!")
        } else {
            console.error("Auth error:", authError)
            return
        }
    }

    // Get the UID (either newly created or existing)
    const { data: usersData } = await supabase.auth.admin.listUsers()
    const user = usersData.users.find(u => u.email === email)

    if (!user) {
        console.error("Could not find user UID")
        return
    }

    const uid = user.id
    console.log(`Ensuring Super Admin role for UID: ${uid}`)

    // Create a placeholder global tenant if none exist for linking super admin
    let globalTenantId

    const { data: checkTenant } = await supabase.from('tenants').select('id').eq('subdomain', 'global').single()

    if (checkTenant) {
        globalTenantId = checkTenant.id
    } else {
        const { data: newTenant, error: tErr } = await supabase.from('tenants').insert({
            name: 'Global System',
            subdomain: 'global',
            is_active: true
        }).select('id').single()

        if (tErr) {
            console.error("Error creating global tenant", tErr)
            return
        }
        globalTenantId = newTenant.id
    }

    // Grant role
    const { error: roleError } = await supabase.from('user_tenant_roles').upsert({
        user_id: uid,
        tenant_id: globalTenantId,
        role: 'super_admin',
        is_active: true
    }, { onConflict: 'user_id, tenant_id' })

    if (roleError) {
        console.error("Failed to assign role:", roleError)
    } else {
        console.log(`Success! You can now login with ${email} : ${password}`)
    }
}

seedSuperAdmin()
