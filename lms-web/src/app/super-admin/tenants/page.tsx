import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { Plus, MoreVertical } from "lucide-react"

export default async function TenantsPage() {
    const supabase = await createClient()

    // Fetch all tenants
    const { data: tenants, error } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Academies</h1>
                    <p className="text-gray-500 mt-2">Manage all registered academies/tenants on the platform.</p>
                </div>
                <Link
                    href="/super-admin/tenants/new"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus size={20} />
                    Add New Academy
                </Link>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b text-sm text-gray-500 uppercase tracking-wider">
                            <th className="p-4 font-medium">Academy Name</th>
                            <th className="p-4 font-medium">Subdomain</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium">Created On</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {tenants?.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">
                                    No academies found. Click "Add New Academy" to get started.
                                </td>
                            </tr>
                        )}
                        {tenants?.map((tenant) => (
                            <tr key={tenant.id} className="hover:bg-gray-50 transition">
                                <td className="p-4 font-medium text-gray-900">{tenant.name}</td>
                                <td className="p-4 text-gray-500">
                                    <a href={`https://${tenant.subdomain}.yourlms.com`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                                        {tenant.subdomain}
                                    </a>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${tenant.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {tenant.is_active ? 'Active' : 'Suspended'}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-500">
                                    {new Date(tenant.created_at).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-right">
                                    <button className="text-gray-400 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition">
                                        <MoreVertical size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
