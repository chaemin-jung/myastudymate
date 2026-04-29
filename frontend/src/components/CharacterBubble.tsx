'use client'
import { useState } from 'react'
import { Character } from '@/types'
import { updateAffection } from '@/lib/api'
import { useStore } from '@/store'

interface Props {
  character: Character
  style?: React.CSSProperties
}

const GREETING_BY_PERSONALITY: Record<string, string[]> = {
  strict: ['오늘 공부 몇 시간 할 거야?', '집중할 준비 됐어?', '딴짓 금지.'],
  soft: ['오늘 공부 몇시에 할래?', '같이 공부해요~', '오늘도 화이팅이에요!'],
  friend: ['야 오늘 같이 공부하자ㅋ', '몇 시에 시작해?', '오늘 뭐 공부해?'],
}

function AffinityHearts({ level }: { level: number }) {
  const filled = Math.round((level / 100) * 5)
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`text-lg transition-all ${i < filled ? 'text-red-400' : 'text-gray-300'}`}
        >
          {i < filled ? '♥' : '♡'}
        </span>
      ))}
    </div>
  )
}

export default function CharacterBubble({ character, style }: Props) {
  const [showPopup, setShowPopup] = useState(false)
  const updateCharacter = useStore(s => s.updateCharacter)

  const greetings = GREETING_BY_PERSONALITY[character.personality] || GREETING_BY_PERSONALITY.soft
  const greeting = greetings[Math.floor(Math.random() * greetings.length)]

  const handleClick = async () => {
    setShowPopup(!showPopup)
    if (!showPopup) {
      try {
        const updated = await updateAffection(character.id, 1)
        updateCharacter(updated)
      } catch {}
    }
  }

  return (
    <div className="absolute" style={style}>
      <div className="relative">
        {/* Character avatar */}
        <button
          onClick={handleClick}
          className="w-14 h-14 rounded-full border-3 border-white shadow-lg hover:scale-110 transition-transform duration-200 char-bounce overflow-hidden bg-amber-100 text-2xl flex items-center justify-center cursor-pointer"
          style={{ animationDelay: `${Math.random() * 2}s` }}
        >
          {character.avatar}
        </button>

        {/* Popup */}
        {showPopup && (
          <div
            className="absolute bottom-16 right-0 bg-white rounded-2xl shadow-xl p-4 w-52 pop-in z-50"
            style={{ minWidth: '200px' }}
          >
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-2 right-3 text-gray-300 hover:text-gray-500 text-sm"
            >✕</button>
            <p className="font-display font-bold text-gray-800 text-base mb-2">
              {character.name}
            </p>
            <AffinityHearts level={character.affection} />
            <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2">
              {greeting}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
