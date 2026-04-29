import { create } from 'zustand'
import { Character, Session, ChatMessage } from '@/types'

interface AppStore {
  characters: Character[]
  setCharacters: (chars: Character[]) => void
  updateCharacter: (char: Character) => void

  selectedMates: Character[]
  setSelectedMates: (mates: Character[]) => void
  toggleMate: (char: Character) => void

  currentSession: Session | null
  setCurrentSession: (s: Session | null) => void

  sessionConfig: {
    purpose: string
    focus_level: string
    duration_minutes: number
  }
  setSessionConfig: (config: Partial<AppStore['sessionConfig']>) => void

  chatMessages: ChatMessage[]
  addChatMessage: (msg: ChatMessage) => void
  clearChat: () => void

  distractionCount: number
  incrementDistraction: () => void
  resetDistraction: () => void

  focusDuration: number
  setFocusDuration: (n: number) => void
}

export const useStore = create<AppStore>((set) => ({
  characters: [],
  setCharacters: (chars) => set({ characters: chars }),
  updateCharacter: (char) => set((state) => ({
    characters: state.characters.map(c => c.id === char.id ? char : c)
  })),

  selectedMates: [],
  setSelectedMates: (mates) => set({ selectedMates: mates }),
  toggleMate: (char) => set((state) => {
    const exists = state.selectedMates.find(m => m.id === char.id)
    if (exists) {
      return { selectedMates: state.selectedMates.filter(m => m.id !== char.id) }
    }
    if (state.selectedMates.length >= 4) return state
    return { selectedMates: [...state.selectedMates, char] }
  }),

  currentSession: null,
  setCurrentSession: (s) => set({ currentSession: s }),

  sessionConfig: {
    purpose: '',
    focus_level: 'Low',
    duration_minutes: 60
  },
  setSessionConfig: (config) => set((state) => ({
    sessionConfig: { ...state.sessionConfig, ...config }
  })),

  chatMessages: [],
  addChatMessage: (msg) => set((state) => ({
    chatMessages: [...state.chatMessages, msg]
  })),
  clearChat: () => set({ chatMessages: [] }),

  distractionCount: 0,
  incrementDistraction: () => set((state) => ({
    distractionCount: state.distractionCount + 1
  })),
  resetDistraction: () => set({ distractionCount: 0 }),

  focusDuration: 0,
  setFocusDuration: (n) => set({ focusDuration: n }),
}))
