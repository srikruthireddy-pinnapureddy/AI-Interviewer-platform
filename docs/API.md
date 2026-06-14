# API Reference

## FastAPI Interview Endpoints

### POST /start-interview
Starts a new interview session and returns the first question plus generated audio.

Request body:
```json
{
  "position": "Senior Engineer",
  "company": "Acme Corp",
  "jobDescription": "...",
  "resumeText": "...",
  "candidateName": "Jane Smith"
}
```

### POST /answer
Accepts a multipart audio upload, transcribes the answer with Whisper, generates the next interviewer response with Gemini, and synthesizes recruiter audio with XTTS.

Form fields:
```text
audio_file: recorded browser audio
session_id: optional session identifier
```

### GET /audio/{filename}
Serves generated WAV files from the backend output directory.

## Supporting App Routes

### POST /api/generate-jd
Generates a job description from the setup form data.

### POST /api/extract-name
Extracts the candidate name from a resume text payload.

### POST /api/parse-resume
Parses uploaded resume files into plain text.
