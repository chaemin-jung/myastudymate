from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
import json
import httpx
import asyncio
from datetime import datetime
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "studywithmya.db"
OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS characters (
            id TEXT PRIMARY KEY,
            name TEXT,
            personality TEXT,
            affection INTEGER DEFAULT 50,
            subject TEXT,
            avatar TEXT
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            purpose TEXT,
            focus_level TEXT,
            duration_minutes INTEGER,
            started_at TEXT,
            ended_at TEXT,
            distraction_count INTEGER DEFAULT 0,
            focus_duration INTEGER DEFAULT 0
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER,
            question TEXT,
            answer TEXT,
            character_id TEXT,
            timestamp TEXT
        )
    """)

    # Seed characters
    characters = [
        ("dog",   "보리",   "friend", 60, "역사",   "/characters/dog.png"),
        ("cat",   "까탈이", "strict", 45, "수학",   "/characters/cat.png"),
        ("deer",  "몽실이", "soft",   80, "영어",   "/characters/deer.png"),
        ("dino",  "도토리", "strict", 55, "통계",   "/characters/dino.png"),
        ("bear",  "이루",   "strict", 30, "미적분", "/characters/bear.png"),
        ("bunny", "솔비",   "soft",   50, "화학",   "/characters/bunny.png"),
        ("pig",   "찌구",   "friend", 40, "생명과학","/characters/pig.png"),
        ("duck",  "하린",   "soft",   65, "물리",   "/characters/duck.png"),
        ("sheep", "쿠쿠",   "friend", 70, "사회과학","/characters/sheep.png"),
    ]
    c.executemany(
        "INSERT OR IGNORE INTO characters VALUES (?,?,?,?,?,?)",
        characters
    )
    conn.commit()
    conn.close()

init_db()

# ─── Models ───────────────────────────────────────────────

class ChatRequest(BaseModel):
    question: str
    character_ids: List[str]
    session_id: Optional[int] = None

class SessionCreate(BaseModel):
    purpose: str
    focus_level: str
    duration_minutes: int

class SessionEnd(BaseModel):
    session_id: int
    distraction_count: int
    focus_duration: int

class AffectionUpdate(BaseModel):
    character_id: str
    delta: int

# ─── Characters ───────────────────────────────────────────

@app.get("/characters")
def get_characters():
    conn = get_db()
    chars = conn.execute("SELECT * FROM characters").fetchall()
    conn.close()
    return [dict(c) for c in chars]

@app.get("/characters/{character_id}")
def get_character(character_id: str):
    conn = get_db()
    char = conn.execute("SELECT * FROM characters WHERE id=?", (character_id,)).fetchone()
    conn.close()
    if not char:
        raise HTTPException(404, "Character not found")
    return dict(char)

@app.post("/characters/affection")
def update_affection(req: AffectionUpdate):
    conn = get_db()
    conn.execute(
        "UPDATE characters SET affection = MAX(0, MIN(100, affection + ?)) WHERE id=?",
        (req.delta, req.character_id)
    )
    conn.commit()
    char = conn.execute("SELECT * FROM characters WHERE id=?", (req.character_id,)).fetchone()
    conn.close()
    return dict(char)

# ─── Sessions ─────────────────────────────────────────────

@app.post("/sessions")
def create_session(req: SessionCreate):
    conn = get_db()
    c = conn.cursor()
    c.execute(
        "INSERT INTO sessions (purpose, focus_level, duration_minutes, started_at) VALUES (?,?,?,?)",
        (req.purpose, req.focus_level, req.duration_minutes, datetime.now().isoformat())
    )
    session_id = c.lastrowid
    conn.commit()
    conn.close()
    return {"session_id": session_id}

@app.post("/sessions/end")
def end_session(req: SessionEnd):
    conn = get_db()
    conn.execute(
        "UPDATE sessions SET ended_at=?, distraction_count=?, focus_duration=? WHERE id=?",
        (datetime.now().isoformat(), req.distraction_count, req.focus_duration, req.session_id)
    )
    conn.commit()
    session = conn.execute("SELECT * FROM sessions WHERE id=?", (req.session_id,)).fetchone()
    conn.close()
    return dict(session)

@app.get("/sessions/{session_id}/analytics")
def get_analytics(session_id: int):
    conn = get_db()
    session = conn.execute("SELECT * FROM sessions WHERE id=?", (session_id,)).fetchone()
    chats = conn.execute(
        "SELECT * FROM chat_history WHERE session_id=?", (session_id,)
    ).fetchall()
    conn.close()
    if not session:
        raise HTTPException(404)
    return {
        "session": dict(session),
        "chat_history": [dict(c) for c in chats]
    }

# ─── AI Chat ──────────────────────────────────────────────

def build_prompt(question: str, characters: list) -> str:
    char_descriptions = []
    for c in characters:
        personality = c["personality"]
        affection = c["affection"]
        name = c["name"]
        subject = c["subject"]

        if affection < 30:
            affection_tone = "cold and distant"
        elif affection > 70:
            affection_tone = "warm and caring"
        else:
            affection_tone = "neutral"

        if personality == "strict":
            style = "short, direct, slightly aggressive, no fluff"
        elif personality == "soft":
            style = "gentle, encouraging, warm"
        else:
            style = "casual, friendly, uses informal language"

        char_descriptions.append(
            f'- {name}: personality={style}, affection={affection_tone}, expertise={subject}'
        )

    chars_text = "\n".join(char_descriptions)

    return f"""You are simulating multiple AI study companion characters answering a student's question.

