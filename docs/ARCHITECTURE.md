# Architecture Overview

## Tech Stack
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: FastAPI
- **Speech to Text**: Whisper
- **Interview Engine**: Gemini
- **Text to Speech**: XTTS

## Directory Structure
```
ai-interview-platform/
├── app/                         Next.js App Router
│   ├── page.tsx                 Home redirect
│   ├── interview/page.tsx       Interview route
│   └── api/
│       ├── generate-jd/         JD generation
│       ├── extract-name/        Resume name extraction
│       └── parse-resume/        Resume text parsing
├── backend/
│   ├── app.py                   FastAPI interview endpoints
│   ├── gemini/                  Interview question generation
│   ├── whisper/                 Audio transcription
│   └── xtts/                   Recruiter voice synthesis
├── components/
│   └── interview/               Setup, session, and completion UI
├── hooks/
│   ├── useInterviewSetup.ts     Setup wizard logic
│   └── useSpeechRecognition.ts  Browser speech API
└── lib/
    ├── interviewApi.ts         FastAPI client layer
    ├── types.ts                Shared TypeScript interfaces
    └── utils.ts                Shared utilities
```

## Data Flow
```
User → /interview
  → InteractiveAvatarWrapper
  → InterviewSetup collects resume + role data
  → POST /start-interview
      → Gemini generates the first question
      → XTTS synthesizes interviewer audio
      → Frontend plays returned WAV
  → Browser records mic input
  → POST /answer with multipart audio
      → Whisper transcribes the response
      → Gemini generates the next question
      → XTTS synthesizes the next recruiter reply
      → Frontend plays returned WAV
  → Repeat until completion
```
