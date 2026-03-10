'use client'

import { useState } from 'react'
import { Plus, Trash2, CheckCircle, Circle, GripVertical, Save } from 'lucide-react'

type Answer = { id: string; text: string; isCorrect: boolean }
type Question = { id: string; text: string; type: 'multiple_choice' | 'true_false'; points: number; answers: Answer[] }

function generateId() { return Math.random().toString(36).slice(2) }

export default function QuizBuilderClient({ courseId, quizId }: { courseId: string; quizId?: string }) {
    const [title, setTitle] = useState('Untitled Quiz')
    const [passingScore, setPassingScore] = useState(70)
    const [timeLimit, setTimeLimit] = useState<number | ''>('')
    const [questions, setQuestions] = useState<Question[]>([])
    const [saving, setSaving] = useState(false)

    const addQuestion = () => {
        setQuestions(prev => [...prev, {
            id: generateId(),
            text: '',
            type: 'multiple_choice',
            points: 1,
            answers: [
                { id: generateId(), text: '', isCorrect: true },
                { id: generateId(), text: '', isCorrect: false },
                { id: generateId(), text: '', isCorrect: false },
                { id: generateId(), text: '', isCorrect: false },
            ]
        }])
    }

    const updateQuestion = (qId: string, field: keyof Question, value: any) => {
        setQuestions(prev => prev.map(q => q.id === qId ? { ...q, [field]: value } : q))
    }

    const updateAnswer = (qId: string, aId: string, field: keyof Answer, value: any) => {
        setQuestions(prev => prev.map(q => {
            if (q.id !== qId) return q
            const answers = q.answers.map(a => {
                if (field === 'isCorrect' && value === true) {
                    return { ...a, isCorrect: a.id === aId }
                }
                return a.id === aId ? { ...a, [field]: value } : a
            })
            return { ...q, answers }
        }))
    }

    const addAnswer = (qId: string) => {
        setQuestions(prev => prev.map(q => q.id === qId ? {
            ...q, answers: [...q.answers, { id: generateId(), text: '', isCorrect: false }]
        } : q))
    }

    const removeQuestion = (qId: string) => setQuestions(prev => prev.filter(q => q.id !== qId))

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-24">
            {/* Quiz Settings */}
            <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Quiz Settings</h2>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Quiz Title</label>
                    <input value={title} onChange={e => setTitle(e.target.value)}
                        className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-violet-500 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Passing Score (%)</label>
                        <input type="number" min={1} max={100} value={passingScore} onChange={e => setPassingScore(+e.target.value)}
                            className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-violet-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Time Limit (minutes, blank = none)</label>
                        <input type="number" min={1} value={timeLimit} onChange={e => setTimeLimit(e.target.value ? +e.target.value : '')}
                            className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                            placeholder="No limit" />
                    </div>
                </div>
            </div>

            {/* Questions */}
            <div className="space-y-4">
                {questions.map((q, qi) => (
                    <div key={q.id} className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
                        <div className="flex items-start gap-3">
                            <GripVertical size={20} className="text-slate-300 mt-1 cursor-move flex-shrink-0" />
                            <div className="flex-1 space-y-3">
                                <div className="flex gap-3 items-center justify-between">
                                    <span className="text-sm font-semibold text-slate-500">Question {qi + 1}</span>
                                    <button onClick={() => removeQuestion(q.id)} className="text-red-400 hover:text-red-600 transition p-1">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <textarea
                                    value={q.text}
                                    onChange={e => updateQuestion(q.id, 'text', e.target.value)}
                                    placeholder="Enter your question..."
                                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-violet-500 outline-none resize-none"
                                    rows={2}
                                />
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-slate-500 uppercase">Answers (click circle to mark correct)</p>
                                    {q.answers.map((a, ai) => (
                                        <div key={a.id} className="flex items-center gap-3 group">
                                            <button onClick={() => updateAnswer(q.id, a.id, 'isCorrect', true)}
                                                className={`flex-shrink-0 transition ${a.isCorrect ? 'text-emerald-500' : 'text-slate-300 hover:text-slate-400'}`}>
                                                {a.isCorrect ? <CheckCircle size={20} /> : <Circle size={20} />}
                                            </button>
                                            <input
                                                value={a.text}
                                                onChange={e => updateAnswer(q.id, a.id, 'text', e.target.value)}
                                                placeholder={`Answer ${ai + 1}`}
                                                className={`flex-1 px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-violet-500 ${a.isCorrect ? 'border-emerald-300 bg-emerald-50' : ''}`}
                                            />
                                        </div>
                                    ))}
                                    <button onClick={() => addAnswer(q.id)}
                                        className="text-sm text-violet-600 hover:text-violet-800 font-medium flex items-center gap-1 mt-1">
                                        <Plus size={14} /> Add Answer Option
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button onClick={addQuestion}
                className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 hover:text-slate-800 hover:border-slate-400 hover:bg-slate-50 transition font-medium flex items-center justify-center gap-2">
                <Plus size={20} />
                Add Question
            </button>

            {questions.length > 0 && (
                <div className="flex justify-end">
                    <button
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition shadow-sm disabled:opacity-50">
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Quiz'}
                    </button>
                </div>
            )}
        </div>
    )
}
