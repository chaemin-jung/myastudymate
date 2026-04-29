# 🐱 StudyWithMya (스터디윗먀)

AI study companion web app with Animal Crossing-style characters.

---

## Prerequisites

- Python 3.10+
- Node.js 18+
- [Ollama](https://ollama.com) installed locally

---

## 1. Install & Start Ollama

```bash
# Install Ollama (mac/linux)
curl -fsSL https://ollama.com/install.sh | sh

# Pull the model
ollama pull llama3
# or: ollama pull mistral

# Start Ollama (usually auto-starts)
ollama serve
```

---

## 2. Start the Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000

---

## 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:3000

---

## App Flow

1. **Home** → see characters in the Mya'ouse, click to view affection
2. **Create Session** → set purpose, focus level, duration
3. **Mates** → select up to 4 AI study companions
4. **Session** → study with fake-zoom UI, chat with AI
5. **Analytics** → review focus stats & chat history

---

## Environment Variables

Frontend: `frontend/.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Backend: set `OLLAMA_MODEL` to change model
```bash
OLLAMA_MODEL=mistral uvicorn main:app --reload
```

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14 + TypeScript + Tailwind |
| State | Zustand |
| Backend | FastAPI + SQLite |
| AI | Ollama (llama3/mistral) |

---

## Characters

| Name | Personality | Subject |
|------|------------|---------|
| 몽실이 | soft | 영어 |
| 까탈이 | strict | 수학 |
| 보리 | friend | 역사 |
| 이루 | soft | 미적분 |
| 도토리 | strict | 통계 |
| 쿠쿠 | friend | 사회과학 |
| 하린 | soft | 물리 |
| 솔비 | friend | 화학 |
| 찌구 | strict | 생명과학 |

Affection levels affect chat tone:
- < 30 → cold
- 30–70 → neutral  
- > 70 → warm/caring

Affection increases +1 on click, +2 per chat.
