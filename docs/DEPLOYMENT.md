# Deployment Guide

## Prerequisites
- Node.js 18+
- Python 3.11+
- Whisper model dependencies installed
- Gemini API key
- XTTS runtime dependencies installed

## Local Development
```bash
npm install
cp .env.example .env.local
# Fill in .env.local with your API keys
npm run dev
```

## Production (Vercel)
```bash
npm install -g vercel
vercel
# Add environment variables in Vercel dashboard
```

## Production (Self-hosted)
```bash
npm install
npm run build
npm start
```

## Environment Variables
| Variable | Required | Description |
|---|---|---|
| GEMINI_API_KEY | ✅ | Gemini API key for interview generation |
| BACKEND_URL | ❌ | Optional backend URL override |
| NEXT_PUBLIC_BACKEND_URL | ❌ | Public backend URL for browser requests |

## Backend
Run the FastAPI app on `http://127.0.0.1:8000` so the frontend can call `/start-interview`, `/answer`, and `/audio/*`.
