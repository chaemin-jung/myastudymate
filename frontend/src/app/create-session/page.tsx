'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { useStore } from '@/store'
import { createSession } from '@/lib/api'

const FOCUS_LEVELS = ['None', 'Low', 'Medium', 'High']
const DURATION_OPTIONS = [25, 30, 45, 60, 90, 120]

export default function CreateSessionPage() {
  const router = useRouter()
  const { sessionConfig, setSessionConfig, setCurrentSession } = useStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleNext = async () => {
    if (!sessionConfig.purpose.trim()) {
      setError('Purpose is required')
      return
    }
    setLoading(true)
    try {
      const res = await createSession(sessionConfig)
      setCurrentSession({ session_id: res.session_id, ...sessionConfig })
      router.push('/mates')
    } catch {
      setError('Failed to create session. Is the backend running?')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f7fa' }}>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="font-display font-bold text-2xl text-gray-800 mb-6">
          Create Session:
        </h1>

        <div className="space-y-4">
          {/* Purpose */}
          <div className="card p-6 border-l-4 border-blue-500">
            <label className="block font-bold text-gray-700 mb-3">
              <span className="text-red-500 mr-1">*</span>Purpose:
            </label>
            <textarea
              value={sessionConfig.purpose}
              onChange={e => {
                setSessionConfig({ purpose: e.target.value })
                setError('')
              }}
              placeholder="What are you studying today?"
              className="w-full bg-transparent border-b-2 border-gray-200 focus:border-blue-400 outline-none resize-none text-gray-700 pb-2 mt-1 transition-colors"
              rows={3}
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          {/* Focus Level + Duration */}
          <div className="card p-6 space-y-6">
            {/* Focus Level */}
            <div>
              <label className="block font-bold text-gray-700 mb-3">
                <span className="text-red-500 mr-1">*</span>Focus Level:
              </label>
              <div className="flex gap-3 flex-wrap">
                {FOCUS_LEVELS.map(level => (
                  <button
                    key={level}
                    onClick={() => setSessionConfig({ focus_level: level })}
                    className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-200 ${
                      sessionConfig.focus_level === level
                        ? 'bg-blue-500 text-white shadow-md shadow-blue-200'
                        : 'bg-blue-50 text-blue-400 hover:bg-blue-100'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Study Duration */}
            <div>
              <label className="block font-bold text-gray-700 mb-3">
                <span className="text-red-500 mr-1">*</span>Study Hours
              </label>
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <button
                    onClick={() => {
                      const idx = DURATION_OPTIONS.indexOf(sessionConfig.duration_minutes)
                      if (idx < DURATION_OPTIONS.length - 1) {
                        setSessionConfig({ duration_minutes: DURATION_OPTIONS[idx + 1] })
                      }
                    }}
                    className="w-8 h-6 bg-blue-400 text-white rounded-t-lg hover:bg-blue-500 flex items-center justify-center text-xs"
                  >▲</button>
                  <button
                    onClick={() => {
                      const idx = DURATION_OPTIONS.indexOf(sessionConfig.duration_minutes)
                      if (idx > 0) {
                        setSessionConfig({ duration_minutes: DURATION_OPTIONS[idx - 1] })
                      }
                    }}
                    className="w-8 h-6 bg-blue-400 text-white rounded-b-lg hover:bg-blue-500 flex items-center justify-center text-xs"
                  >▼</button>
                </div>
                <div className="bg-blue-500 text-white rounded-xl px-8 py-3 font-bold text-2xl min-w-[140px] text-center">
                  {sessionConfig.duration_minutes} <span className="text-base font-normal">min</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={handleNext}
            disabled={loading}
            className="btn-primary px-10 py-3 text-base disabled:opacity-60"
          >
            {loading ? '...' : 'Next'}
          </button>
          <span className="text-gray-400">▶</span>
        </div>
      </main>
    </div>
  )
}
