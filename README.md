# AI Interviewer Platform

AI Interviewer Platform is an AI-powered mock interview system that conducts dynamic interviews based on the candidate's profile, job description, and responses. The platform uses Google Gemini for intelligent question generation, Whisper for speech-to-text conversion, and XTTS for text-to-speech synthesis.

The interview progresses through Introduction, Technical, Resume-Based, and HR rounds while maintaining conversational context using session management.

---

# Features

* Dynamic AI-generated interview questions
* Session-based interview management
* Job Description driven technical interviews
* Resume-aware questioning
* Voice-to-text conversion using Whisper
* Text-to-speech generation using XTTS
* Multi-stage interview workflow
* Swagger UI for API testing
* Text-based interview testing endpoint
* FastAPI backend architecture

---

# Tech Stack

### Backend

* Python
* FastAPI
* Pydantic
* Uvicorn

### AI Components

* Google Gemini 2.5 Flash
* OpenAI Whisper
* Coqui XTTS v2

### Tools

* Swagger UI
* Git
* GitHub

---

# Project Architecture

```text
Candidate Details
        ↓
FastAPI Backend
        ↓
Interview Session Creation
        ↓
Prompt Builder
        ↓
Google Gemini
        ↓
Question Generation
        ↓
Whisper (Speech → Text)
        ↓
Session State Manager
        ↓
Next Question Generation
        ↓
XTTS (Text → Speech)
```

---

# Interview Flow

```text
Start Interview
       ↓
Introduction Round
       ↓
Technical Round
       ↓
Resume-Based Round
       ↓
HR Round
       ↓
Interview Completion
```

---

# Project Structure

```text
AI-Interviewer-platform
│
├── backend
│   ├── app.py
│   │
│   ├── gemini
│   │   └── gemini_engine.py
│   │
│   ├── whisper
│   │   └── stt.py
│   │
│   ├── xtts
│   │   └── xtts_engine.py
│   │
│   ├── uploads
│   ├── outputs
│   └── temp
│
├── requirements.txt
├── README.md
└── .env
```

---

# Prerequisites

Install the following:

### Python

Recommended:

```text
Python 3.10 or Python 3.11
```

Verify:

```bash
python --version
```

---

### Git

Verify:

```bash
git --version
```

---

### FFmpeg

Required for Whisper and XTTS.

Verify:

```bash
ffmpeg -version
```

If FFmpeg is not installed:

Windows:

1. Download FFmpeg
2. Add FFmpeg to PATH
3. Restart terminal

---

# Clone Repository

```bash
git clone https://github.com/srikruthireddy-pinnapureddy/AI-Interviewer-platform.git

cd AI-Interviewer-platform
```

---

# Create Virtual Environment

Windows:

```bash
python -m venv venv

venv\Scripts\activate
```

Linux/Mac:

```bash
python -m venv venv

source venv/bin/activate
```

---

# Install Dependencies

```bash
pip install -r requirements.txt
```

If requirements.txt is unavailable:

```bash
pip install fastapi
pip install uvicorn
pip install python-multipart
pip install google-generativeai
pip install openai-whisper
pip install TTS
pip install pydantic
```

---

# Environment Variables

Create a file named:

```text
.env
```

Add:

```env
GOOGLE_API_KEY=YOUR_GEMINI_API_KEY
```

---

# Running the Backend

From the project root:

```bash
python -m uvicorn backend.app:app --reload --port 8000
```

Expected output:

```text
INFO: Uvicorn running on http://127.0.0.1:8000
Application startup complete.
```

---

# Open Swagger UI

Open:

```text
http://127.0.0.1:8000/docs
```

Swagger will display all available endpoints.

---

# Starting an Interview

Use:

```http
POST /start-interview
```

Sample Request:

```json
{
  "candidateName": "Srikruthi",
  "position": "SOC Analyst",
  "company": "ABC Security",
  "jobDescription": "SOC monitoring, incident response and SIEM analysis.",
  "resumeText": "Python, SQL, SIEM, Threat Detection, Incident Response."
}
```

Sample Response:

```json
{
  "session_id": "session_xxxxx",
  "question": "Tell me about yourself.",
  "audio_url": "/audio/output.wav",
  "stage": "introduction"
}
```

Save the session_id for future requests.

---

# Continuing Interview (Text Mode)

Use:

```http
POST /answer-text
```

Parameters:

```text
session_id
answer
```

Example:

```text
session_id=session_xxxxx

answer=I recently completed my B.Tech in AIML and worked on cybersecurity projects.
```

Response:

```json
{
  "session_id": "session_xxxxx",
  "question": "Can you explain one cybersecurity project you worked on?"
}
```

---

# Continuing Interview (Voice Mode)

Use:

```http
POST /answer
```

Parameters:

```text
audio_file
session_id
```

Flow:

```text
Audio Input
      ↓
Whisper
      ↓
Transcript
      ↓
Gemini
      ↓
Next Question
      ↓
XTTS
      ↓
Audio Response
```

---

# Access Generated Audio

Use:

```http
GET /audio/{filename}
```

Example:

```text
http://127.0.0.1:8000/audio/output.wav
```

---

# Current Interview Stages

The backend automatically manages:

```text
Introduction
↓
Technical
↓
Resume-Based
↓
HR
↓
Complete
```

Interview state is maintained using session management.

---

# XTTS Configuration

To enable voice output, uncomment:

```python
text_to_speech(question)
```

and

```python
text_to_speech(next_question)
```

inside:

```text
backend/app.py
```

Generated audio files are stored in:

```text
backend/outputs/
```

---

# Common Issues

## Gemini API Error

Verify:

```bash
echo %GOOGLE_API_KEY%
```

Windows PowerShell:

```powershell
echo $env:GOOGLE_API_KEY
```

---

## Port Already In Use

```bash
netstat -ano | findstr 8000
```

Kill process if required.

---

## Whisper Issues

Verify:

```bash
ffmpeg -version
```

---

## XTTS Download Issues

Delete cached model:

```text
C:\Users\<username>\AppData\Local\tts
```

Restart backend.

---

# Available Endpoints

| Endpoint          | Method | Description                    |
| ----------------- | ------ | ------------------------------ |
| /                 | GET    | Health Check                   |
| /start-interview  | POST   | Start New Interview            |
| /answer-text      | POST   | Continue Interview Using Text  |
| /answer           | POST   | Continue Interview Using Voice |
| /audio/{filename} | GET    | Get Generated Audio            |
| /test-interview   | GET    | Local Testing                  |

---

# Current Status

### Completed

* FastAPI Backend
* Gemini Integration
* Session Management
* Dynamic Question Generation
* Swagger Testing
* Text-Based Interview Flow

### In Progress

* Whisper Voice Testing
* XTTS Voice Output Testing

### Planned

* Resume PDF Upload
* Resume Parsing
* Candidate Scoring
* Interview Feedback Report
* Frontend Integration
* Database Storage
* Real-Time Voice Streaming

---

# Author

**Srikruthi Reddy Pinnapureddy**

GitHub Repository:

https://github.com/srikruthireddy-pinnapureddy/AI-Interviewer-platform
######################################################################

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
