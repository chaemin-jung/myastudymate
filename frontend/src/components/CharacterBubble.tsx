'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Character } from '@/types'
import { updateAffection } from '@/lib/api'
import { useStore } from '@/store'

interface Props {
  character: Character
  style?: React.CSSProperties
}

const GREETING_BY_PERSONALITY: Record<string, string[]> = {
  strict: ['오늘 공부 몇 시간 할 거야?', '집중할 준비 됐어?', '딴짓 금지.'],
  soft:   ['오늘 공부 몇시에 할래?', '같이 공부해요~', '오늘도 화이팅이에요!'],
  friend: ['야 오늘 같이 공부하자ㅋ', '몇 시에 시작해?', '오늘 뭐 공부해?'],
}

function AffinityHearts({ level }: { level: number }) {
  const filled = Math.round((level / 100) * 5)
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`text-lg transition-all ${i < filled ? 'text-red-400' : 'text-gray-300'}`}>
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
        <button
          onClick={handleClick}
          className="w-16 h-16 rounded-full border-[3px] border-white shadow-lg hover:scale-110 transition-transform duration-200 overflow-hidden bg-white cursor-pointer"
        >
          <Image
            src={character.avatar}
            alt={character.name}
            width={64}
            height={64}
            className="w-full h-full object-cover rounded-full"
          />
        </button>

        {showPopup && (
          <div className="absolute bottom-[72px] right-0 bg-white rounded-2xl shadow-xl p-4 w-52 pop-in z-50">
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-2 right-3 text-gray-300 hover:text-gray-500 text-sm"
            >✕</button>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                <Image src={character.avatar} alt={character.name} width={32} height={32} className="object-cover" />
              </div>
              <p className="font-display font-bold text-gray-800 text-base">{character.name}</p>
            </div>
            <AffinityHearts level={character.affection} />
            <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2">{greeting}</p>
          </div>
        )}
      </div>
    </div>
  )
}
