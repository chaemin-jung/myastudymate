'use client'
import { useEffect, useState, Suspense } from 'react'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { useStore } from '@/store'
import { getAnalytics } from '@/lib/api'
import { Analytics } from '@/types'

const STATUS_MESSAGES = [
  '오늘 공부 재밌었어!',
  '너 집중 오늘 잘하더라!',
  '또 궁금한 거 있으면 알려주던지!',
  '뿔',
]
const STATUS_COLORS = ['#FFD6E7', '#FFF3CD', '#FFF3CD', '#D4EDDA']

function AnalyticsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = parseInt(searchParams.get('session_id') || '0')
  const { selectedMates, chatMessages, distractionCount, focusDuration, clearChat } = useStore()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)

  useEffect(() => {
    if (sessionId) {
      getAnalytics(sessionId).then(setAnalytics).catch(console.error)
    }
  }, [sessionId])

  const session = analytics?.session
  const totalDistractions = session?.distraction_count ?? distractionCount
  const studyMinutes = session?.focus_duration ?? focusDuration
  const taskSwitching = Math.max(1, Math.floor(totalDistractions * 0.5))

  const handleEndSession = () => {
    clearChat()
    router.push('/')
  }

  // Simple bar chart data
  const chartData = Array.from({ length: 30 }, (_, i) => ({
    x: i + 1,
    h: Math.random() * 70 + 15
  }))

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Analytics */}
          <div className="lg:col-span-2 space-y-5">
            <h2 className="font-display font-bold text-2xl text-gray-800">Analytics</h2>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
              <StatCard
                label="Total Task Switching"
                value={taskSwitching}
                badge="Good!"
                badgeColor="green"
              />
              <StatCard
                label="Focus Duration (min)"
                value={studyMinutes}
                badge="↑ 22.1%"
                badgeColor="green"
              />
              <StatCard
                label="Interruption Counts"
                value={totalDistractions}
                badge={totalDistractions > 10 ? 'Bad' : 'OK'}
                badgeColor={totalDistractions > 10 ? 'red' : 'green'}
              />
            </div>

            {/* Chart */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-700">Study progresses</h3>
                <div className="flex gap-2 text-xs">
                  {['1 day', '1 week', '1 month', '1 year', 'All'].map(t => (
                    <button
                      key={t}
                      className={`px-2 py-0.5 rounded-full ${t === 'All' ? 'bg-gray-200 font-bold' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              {/* Mini bar chart */}
              <div className="flex items-end gap-1 h-24">
                {chartData.map(d => (
                  <div
                    key={d.x}
                    className="flex-1 bg-indigo-200 hover:bg-indigo-400 rounded-t transition-colors cursor-pointer"
                    style={{ height: `${d.h}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                {[2, 6, 10, 14, 18, 22, 26, 30].map(n => (
                  <span key={n}>{n}</span>
                ))}
              </div>
            </div>

            {/* Chat history */}
            <div className="card p-5">
              <h3 className="font-bold text-gray-700 mb-3">Chat History</h3>
              {chatMessages.length === 0 && (!analytics?.chat_history || analytics.chat_history.length === 0) ? (
                <p className="text-gray-400 text-sm">No questions asked this session.</p>
              ) : (
                <div className="space-y-3">
                  {chatMessages
                    .filter(m => m.role === 'user')
                    .map((msg, i) => {
                      const answer = chatMessages.find(
                        (m, j) => j > chatMessages.indexOf(msg) && m.role === 'character'
                      )
                      return (
                        <div key={i}>
                          <div className="bg-blue-500 text-white rounded-xl px-4 py-2 text-sm font-semibold">
                            Q. {msg.content}
                          </div>
                          {answer && (
                            <p className="text-sm text-gray-600 px-1 py-2">
                              {answer.content}
                            </p>
                          )}
                        </div>
                      )
                    })
                  }
                </div>
              )}
            </div>
          </div>

          {/* Right: Status */}
          <div className="space-y-4">
            <h2 className="font-display font-bold text-2xl text-gray-800">Status</h2>
            {selectedMates.map((mate, i) => (
              <div
                key={mate.id}
                className="flex items-center gap-3 rounded-2xl px-4 py-4"
                style={{ backgroundColor: STATUS_COLORS[i % STATUS_COLORS.length] }}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-white shadow-sm"><Image src={mate.avatar} alt={mate.name} width={48} height={48} className="object-cover w-full h-full" /></div>
                <p className="text-sm font-semibold text-gray-700">
                  {STATUS_MESSAGES[i % STATUS_MESSAGES.length]}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleEndSession}
            className="btn-primary px-12 py-4 text-lg"
          >
            End Session
          </button>
        </div>
      </main>
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AnalyticsContent />
    </Suspense>
  )
}

function StatCard({
  label,
  value,
  badge,
  badgeColor
}: {
  label: string
  value: number
  badge: string
  badgeColor: 'green' | 'red'
}) {
  return (
    <div className="card p-4">
      <p className="text-xs text-gray-500 mb-2">{label}</p>
      <div className="flex items-end justify-between">
        <span className="font-display font-bold text-3xl text-gray-800">{value}</span>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            badgeColor === 'green'
              ? 'bg-green-100 text-green-600'
              : 'bg-red-100 text-red-500'
          }`}
        >
          {badge}
        </span>
      </div>
    </div>
  )
}
