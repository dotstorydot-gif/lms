import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

function roleToPath(role: string): string {
  switch (role) {
    case 'super_admin': return '/super-admin'
    case 'tenant_admin': return '/admin'
    case 'instructor': return '/instructor'
    case 'student':
    default: return '/student'
  }
}

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Look up the user's role and redirect to the right portal
  const { data: roleRecord } = await supabase
    .from('user_tenant_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('role')
    .limit(1)
    .single()

  redirect(roleToPath(roleRecord?.role || 'student'))
}
