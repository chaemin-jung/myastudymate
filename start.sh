#!/bin/bash
echo "🐱 Starting StudyWithMya..."

# Start backend in background
echo "→ Starting backend on :8000"
cd backend
pip install -r requirements.txt -q
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

sleep 2

# Start frontend
echo "→ Starting frontend on :3000"
cd frontend
npm install --silent
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ App running!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo ""
echo "Make sure Ollama is running: ollama serve"
echo "Press Ctrl+C to stop"

trap "kill $BACKEND_PID $FRONTEND_PID" INT
wait
