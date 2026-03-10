import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import QuizBuilderClient from "./QuizBuilderClient"

export default async function NewQuizPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Link href={`/instructor/courses/${id}`}
                    className="p-2 bg-white rounded-lg border shadow-sm text-slate-500 hover:text-slate-900 transition">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Quiz Builder</h1>
                    <p className="text-slate-500 mt-1">Create a quiz to assess your students' understanding.</p>
                </div>
            </div>

            <QuizBuilderClient courseId={id} />
        </div>
    )
}
