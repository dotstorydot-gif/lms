import { createClient } from "@/utils/supabase/server"
import { redirect } from 'next/navigation'
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function NewCoursePage() {

    // Simple Server Action to handle course creation natively
    async function createCourse(formData: FormData) {
        'use server'

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Unauthorized")

        const title = formData.get('title') as string
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

        // In a real multi-tenant app, we would get the active tenant_id from the subdomain or cookies.
        // For local development without custom domains, we'll fetch the global placeholder tenant.
        const { data: tenant } = await supabase.from('tenants').select('id').eq('subdomain', 'global').single()

        if (!tenant) throw new Error("Tenant not found")

        const { data, error } = await supabase
            .from('courses')
            .insert({
                title,
                slug,
                instructor_id: user.id,
                tenant_id: tenant.id,
                status: 'draft',
                level: 'all_levels',
                is_free: false
            })
            .select()
            .single()

        if (error) {
            console.error(error)
            throw new Error("Failed to create course")
        }

        // Redirect to the course builder
        redirect(`/instructor/courses/${data.id}`)
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pt-8">
            <div className="flex items-center gap-4">
                <Link
                    href="/instructor/courses"
                    className="p-2 bg-white rounded-lg border shadow-sm text-slate-500 hover:text-slate-900 transition hover:bg-slate-50"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Start a New Course</h1>
                    <p className="text-slate-500 mt-1">Provide a working title to initialize your course builder workspace.</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border shadow-sm">
                <form action={createCourse} className="space-y-6">

                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                            Course Working Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            required
                            placeholder="e.g. Advanced System Design Patterns"
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                        />
                        <p className="text-sm text-slate-500 mt-2">You can always change the title and slug later before publishing.</p>
                    </div>

                    <div className="pt-4 border-t flex justify-end">
                        <button
                            type="submit"
                            className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition"
                        >
                            Initialize Builder Workspace
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}
