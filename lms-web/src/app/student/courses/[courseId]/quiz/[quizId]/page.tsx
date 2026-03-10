import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import QuizTakerClient from "./QuizTakerClient"

export default async function QuizPage({ params }: { params: Promise<{ courseId: string; quizId: string }> }) {
    const { courseId, quizId } = await params
    const supabase = await createClient()

    const { data: quiz } = await supabase
        .from('quizzes')
        .select(`
            id, title, passing_score_percent, time_limit_minutes,
            quiz_questions (
                id, question_text, points, order_index,
                quiz_answers (id, answer_text, order_index)
            )
        `)
        .eq('id', quizId)
        .eq('course_id', courseId)
        .single()

    if (!quiz) notFound()

    const questions = (quiz.quiz_questions || [])
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((q: any) => ({
            ...q,
            quiz_answers: (q.quiz_answers || []).sort((a: any, b: any) => a.order_index - b.order_index)
        }))

    return (
        <div className="py-8">
            <div className="max-w-2xl mx-auto mb-8 text-center">
                <h1 className="text-3xl font-bold text-slate-900">{quiz.title}</h1>
                <p className="text-slate-500 mt-2">
                    {questions.length} questions · Pass with {quiz.passing_score_percent}%
                    {quiz.time_limit_minutes ? ` · ${quiz.time_limit_minutes} minute limit` : ''}
                </p>
            </div>
            <QuizTakerClient quiz={quiz} questions={questions} />
        </div>
    )
}
