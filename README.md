# AI Interview Platform v1.0

A production-ready, AI-powered interview platform with voice conversations,
resume analysis, automatic job description generation, and candidate integrity monitoring.

## Features
- 🎙️ **Voice AI Interviews** — Local pipeline (Whisper → Gemini → XTTS) conducts the interview
- 📄 **Resume Upload** — Candidate uploads resume; AI extracts name and tailors questions
- ✨ **Auto JD Generation** — Groq AI generates job descriptions from role + resume
- 📝 **Live Transcription** — Real-time transcript of the full conversation
- 🛡️ **Integrity Monitoring** — Webcam-based proctoring (pluggable)
- 📊 **Q&A Tracking** — Every question and answer saved for review
- ⏱️ **Auto-completion** — Sessions auto-complete after inactivity or max duration

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env.local
```
Fill in `.env.local` with your API keys (see below).

### 3. Configure local AI pipeline
This project uses a local AI stack for interviews:

- Speech-to-text: `faster-whisper` (Whisper model)
- Interview engine: `Gemini` (or fallback heuristic when no key is configured)
- Text-to-speech: `XTTS` (Coqui TTS where available, otherwise Windows SAPI fallback)

No external ElevenLabs services are required.

### 4. Run
```bash
npm run dev
# Open http://localhost:3000
```

## Required API Keys

| Service | Where to Get | Variable |
|---|---|---|
| Gemini / Google | Set `GOOGLE_API_KEY` if you want to use Gemini; otherwise the local fallback responder is used | `GOOGLE_API_KEY` (optional) |

## Interview Flow
```
/interview
  ↓
Setup Wizard (4 steps)
  Step 1: Enter position, company, candidate name
  Step 2: Upload resume (PDF/DOC/TXT)
  Step 3: AI generates job description (editable)
  Step 4: Review & start
  ↓
Voice Interview
  - Recruiter audio is synthesized locally (XTTS) and served from `/audio/output.wav`
  - Conducts structured interview based on JD + resume (Gemini manages stages)
  - Real-time transcript shown
  - Q&A tracked to your database
  ↓
Completion
  - Auto-completes or candidate clicks "End Interview"
  - Session saved with full transcript
```

## Project Structure
```
├── app/                 Next.js pages and API routes
├── components/          React components
│   ├── interview/       Interview-specific components
│   └── ui/              Shared UI (Button, Input)
├── hooks/               Custom React hooks
├── lib/                 Types, constants, utilities
├── docs/                Architecture, API, deployment docs
└── public/              Static assets
```

## Customization

### Add your database
The API routes in `app/api/interview/` have `// TODO:` comments
showing exactly where to add Prisma, Supabase, or any ORM calls.

### Custom interview prompts
Edit `backend/gemini/gemini_engine.py` (the `SYSTEM_PROMPT` constant or the `ask_gemini()` wrapper) to change how the AI conducts interviews.

### Integrity monitoring
Replace the placeholder in `components/interview/IntegrityMonitor.tsx`
with a real implementation (TensorFlow.js COCO-SSD, Azure Vision, etc.)

## Scripts
```bash
npm run dev        # Development server
npm run build      # Production build
npm run start      # Start production server
npm run lint       # ESLint
npm run type-check # TypeScript check
```

## License
MIT — see LICENSE file.
