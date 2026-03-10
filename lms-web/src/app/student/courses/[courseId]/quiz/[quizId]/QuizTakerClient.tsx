'use client'

import { useState } from 'react'
import { CheckCircle, Circle, Clock, Award, ChevronRight, AlertTriangle } from 'lucide-react'

type Answer = { id: string; answer_text: string }
type Question = { id: string; question_text: string; points: number; quiz_answers: Answer[] }

export default function QuizTakerClient({
    quiz,
    questions,
}: {
    quiz: { id: string; title: string; passing_score_percent: number; time_limit_minutes: number | null }
    questions: Question[]
}) {
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
    const [submitted, setSubmitted] = useState(false)
    const [score, setScore] = useState<number | null>(null)
    const [correctAnswers, setCorrectAnswers] = useState<Record<string, string>>({})
    const [currentQuestion, setCurrentQuestion] = useState(0)

    const selectAnswer = (questionId: string, answerId: string) => {
        if (submitted) return
        setSelectedAnswers(prev => ({ ...prev, [questionId]: answerId }))
    }

    const submitQuiz = async () => {
        // In a real implementation, this would call a server action to validate answers
        // For now, we calculate client-side with a placeholder
        const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)
        const fakeScore = Math.round((Object.keys(selectedAnswers).length / questions.length) * 100)
        setScore(fakeScore)
        setSubmitted(true)
    }

    const answeredCount = Object.keys(selectedAnswers).length
    const passed = score !== null && score >= quiz.passing_score_percent

    if (submitted && score !== null) {
        return (
            <div className="max-w-lg mx-auto py-16 text-center space-y-6">
                <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center ${passed ? 'bg-emerald-100' : 'bg-red-100'}`}>
                    {passed ? (
                        <Award size={40} className="text-emerald-600" />
                    ) : (
                        <AlertTriangle size={40} className="text-red-500" />
                    )}
                </div>
                <div>
                    <h2 className={`text-4xl font-bold ${passed ? 'text-emerald-600' : 'text-red-600'}`}>{score}%</h2>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{passed ? 'Congratulations! 🎉' : 'Not Quite!'}</p>
                    <p className="text-slate-500 mt-2">
                        {passed
                            ? `You passed with a score of ${score}%! The passing score was ${quiz.passing_score_percent}%.`
                            : `You scored ${score}%. You need ${quiz.passing_score_percent}% to pass. Try again!`}
                    </p>
                </div>
                <div className="flex gap-4 justify-center">
                    {!passed && (
                        <button
                            onClick={() => { setSubmitted(false); setSelectedAnswers({}); setScore(null); setCurrentQuestion(0) }}
                            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition"
                        >
                            Retry Quiz
                        </button>
                    )}
                    <button className="px-6 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition">
                        Back to Course
                    </button>
                </div>
            </div>
        )
    }

    const q = questions[currentQuestion]

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Progress Header */}
            <div className="bg-white rounded-2xl border shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-600">
                        Question {currentQuestion + 1} of {questions.length}
                    </span>
                    <span className="text-sm text-slate-500">{answeredCount} answered</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                        className="h-full bg-violet-500 rounded-full transition-all duration-300"
                    />
                </div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-2xl border shadow-sm p-8 space-y-6">
                <div>
                    <p className="text-xs font-semibold text-violet-600 uppercase mb-2">{q.points} point{q.points !== 1 ? 's' : ''}</p>
                    <h2 className="text-xl font-bold text-slate-900">{q.question_text}</h2>
                </div>

                <div className="space-y-3">
                    {q.quiz_answers.map((answer) => {
                        const isSelected = selectedAnswers[q.id] === answer.id
                        return (
                            <button
                                key={answer.id}
                                onClick={() => selectAnswer(q.id, answer.id)}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${isSelected
                                        ? 'border-violet-500 bg-violet-50'
                                        : 'border-slate-200 hover:border-violet-300 hover:bg-violet-50/50'
                                    }`}
                            >
                                {isSelected ? (
                                    <CheckCircle size={20} className="text-violet-600 flex-shrink-0" />
                                ) : (
                                    <Circle size={20} className="text-slate-300 flex-shrink-0" />
                                )}
                                <span className={`font-medium ${isSelected ? 'text-violet-900' : 'text-slate-700'}`}>
                                    {answer.answer_text}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setCurrentQuestion(i => Math.max(0, i - 1))}
                    disabled={currentQuestion === 0}
                    className="px-5 py-2.5 border rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition disabled:opacity-40"
                >
                    Previous
                </button>

                {currentQuestion < questions.length - 1 ? (
                    <button
                        onClick={() => setCurrentQuestion(i => i + 1)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition"
                    >
                        Next <ChevronRight size={18} />
                    </button>
                ) : (
                    <button
                        onClick={submitQuiz}
                        disabled={answeredCount < questions.length}
                        className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition disabled:opacity-50"
                    >
                        Submit Quiz ({answeredCount}/{questions.length} answered)
                    </button>
                )}
            </div>
        </div>
    )
}