Characters:
{chars_text}

Student question: {question}

Respond ONLY with valid JSON in this exact format, nothing else:
{{
  "responses": [
    {{"name": "character_name", "message": "response in character's unique voice"}}
  ]
}}

Each character responds in their own personality and tone. Keep responses under 80 words each. Answer in the same language as the question."""

@app.post("/chat")
async def chat(req: ChatRequest):
    conn = get_db()
    characters = []
    for cid in req.character_ids:
        char = conn.execute("SELECT * FROM characters WHERE id=?", (cid,)).fetchone()
        if char:
            characters.append(dict(char))
    conn.close()

    if not characters:
        raise HTTPException(400, "No valid characters")

    prompt = build_prompt(req.question, characters)

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(OLLAMA_URL, json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False
            })
            result = response.json()
            raw_text = result.get("response", "")

            # Parse JSON from response
            start = raw_text.find("{")
            end = raw_text.rfind("}") + 1
            if start == -1 or end == 0:
                raise ValueError("No JSON found")
            parsed = json.loads(raw_text[start:end])

    except Exception as e:
        # Fallback responses if Ollama fails
        parsed = {
            "responses": [
                {"name": c["name"], "message": f"(Ollama offline) I'd be happy to help with that question!"}
                for c in characters
            ]
        }

    # Save to history
    if req.session_id:
        conn = get_db()
        for r in parsed.get("responses", []):
            conn.execute(
                "INSERT INTO chat_history (session_id, question, answer, character_id, timestamp) VALUES (?,?,?,?,?)",
                (req.session_id, req.question, r["message"],
                 next((c["id"] for c in characters if c["name"] == r["name"]), ""),
                 datetime.now().isoformat())
            )
        conn.commit()
        # Increase affection for chatting
        for cid in req.character_ids:
            conn.execute(
                "UPDATE characters SET affection = MIN(100, affection + 2) WHERE id=?", (cid,)
            )
        conn.commit()
        conn.close()

    return parsed

# ─── Focus reminder ───────────────────────────────────────

@app.post("/focus-reminder")
async def focus_reminder(data: dict):
    character_id = data.get("character_id")
    conn = get_db()
    char = conn.execute("SELECT * FROM characters WHERE id=?", (character_id,)).fetchone()
    conn.close()

    if not char:
        return {"message": "Hey, focus up!"}

    char = dict(char)
    personality = char["personality"]
    affection = char["affection"]

    if personality == "strict":
        msgs = ["야, 집중해.", "딴짓하지 마.", "지금 뭐해?", "핸드폰 내려놔."]
    elif personality == "soft":
        msgs = ["조금만 더 집중해봐요~", "힘들면 잠깐 쉬고 다시 해요!", "집중 잘 하고 있어요?"]
    else:
        msgs = ["야 집중해ㅋㅋ", "너 지금 딴짓하지...", "다시 공부하자!"]

    import random
    return {"message": random.choice(msgs), "character": char["name"]}
