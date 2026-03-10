import { createTenant } from "@/app/super-admin/actions/tenantActions"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewTenantPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Link
                    href="/super-admin/tenants"
                    className="p-2 bg-white rounded-lg border shadow-sm text-gray-500 hover:text-gray-900 transition"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Provision New Academy</h1>
                    <p className="text-gray-500 mt-1">Create a new tenant space for a school or business.</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border shadow-sm">
                <form action={async (formData) => {
                    'use server'
                    await createTenant(formData)
                }} className="space-y-6">

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            Academy / Business Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            placeholder="e.g. Acme Code Camp"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                    </div>

                    <div>
                        <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700 mb-2">
                            Subdomain URL
                        </label>
                        <div className="flex items-center">
                            <input
                                type="text"
                                id="subdomain"
                                name="subdomain"
                                required
                                placeholder="acmecode"
                                className="w-full px-4 py-3 rounded-l-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            />
                            <div className="px-4 py-3 bg-gray-50 border border-l-0 border-gray-300 rounded-r-lg text-gray-500 font-medium">
                                .yourlms.com
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Only letters and numbers are allowed. This is permanent.</p>
                    </div>

                    <div className="pt-4 border-t flex justify-end">
                        <button
                            type="submit"
                            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                        >
                            Create Academy Instance
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}
