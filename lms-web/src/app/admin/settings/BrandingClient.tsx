'use client'

import { useState } from 'react'
import { Palette, Globe, Save, Loader2, Upload } from 'lucide-react'

export default function BrandingSettingsClient({
    tenant
}: {
    tenant: {
        id: string
        name: string
        primary_color: string | null
        secondary_color: string | null
        custom_domain: string | null
        logo_url: string | null
        welcome_message: string | null
    }
}) {
    const [name, setName] = useState(tenant.name || '')
    const [primaryColor, setPrimaryColor] = useState(tenant.primary_color || '#7C3AED')
    const [secondaryColor, setSecondaryColor] = useState(tenant.secondary_color || '#10B981')
    const [customDomain, setCustomDomain] = useState(tenant.custom_domain || '')
    const [welcomeMsg, setWelcomeMsg] = useState(tenant.welcome_message || '')
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch('/api/admin/branding', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tenantId: tenant.id, name, primary_color: primaryColor,
                    secondary_color: secondaryColor, custom_domain: customDomain,
                    welcome_message: welcomeMsg
                })
            })
            if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="max-w-2xl space-y-6">
            {/* Academy Identity */}
            <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-5">
                <div className="flex items-center gap-3 border-b pb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: primaryColor + '20', color: primaryColor }}>
                        <Palette size={20} />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-900">Brand Identity</h2>
                        <p className="text-sm text-slate-500">Customize how your academy looks to students</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Academy Name</label>
                    <input value={name} onChange={e => setName(e.target.value)}
                        className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 outline-none"
                        style={{ '--tw-ring-color': primaryColor } as any} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Primary Color</label>
                        <div className="flex gap-2 items-center">
                            <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
                                className="w-10 h-10 rounded cursor-pointer border" />
                            <input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
                                className="flex-1 px-3 py-2 border rounded-lg text-sm font-mono outline-none focus:ring-2" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Secondary Color</label>
                        <div className="flex gap-2 items-center">
                            <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)}
                                className="w-10 h-10 rounded cursor-pointer border" />
                            <input value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)}
                                className="flex-1 px-3 py-2 border rounded-lg text-sm font-mono outline-none focus:ring-2" />
                        </div>
                    </div>
                </div>

                {/* Live Preview */}
                <div className="rounded-xl overflow-hidden border shadow-inner">
                    <div className="p-4 text-white font-bold text-center" style={{ backgroundColor: primaryColor }}>
                        {name || 'Your Academy'}
                    </div>
                    <div className="p-4 flex gap-3">
                        <button className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: primaryColor }}>
                            Enroll Now
                        </button>
                        <button className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: secondaryColor }}>
                            View Courses
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Logo</label>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition cursor-pointer">
                        {tenant.logo_url ? (
                            <img src={tenant.logo_url} alt="Logo" className="h-16 mx-auto object-contain mb-2" />
                        ) : (
                            <Upload size={24} className="mx-auto text-slate-400 mb-2" />
                        )}
                        <p className="text-sm text-slate-500">Click to upload logo (PNG, SVG recommended)</p>
                    </div>
                </div>
            </div>

            {/* Custom Domain */}
            <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-5">
                <div className="flex items-center gap-3 border-b pb-4">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <Globe size={20} />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-900">Custom Domain</h2>
                        <p className="text-sm text-slate-500">Use your own domain for your academy</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Domain</label>
                    <div className="flex">
                        <span className="px-4 py-2.5 bg-slate-50 border border-r-0 rounded-l-lg text-slate-400 text-sm">https://</span>
                        <input value={customDomain} onChange={e => setCustomDomain(e.target.value)}
                            placeholder="academy.yourdomain.com"
                            className="flex-1 px-4 py-2.5 border rounded-r-lg outline-none focus:ring-2 text-sm" />
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5">Point a CNAME record to <code className="bg-slate-100 px-1 rounded">lms-seven-ochre.vercel.app</code></p>
                </div>
            </div>

            {/* Welcome Message */}
            <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
                <h2 className="font-bold text-slate-900">Welcome Message</h2>
                <textarea value={welcomeMsg} onChange={e => setWelcomeMsg(e.target.value)}
                    rows={3} placeholder="Welcome to our academy! Start your learning journey today..."
                    className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 resize-none text-sm" />
            </div>

            <div className="flex justify-end">
                <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 text-white rounded-xl font-semibold transition shadow-sm disabled:opacity-60"
                    style={{ backgroundColor: primaryColor }}>
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    )
}
