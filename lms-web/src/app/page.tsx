import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function Home() {
  const supabase = await createClient()

  // For now in Phase 2, the root page just redirects globally to the Super Admin or Login
  // Later in Phase 4, we'll implement tenant subdomain extraction here.
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/super-admin')
  } else {
    redirect('/login')
  }
}
