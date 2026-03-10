import { createClient } from "@/utils/supabase/server"

export default async function SuperAdminDashboard() {
    const supabase = await createClient()

    // Fetch quick metrics for Super Admin
    const { count: tenantCount } = await supabase.from('tenants').select('*', { count: 'exact', head: true })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-500 mt-2">Welcome to the LMS platform control center.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col">
                    <span className="text-sm font-medium text-gray-500">Total Academies</span>
                    <span className="text-3xl font-bold text-gray-900 mt-2">{tenantCount || 0}</span>
                </div>

                <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col">
                    <span className="text-sm font-medium text-gray-500">Active Subscriptions</span>
                    <span className="text-3xl font-bold text-gray-900 mt-2">0</span>
                </div>

                <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col">
                    <span className="text-sm font-medium text-gray-500">Total Revenue (MRR)</span>
                    <span className="text-3xl font-bold text-gray-900 mt-2">$0.00</span>
                </div>

                <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col">
                    <span className="text-sm font-medium text-gray-500">Total Users</span>
                    <span className="text-3xl font-bold text-gray-900 mt-2">0</span>
                </div>
            </div>

            {/* Recent Activity / Tenants List Empty State */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden mt-8">
                <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Academies</h3>
                </div>
                <div className="p-8 text-center text-gray-500">
                    No academies have been registered yet.
                </div>
            </div>

        </div>
    )
}
