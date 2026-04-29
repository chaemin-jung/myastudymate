'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store'
import { endSession, getFocusReminder } from '@/lib/api'
import ChatPanel from '@/components/ChatPanel'

const INACTIVITY_THRESHOLD = 30_000 // 30 seconds

export default function SessionPage() {
  const router = useRouter()
  const {
    selectedMates,
    currentSession,
    distractionCount,
    incrementDistraction,
    resetDistraction,
    setFocusDuration,
    clearChat,
  } = useStore()

  const [showChat, setShowChat] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [reminderMsg, setReminderMsg] = useState<{ text: string; char: string } | null>(null)
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startTime = useRef(Date.now())

  // Timer
  useEffect(() => {
    const interval = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
  }

  // Focus / inactivity detection
  const resetInactivity = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
    inactivityTimer.current = setTimeout(async () => {
      if (selectedMates.length === 0) return
      const randomMate = selectedMates[Math.floor(Math.random() * selectedMates.length)]
      incrementDistraction()
      try {
        const res = await getFocusReminder(randomMate.id)
        setReminderMsg({ text: res.message, char: randomMate.avatar })
        setTimeout(() => setReminderMsg(null), 4000)
      } catch {
        setReminderMsg({ text: '집중해!', char: randomMate.avatar })
        setTimeout(() => setReminderMsg(null), 3000)
      }
    }, INACTIVITY_THRESHOLD)
  }, [selectedMates, incrementDistraction])

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    events.forEach(e => window.addEventListener(e, resetInactivity))
    resetInactivity()
    return () => {
      events.forEach(e => window.removeEventListener(e, resetInactivity))
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
    }
  }, [resetInactivity])

  const handleLeave = async () => {
    const focusDuration = Math.floor((Date.now() - startTime.current) / 1000 / 60)
    setFocusDuration(focusDuration)
    if (currentSession) {
      try {
        await endSession({
          session_id: currentSession.session_id,
          distraction_count: distractionCount,
          focus_duration: focusDuration,
        })
      } catch {}
    }
    resetDistraction()
    router.push(`/analytics?session_id=${currentSession?.session_id || 0}`)
  }

  // Fake video tiles
  const videoTiles = selectedMates.slice(0, 4)
  while (videoTiles.length < 4) videoTiles.push(null as any)

  const gridClass = selectedMates.length <= 1
    ? 'grid-cols-1'
    : selectedMates.length <= 2
    ? 'grid-cols-2'
    : 'grid-cols-2'

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-800 text-white">
        <span className="font-mono font-bold text-lg">{formatTime(elapsed)}</span>
        <div className="flex items-center gap-6">
          <ControlBtn icon="🎥" label="camera" />
          <ControlBtn
            icon="💬"
            label="chat"
            active={showChat}
            onClick={() => setShowChat(!showChat)}
          />
          <ControlBtn icon="🎤" label="mic" />
        </div>
        <button
          onClick={() => setShowLeaveConfirm(true)}
          className="bg-red-500 hover:bg-red-600 text-white font-bold px-5 py-2 rounded-full transition-colors"
        >
          End Call
        </button>
      </div>

      {/* Video grid */}
      <div className={`flex-1 grid ${gridClass} gap-1 p-1 relative overflow-hidden`}>
        {videoTiles.map((mate, i) => (
          <VideoTile key={i} mate={mate} reminderMsg={reminderMsg} isFirst={i === 0} />
        ))}

        {/* Chat overlay */}
        {showChat && (
          <div className="absolute right-0 top-0 h-full w-80 shadow-2xl">
            <ChatPanel onClose={() => setShowChat(false)} />
          </div>
        )}

        {/* Reminder toast */}
        {reminderMsg && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-xl pop-in max-w-xs">
            <p className="text-gray-800 font-semibold text-sm">
              {reminderMsg.char} {reminderMsg.text}
            </p>
          </div>
        )}
      </div>

      {/* Leave confirm */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4 fade-in-up text-center">
            <h2 className="font-display font-bold text-xl mb-2">
              Do you want to leave<br />the study session?
            </h2>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleLeave}
                className="flex-1 btn-primary py-3"
              >
                Yes
              </button>
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 btn-secondary py-3"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ControlBtn({
  icon,
  label,
  active,
  onClick
}: {
  icon: string
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-colors ${
        active ? 'text-teal-400' : 'text-gray-400 hover:text-white'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-xs">{label}</span>
    </button>
  )
}

function VideoTile({
  mate,
  reminderMsg,
  isFirst
}: {
  mate: any
  reminderMsg: any
  isFirst: boolean
}) {
  const TILE_COLORS = ['#1a1a2e', '#16213e', '#0f3460', '#1b1b2f']
  const idx = mate ? 0 : 1

  if (!mate) {
    return (
      <div className="bg-gray-800 flex items-center justify-center rounded-sm">
        <div className="text-gray-600 text-4xl opacity-30">📷</div>
      </div>
    )
  }

  return (
    <div
      className="relative flex items-center justify-center overflow-hidden rounded-sm"
      style={{ background: `linear-gradient(135deg, ${TILE_COLORS[idx % 4]}, #2d2d44)` }}
    >
      {/* Fake video - big emoji face */}
      <div className="text-8xl select-none" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}>
        {mate.avatar}
      </div>

      {/* Name tag */}
      <div className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">
        {mate.name}
      </div>

      {/* Affection indicator */}
      <div className="absolute top-3 right-3 text-xs text-white/60">
        {'♥'.repeat(Math.round(mate.affection / 20))}
      </div>

      {/* Reminder speech bubble on first tile */}
      {isFirst && reminderMsg && (
        <div className="absolute top-4 left-4 bg-white/90 text-gray-800 text-sm font-semibold rounded-2xl px-3 py-2 max-w-[160px] pop-in">
          {reminderMsg.text}
        </div>
      )}
    </div>
  )
}
