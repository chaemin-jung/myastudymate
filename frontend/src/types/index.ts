export interface Character {
  id: string
  name: string
  personality: 'strict' | 'soft' | 'friend'
  affection: number
  subject: string
  avatar: string
}

export interface Session {
  session_id: number
  purpose: string
  focus_level: string
  duration_minutes: number
}

export interface ChatMessage {
  role: 'user' | 'character'
  content: string
  character_name?: string
  character_id?: string
  timestamp: Date
}

export interface Analytics {
  session: {
    id: number
    purpose: string
    focus_level: string
    duration_minutes: number
    distraction_count: number
    focus_duration: number
  }
  chat_history: Array<{
    question: string
    answer: string
    character_id: string
  }>
}
