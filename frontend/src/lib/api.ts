const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function fetchCharacters() {
  const res = await fetch(`${API}/characters`)
  return res.json()
}

export async function fetchCharacter(id: string) {
  const res = await fetch(`${API}/characters/${id}`)
  return res.json()
}

export async function updateAffection(character_id: string, delta: number) {
  const res = await fetch(`${API}/characters/affection`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ character_id, delta })
  })
  return res.json()
}

export async function createSession(data: {
  purpose: string
  focus_level: string
  duration_minutes: number
}) {
  const res = await fetch(`${API}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}

export async function endSession(data: {
  session_id: number
  distraction_count: number
  focus_duration: number
}) {
  const res = await fetch(`${API}/sessions/end`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}

export async function getAnalytics(session_id: number) {
  const res = await fetch(`${API}/sessions/${session_id}/analytics`)
  return res.json()
}

export async function sendChat(data: {
  question: string
  character_ids: string[]
  session_id?: number
}) {
  const res = await fetch(`${API}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}

export async function getFocusReminder(character_id: string) {
  const res = await fetch(`${API}/focus-reminder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ character_id })
  })
  return res.json()
}
