'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { useStore } from '@/store'
import { fetchCharacters } from '@/lib/api'
import { Character } from '@/types'

export default function MatesPage() {
  const router = useRouter()
  const { characters, setCharacters, selectedMates, toggleMate, currentSession } = useStore()
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (characters.length === 0) {
      fetchCharacters().then(setCharacters).catch(console.error)
    }
  }, [characters.length, setCharacters])

  const isSelected = (id: string) => selectedMates.some(m => m.id === id)

  const handleConfirm = () => {
    if (selectedMates.length === 0) return
    setShowConfirm(true)
  }

  const startSession = () => {
    router.push('/session')
  }

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
            <button
              onClick={handleConfirm}
              className="btn-primary px-10 py-3 text-base"
            >
              공부 시작! ({selectedMates.length}명 선택됨)
            </button>
          </div>
        )}
      </main>

      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4 fade-in-up">
            <h2 className="font-display font-bold text-xl text-center mb-4">
              Confirm your invitation
            </h2>
            <div className="flex justify-center gap-3 mb-6">
              {selectedMates.map(m => (
                <span key={m.id} className="text-3xl">{m.avatar}</span>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={startSession}
                className="flex-1 btn-primary py-3 text-base"
              >
                Yes
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 btn-secondary py-3 text-base"
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

function CharacterCard({
  character,
  selected,
  onToggle,
  disabled
}: {
  character: Character
  selected: boolean
  onToggle: () => void
  disabled: boolean
}) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`text-left rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 border-2 ${
        selected
          ? 'bg-blue-50 border-blue-400 shadow-md'
          : disabled
          ? 'bg-gray-50 border-transparent opacity-50 cursor-not-allowed'
          : 'bg-white border-transparent hover:border-blue-200 hover:shadow-md cursor-pointer'
      }`}
    >
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 ${
        selected ? 'bg-blue-100' : 'bg-amber-50'
      }`}>
        {character.avatar}
        {selected && (
          <span className="absolute text-green-500 text-xs font-bold">✓</span>
        )}
      </div>
      <div className="relative">
        {selected && (
          <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1 rounded">✓ selected</div>
        )}
        <p className="font-display font-bold text-gray-800">{character.name}</p>
        <p className="text-xs text-gray-500 mt-0.5">나이: {Math.floor(Math.random() * 900 + 10)}세 추정</p>
        <p className="text-xs text-gray-500">전공: {getHobby(character.id)}</p>
        <p className="text-xs text-gray-600 font-semibold">잘하는 분야: {character.subject}</p>
      </div>
    </button>
  )
}

const HOBBIES: Record<string, string> = {
  mongsil: '당근 뽑기',
  kkatal: '사과 먹기',
  bori: '눈 안감기',
  iru: '쓰레기 줍기',
  dotori: '케이크 만들기',
  kuku: '세수하기',
  harin: '비료 주기',
  solbi: '조개껍질 줍기',
  jjigu: '꽃 심기',
}

function getHobby(id: string): string {
  return HOBBIES[id] || '산책하기'
}
