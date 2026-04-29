'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import CharacterBubble from '@/components/CharacterBubble'
import { useStore } from '@/store'
import { fetchCharacters } from '@/lib/api'
import { Character } from '@/types'

// Positions on the house illustration (percentage-based)
const CHARACTER_POSITIONS = [
  { top: '14%', left: '50%' },   // roof
  { top: '40%', left: '22%' },   // 2F left balcony
  { top: '42%', left: '43%' },   // 2F middle
  { top: '42%', left: '60%' },   // 2F right
  { top: '63%', left: '48%' },   // 1F middle
  { top: '77%', left: '38%' },   // GF left
  { top: '77%', left: '52%' },   // GF middle
  { top: '77%', left: '64%' },   // GF right
  { top: '82%', left: '15%' },   // outside left
]

export default function HomePage() {
  const router = useRouter()
  const { characters, setCharacters } = useStore()

  useEffect(() => {
    fetchCharacters().then(setCharacters).catch(console.error)
  }, [setCharacters])

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF5E4' }}>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="font-display font-bold text-2xl text-gray-800 mb-4">
          Mya&apos;ouse:
        </h1>

        {/* House container */}
        <div className="relative w-full" style={{ maxWidth: '600px', margin: '0 auto' }}>
          {/* House SVG illustration */}
          <div
            className="relative"
            style={{
              background: 'linear-gradient(180deg, #FFD898 0%, #FFC56A 100%)',
              borderRadius: '24px',
              padding: '20px',
              minHeight: '520px',
            }}
          >
            {/* Simple house illustration using CSS */}
            <HouseIllustration />

            {/* Characters positioned on house */}
            {characters.map((char: Character, i: number) => {
              const pos = CHARACTER_POSITIONS[i % CHARACTER_POSITIONS.length]
              return (
                <CharacterBubble
                  key={char.id}
                  character={char}
                  style={pos}
                />
              )
            })}
          </div>
        </div>

        {/* Quick start */}
        <div className="mt-6 flex gap-3 justify-center">
          <button
            onClick={() => router.push('/create-session')}
            className="btn-primary text-base px-8 py-3"
          >
            🎓 공부 시작하기
          </button>
          <button
            onClick={() => router.push('/mates')}
            className="btn-secondary text-base px-8 py-3"
          >
            👥 메이트 보기
          </button>
        </div>
      </main>
    </div>
  )
}

function HouseIllustration() {
  return (
    <svg
      viewBox="0 0 500 520"
      className="w-full h-full absolute inset-0 opacity-30 pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Roof */}
      <polygon points="60,180 250,40 440,180" fill="#C47B2B" stroke="#A0621F" strokeWidth="2"/>
      {/* Attic window */}
      <rect x="220" y="100" width="60" height="50" rx="5" fill="#E8D5B0" stroke="#A0621F" strokeWidth="1.5"/>
      {/* Main body */}
      <rect x="80" y="175" width="340" height="320" fill="#D4904A" stroke="#A0621F" strokeWidth="2"/>
      {/* 2F floor divider */}
      <line x1="80" y1="310" x2="420" y2="310" stroke="#A0621F" strokeWidth="2"/>
      {/* 1F floor divider */}
      <line x1="80" y1="420" x2="420" y2="420" stroke="#A0621F" strokeWidth="2"/>
      {/* Windows 2F */}
      <rect x="100" y="220" width="70" height="60" rx="5" fill="#E8D5B0" stroke="#A0621F" strokeWidth="1.5"/>
      <rect x="300" y="220" width="70" height="60" rx="5" fill="#E8D5B0" stroke="#A0621F" strokeWidth="1.5"/>
      {/* Door */}
      <rect x="195" y="435" width="70" height="60" rx="5" fill="#8B5E2A" stroke="#6B4420" strokeWidth="1.5"/>
      <circle cx="255" cy="465" r="4" fill="#FFD700"/>
      {/* Left balcony */}
      <rect x="40" y="280" width="80" height="30" fill="#C47B2B" stroke="#A0621F" strokeWidth="1.5" rx="3"/>
    </svg>
  )
}
