import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    'https://auwqovtkxstvawnwkfai.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1d3FvdnRreHN0dmF3bndrZmFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE1MDk2MSwiZXhwIjoyMDg4NzI2OTYxfQ.gzoLCce454vra0xSeikVXmIdbzEOwW4558cODMwf7L8',
    { auth: { autoRefreshToken: false, persistSession: false } }
)

const PASSWORD = 'Test1234!'

const TEST_USERS = [
    { email: 'superadmin@test.com', name: 'Super Admin', role: 'super_admin', needsTenant: false },
    { email: 'admin@test.com', name: 'Academy Admin', role: 'tenant_admin', needsTenant: true },
    { email: 'instructor@test.com', name: 'John Instructor', role: 'instructor', needsTenant: true },
    { email: 'student@test.com', name: 'Sam Student', role: 'student', needsTenant: true },
]

// Get first tenant
const { data: tenants } = await supabase.from('tenants').select('id, name').limit(1)
const tenant = tenants?.[0]
if (!tenant) {
    console.error('❌ No tenant found. Go to /super-admin/tenants/new first and create one.')
    process.exit(1)
}
console.log(`✅ Using tenant: "${tenant.name}" (${tenant.id})\n`)

for (const u of TEST_USERS) {
    console.log(`Creating ${u.email}...`)

    // Create auth user — pass full_name in metadata so the trigger can use it
    const { data, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: u.name },
    })

    let userId = data?.user?.id

    if (error) {
        if (error.message.includes('already been registered') || error.message.includes('already exists')) {
            // User exists — find their ID
            const { data: list } = await supabase.auth.admin.listUsers()
            const existing = list?.users?.find(x => x.email === u.email)
            userId = existing?.id
            console.log(`   ⚠️  Already exists, using ID: ${userId}`)
        } else {
            console.error(`   ❌ Auth error: ${error.message}`)
            continue
        }
    } else {
        console.log(`   ✅ Auth user created: ${userId}`)
    }

    if (!userId) { console.error('   ❌ Could not determine user ID'); continue }

    // Upsert user_profile (trigger may have already created it)
    const { error: profileErr } = await supabase.from('user_profiles').upsert({
        id: userId,
        email: u.email,
        full_name: u.name,
    }, { onConflict: 'id' })

    if (profileErr) {
        console.error(`   ❌ Profile error: ${profileErr.message}`)
        continue
    }

    // Insert into user_tenant_roles (roles live here, not in user_profiles)
    if (u.needsTenant) {
        const { error: roleErr } = await supabase.from('user_tenant_roles').upsert({
            user_id: userId,
            tenant_id: tenant.id,
            role: u.role,
            is_active: true,
        }, { onConflict: 'user_id,tenant_id' })

        if (roleErr) console.error(`   ❌ Role error: ${roleErr.message}`)
        else console.log(`   ✅ Role "${u.role}" assigned to tenant "${tenant.name}"`)
    } else {
        // super_admin gets a special tenant_role entry too (can use any tenant)
        const { error: roleErr } = await supabase.from('user_tenant_roles').upsert({
            user_id: userId,
            tenant_id: tenant.id,
            role: 'super_admin',
            is_active: true,
        }, { onConflict: 'user_id,tenant_id' })
        if (roleErr) console.error(`   ❌ Super admin role error: ${roleErr.message}`)
        else console.log(`   ✅ Super admin role assigned`)
    }
}

console.log('\n🎉 Test credentials ready!\n')
console.log('┌─────────────────────────────────────────────────────┐')
console.log('│  Role             Email                   Password  │')
console.log('├─────────────────────────────────────────────────────┤')
TEST_USERS.forEach(u => {
    const role = u.role.padEnd(16)
    const email = u.email.padEnd(24)
    console.log(`│  ${role} ${email} ${PASSWORD}  │`)
})
console.log('└─────────────────────────────────────────────────────┘')
console.log('\n🔗 Login at: https://lms-seven-ochre.vercel.app/login')
