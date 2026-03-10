import { createClient } from "@/utils/supabase/server"
import BrandingClient from "./BrandingClient"

export default async function BrandingSettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('user_profiles').select('tenant_id').eq('id', user!.id).single()

    const { data: tenant } = await supabase
        .from('tenants')
        .select('id, name, primary_color, secondary_color, custom_domain, logo_url, welcome_message')
        .eq('id', profile?.tenant_id)
        .single()

    if (!tenant) return <p>Tenant not found.</p>

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Branding & Settings</h1>
                <p className="text-slate-500 mt-1">Customize your academy's appearance and domain.</p>
            </div>
            <BrandingClient tenant={tenant} />
        </div>
    )
}
