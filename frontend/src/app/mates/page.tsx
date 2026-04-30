'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import { useStore } from '@/store'
import { fetchCharacters } from '@/lib/api'
import { Character } from '@/types'

const HOBBIES: Record<string, string> = {
  dog:   '산책하기',
  cat:   '사과 먹기',
  deer:  '당근 뽑기',
  dino:  '케이크 만들기',
  bear:  '쓰레기 줍기',
  bunny: '조개껍질 줍기',
  pig:   '꽃 심기',
  duck:  '비료 주기',
  sheep: '세수하기',
}

export default function MatesPage() {
  const router = useRouter()
  const { characters, setCharacters, selectedMates, toggleMate } = useStore()
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (characters.length === 0) {
      fetchCharacters().then(setCharacters).catch(console.error)
    }
  }, [characters.length, setCharacters])

  const isSelected = (id: string) => selectedMates.some(m => m.id === id)

  const startSession = () => router.push('/session')

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f7fa' }}>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="font-display font-bold text-2xl text-gray-800 mb-6">
          Find your online study mate ({selectedMates.length}/4)
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map((char: Character) => (
            <CharacterCard
              key={char.id}
              character={char}
              selected={isSelected(char.id)}
              onToggle={() => {
                if (!isSelected(char.id) && selectedMates.length >= 4) return
                toggleMate(char)
              }}
              disabled={!isSelected(char.id) && selectedMates.length >= 4}
            />
          ))}
        </div>

        {selectedMates.length > 0 && (
          <div className="mt-6 flex justify-center">
            <button onClick={() => setShowConfirm(true)} className="btn-primary px-10 py-3 text-base">
              공부 시작! ({selectedMates.length}명 선택됨)
            </button>
          </div>
        )}
      </main>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4 fade-in-up">
            <h2 className="font-display font-bold text-xl text-center mb-4">Confirm your invitation</h2>
            <div className="flex justify-center gap-3 mb-6">
              {selectedMates.map(m => (
                <div key={m.id} className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-300 shadow">
                  <Image src={m.avatar} alt={m.name} width={48} height={48} className="object-cover w-full h-full" />
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={startSession} className="flex-1 btn-primary py-3 text-base">Yes</button>
              <button onClick={() => setShowConfirm(false)} className="flex-1 btn-secondary py-3 text-base">No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CharacterCard({ character, selected, onToggle, disabled }: {
  character: Character
  selected: boolean
  onToggle: () => void
  disabled: boolean
}) {
  const ages: Record<string,string> = {
    dog:'350세 추정', cat:'70세 추정', deer:'25세 추정',
    dino:'500세 추정', bear:'10세 추정', bunny:'25세 추정',
    pig:'900세 추정', duck:'20세 추정', sheep:'780세 추정',
  }

  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`text-left rounded-2xl overflow-hidden flex items-center gap-0 transition-all duration-200 border-2 ${
        selected ? 'bg-blue-50 border-blue-400 shadow-md'
        : disabled ? 'bg-gray-50 border-transparent opacity-50 cursor-not-allowed'
        : 'bg-white border-transparent hover:border-blue-200 hover:shadow-md cursor-pointer'
      }`}
    >
      {/* Square image left side */}
      <div className="relative w-24 h-24 flex-shrink-0">
        <Image
          src={character.avatar}
          alt={character.name}
          fill
          className="object-cover"
        />
        {selected && (
          <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
            <span className="text-white text-2xl font-bold drop-shadow">✓</span>
          </div>
        )}
      </div>

      {/* Info right side */}
      <div className="px-4 py-3 flex-1">
        <p className="font-display font-bold text-gray-800 text-base">{character.name}</p>
        <p className="text-xs text-gray-500 mt-0.5">나이: {ages[character.id] || '??세 추정'}</p>
        <p className="text-xs text-gray-500">전공: {HOBBIES[character.id] || '산책하기'}</p>
        <p className="text-xs text-gray-700 font-semibold mt-0.5">잘하는 분야: {character.subject}</p>
      </div>
    </button>
  )
}
