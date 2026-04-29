'use client'
import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/store'
import { sendChat } from '@/lib/api'
import { ChatMessage } from '@/types'

interface Props {
  onClose: () => void
}

export default function ChatPanel({ onClose }: Props) {
  const { selectedMates, currentSession, chatMessages, addChatMessage } = useStore()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeChar, setActiveChar] = useState(selectedMates[0] || null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const question = input.trim()
    setInput('')

    addChatMessage({
      role: 'user',
      content: question,
      timestamp: new Date()
    })

    setLoading(true)
    try {
      const res = await sendChat({
        question,
        character_ids: selectedMates.map(m => m.id),
        session_id: currentSession?.session_id
      })

      for (const r of (res.responses || [])) {
        const char = selectedMates.find(m => m.name === r.name)
        addChatMessage({
          role: 'character',
          content: r.message,
          character_name: r.name,
          character_id: char?.id,
          timestamp: new Date()
        })
      }
    } catch {
      addChatMessage({
        role: 'character',
        content: '(연결 오류) Ollama가 실행 중인지 확인해주세요!',
        character_name: activeChar?.name,
        timestamp: new Date()
      })
    }
    setLoading(false)
  }

  return (
    <div className="absolute inset-0 flex flex-col bg-white/95 backdrop-blur-sm z-30 rounded-lg">
      {/* Header */}
      <div className="bg-blue-500 text-white px-4 py-3 flex items-center gap-3 rounded-t-lg">
        <button onClick={onClose} className="text-white/80 hover:text-white">
          ←
        </button>
        <div>
          <p className="font-bold text-sm">{activeChar?.name || '스터디 챗'}</p>
          <p className="text-xs text-blue-100 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-300 rounded-full inline-block"/>
            AI Bot
          </p>
        </div>
        {/* Char selector */}
        <div className="ml-auto flex gap-1">
          {selectedMates.map(m => (
            <button
              key={m.id}
              onClick={() => setActiveChar(m)}
              className={`text-lg rounded-full p-0.5 transition ${
                activeChar?.id === m.id ? 'bg-blue-300' : 'hover:bg-blue-400'
              }`}
            >
              {m.avatar}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatMessages.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            <p className="text-2xl mb-2">💬</p>
            <p className="text-sm">궁금한 거 뭐든 물어봐!</p>
          </div>
        )}
        {chatMessages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-xl">
              {activeChar?.avatar || '🤔'}
            </span>
            <div className="bg-gray-100 rounded-2xl px-4 py-2 text-sm">
              <span className="animate-pulse">생각 중...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 p-3 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type a reply..."
          className="flex-1 bg-gray-50 rounded-full px-4 py-2 text-sm outline-none focus:bg-gray-100 transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="w-9 h-9 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 disabled:opacity-40 transition-colors text-sm"
        >
          ➤
        </button>
      </div>
    </div>
  )
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  if (msg.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="bg-blue-500 text-white rounded-2xl rounded-tr-sm px-4 py-2 text-sm max-w-[75%]">
          {msg.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-2">
      <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 text-sm max-w-[80%]">
        {msg.character_name && (
          <p className="font-bold text-gray-600 text-xs mb-1">{msg.character_name}</p>
        )}
        <p className="text-gray-700 whitespace-pre-wrap">{msg.content}</p>
      </div>
    </div>
  )
}
