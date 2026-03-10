import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { Award, Calendar, Download } from "lucide-react"

export default async function CertificatesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: certificates } = await supabase
        .from('certificates')
        .select(`
            id, issued_at, unique_code,
            courses (title, thumbnail_url)
        `)
        .eq('user_id', user?.id)
        .order('issued_at', { ascending: false })

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Certificates</h1>
                <p className="text-slate-500 mt-2">All the courses you've successfully completed.</p>
            </div>

            {(!certificates || certificates.length === 0) ? (
                <div className="bg-white rounded-2xl border shadow-sm p-16 text-center flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center">
                        <Award size={32} className="text-amber-400" />
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-slate-800">No certificates yet</p>
                        <p className="text-slate-500 text-sm mt-1">Complete a course to earn your first certificate!</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {certificates.map((cert: any) => (
                        <div key={cert.id} className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                                    <Award size={32} className="text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider mb-1">Certificate of Completion</p>
                                    <h3 className="font-bold text-slate-900 text-lg leading-tight">{cert.courses?.title}</h3>
                                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                                        <Calendar size={14} />
                                        {new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 pt-4 border-t border-amber-200 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-400">Certificate ID</p>
                                    <p className="text-xs font-mono text-slate-600 mt-0.5">{cert.unique_code.slice(0, 16).toUpperCase()}...</p>
                                </div>
                                <a
                                    href={`/api/certificate?id=${cert.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-900 transition"
                                >
                                    <Download size={15} />
                                    Download PDF
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
