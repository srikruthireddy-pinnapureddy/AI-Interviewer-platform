from __future__ import annotations

import os
import re
import shutil
from dataclasses import dataclass, field
from pathlib import Path
from turtle import position
from typing import Literal
from uuid import uuid4

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from flask import session
from requests import session
from pydantic import BaseModel

from backend.gemini.gemini_engine import ask_gemini
from backend.xtts.xtts_engine import text_to_speech
from backend.whisper.stt import transcribe_audio


app = FastAPI(title="AI Interview Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
UPLOADS_DIR = BASE_DIR / "uploads"
OUTPUTS_DIR = BASE_DIR / "outputs"
TEMP_DIR = BASE_DIR / "temp"
OUTPUT_AUDIO_PATH = OUTPUTS_DIR / "output.wav"

UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)
TEMP_DIR.mkdir(parents=True, exist_ok=True)


class StartInterviewRequest(BaseModel):
    candidateName: str
    position: str
    company: str
    jobDescription: str
    resumeText: str

    model_config = {
        "json_schema_extra": {
            "example": {
                "candidateName": "John Doe",
                "position": "SOC Analyst",
                "company": "ABC Security",
                "jobDescription": "Monitor SIEM alerts, investigate incidents, and document response actions.",
                "resumeText": "Worked with SIEM, incident triage, and threat hunting for 2 years.",
            }
        }
    }


class StartInterviewResponse(BaseModel):
    session_id: str
    question: str
    audio_url: str
    stage: str

    model_config = {
        "json_schema_extra": {
            "example": {
                "session_id": "session_1234567890abcdef",
                "question": "Tell me about yourself and your SOC experience.",
                "audio_url": "/audio/output.wav",
                "stage": "introduction",
            }
        }
    }


class AnswerResponse(BaseModel):
    session_id: str
    candidate_text: str
    next_question: str
    audio_url: str
    stage: str

    model_config = {
        "json_schema_extra": {
            "example": {
                "session_id": "session_1234567890abcdef",
                "candidate_text": "I investigated high-severity phishing and malware alerts.",
                "next_question": "How would you triage a high-priority SIEM alert?",
                "audio_url": "/audio/output.wav",
                "stage": "technical",
            }
        }
    }


def detect_candidate_level(resume_text: str) -> Literal["fresher", "experienced"]:
    text = (resume_text or "").lower()
    fresher_keywords = [
        'fresher', 'fresh graduate', 'recently graduated', 'no experience',
        'entry level', 'looking for first job', 'internship only',
        '0 years', '0-1 years', 'final year', 'final semester',
        'pursuing', 'currently studying', 'student', 'b.tech', 'b.e.',
        'bsc', 'bachelor', 'college project', 'academic project',
        'mini project', 'major project', 'semester project',
    ]
    experience_keywords = [
        'years of experience', 'yrs of experience', 'year experience',
        'year of experience', 'worked at', 'employed at', 'previously worked',
        'company', 'employer', 'organization', 'private limited', 'pvt ltd',
        'senior', 'lead', 'manager', 'architect', 'principal',
        'team lead', 'tech lead', 'project lead', 'developer at',
        'engineer at', 'analyst at', 'associate at',
    ]

    year_pattern = re.compile(r"(\d+\.?\d*)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp)", re.I)
    year_match = year_pattern.search(resume_text)
    if year_match:
        years = float(year_match.group(1))
        return 'experienced' if years >= 1 else 'fresher'

    fresher_score = sum(1 for keyword in fresher_keywords if keyword in text)
    experienced_score = sum(1 for keyword in experience_keywords if keyword in text)
    experienced_score += len(re.findall(r"20\d{2}\s*[-–]\s*(?:20\d{2}|present|current|till date)", resume_text, flags=re.I)) * 2
    return 'experienced' if experienced_score > fresher_score else 'fresher'


def build_system_prompt(session: "InterviewSessionState", phase: str, candidate_text: str = "") -> str:
    return f"""
You are Priya, a real human interviewer on a live voice call.

Candidate:
- Name: {session.candidate_name}
- Position: {session.position}
- Company: {session.company}
- Level: {session.level}

Interview priority order:
1. Job Description
2. Technical Skills
3. Resume Projects
4. Behavioral Questions
5. Closing

Mandatory rules:
- Technical round must happen before HR questions.
- Introduction must be short.
- Ask one question at a time.
- Never spend more than 1 minute on introductions.
- Use Job Description as the primary source for questions.
- Use Resume as a secondary source.
- Ask follow-up technical questions when answers are strong.
- Move to another skill if the candidate cannot answer after two attempts.
- Keep responses short and conversational.

Job description:
{session.job_description or f'{session.position} role at {session.company}'}

Resume:
{session.resume_text or 'Not provided.'}

Current phase: {phase}

Instructions for this phase:
- introduction: Ask exactly one short self-introduction prompt.
- technical: Ask a practical, scenario-based technical question directly from the JD.
- resume: Ask about a concrete resume project, internship, technology, or achievement. Always ask "What was your specific contribution?" when relevant.
- hr: Ask about teamwork, conflict resolution, pressure handling, career goals, or motivation.
- complete: End the interview briefly and professionally.

Return one concise interviewer line only.
""".strip()


def generate_phase_question(session: "InterviewSessionState", phase: str, candidate_text: str = "") -> str:
    prompt = build_system_prompt(session, phase, candidate_text)
    if phase == 'introduction':
        user_prompt = (
            "Generate one short introduction question asking the candidate to introduce themselves. "
            "Keep it concise and conversational."
        )
    elif phase == 'technical':
        user_prompt = (
            "Generate the next technical question only. Use the job description first. "
            "Keep it practical and concise. Do not add explanations."
        )
    elif phase == 'resume':
        user_prompt = (
            "Generate the next resume-based question only. Ask about the resume content and "
            "include a follow-up like 'What was your specific contribution?' when appropriate."
        )
    elif phase == 'hr':
        user_prompt = (
            "Generate the next HR/behavioral question only. Keep it short and near the end of the interview."
        )
    elif phase == 'complete':
        user_prompt = (
            "Generate a short closing statement only. Thank the candidate and end the interview."
        )
    else:
        user_prompt = (
            "Generate the next interviewer line only. Keep it short and natural."
        )

    return ask_gemini(candidate_text, system_prompt=prompt, user_prompt=user_prompt)


@dataclass
class InterviewSessionState:
    session_id: str
    candidate_name: str
    position: str
    company: str
    job_description: str
    resume_text: str
    level: Literal["fresher", "experienced"]
    phase: str = "introduction"
    technical_turns: int = 0
    resume_turns: int = 0
    hr_turns: int = 0
    fallback_attempts: int = 0
    history: list[dict[str, str]] = field(default_factory=list)


INTERVIEW_SESSIONS: dict[str, InterviewSessionState] = {}


def _audio_route() -> str:
    return f"/audio/{OUTPUT_AUDIO_PATH.name}"


def _save_uploaded_audio(upload: UploadFile, session_id: str) -> Path:
    suffix = Path(upload.filename or "answer.webm").suffix or ".webm"
    target = TEMP_DIR / f"{session_id}_{uuid4().hex}{suffix}"
    with target.open("wb") as buffer:
      shutil.copyfileobj(upload.file, buffer)
    return target


def _is_vague_answer(text: str) -> bool:
    normalized = (text or "").strip().lower()
    if not normalized:
      return True
    words = normalized.split()
    vague_markers = ["don't know", "dont know", "not sure", "no idea", "maybe", "i guess"]
    return len(words) < 5 or any(marker in normalized for marker in vague_markers)


def _next_stage_after_responses(session: InterviewSessionState) -> str:
    if session.phase == 'introduction':
        session.phase = 'technical'
        session.technical_turns = 0
        return 'technical'

    if session.phase == 'technical':
        if session.technical_turns >= 3:
            session.phase = 'resume'
            session.resume_turns = 0
            session.fallback_attempts = 0
            return 'resume'
        if session.fallback_attempts >= 2:
            session.phase = 'resume'
            session.resume_turns = 0
            session.fallback_attempts = 0
            return 'resume'
        session.technical_turns += 1
        return 'technical'

    if session.phase == 'resume':
        if session.resume_turns >= 1:
            session.phase = 'hr'
            session.hr_turns = 0
            session.fallback_attempts = 0
            return 'hr'
        if session.fallback_attempts >= 2:
            session.phase = 'hr'
            session.hr_turns = 0
            session.fallback_attempts = 0
            return 'hr'
        session.resume_turns += 1
        return 'resume'

    if session.phase == 'hr':
        if session.hr_turns >= 1:
            session.phase = 'complete'
            return 'complete'
        session.hr_turns += 1
        return 'hr'

    return session.phase


@app.get("/")
def home():
    return {"message": "AI Interview Backend Running"}


@app.post("/start-interview", response_model=StartInterviewResponse)
async def start_interview(payload: StartInterviewRequest):
    try:
        candidate_name = payload.candidateName.strip() or "Candidate"
        position = payload.position.strip() or "the position"
        company = payload.company.strip() or "our company"
        job_description = payload.jobDescription
        resume_text = payload.resumeText
        print("\n===== START INTERVIEW =====")
        print("Candidate:", candidate_name)
        print("Position:", position)
        print("Company:", company)
        print("JD Length:", len(job_description) if job_description else 0)
        print("Resume Length:", len(resume_text) if resume_text else 0)
        print("JD Preview:", job_description[:300] if job_description else "EMPTY")
        print("===========================\n")

        session_id = f"session_{uuid4().hex}"
        level = detect_candidate_level(resume_text)
        session = InterviewSessionState(
            session_id=session_id,
            candidate_name=candidate_name,
            position=position,
            company=company,
            job_description=job_description,
            resume_text=resume_text,
            level=level,
        )
        INTERVIEW_SESSIONS[session_id] = session
        print("\n===== GENERATING FIRST QUESTION =====")
        print("Using Position:", session.position)
        print("Using JD Length:", len(session.job_description))
        print("Current Phase: introduction")
        print("=====================================\n")

        question = generate_phase_question(session, phase="introduction")
        session.history.append({"role": "assistant", "text": question})
        # text_to_speech(question)
        print("XTTS temporarily disabled")
        print("RETURNING RESPONSE TO FRONTEND")
        return {
            "session_id": session_id,
            "question": question,
            "audio_url": _audio_route(),
            "stage": "introduction",
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

@app.post("/answer-text")
async def answer_text(
    session_id: str,
    answer: str,
):
    session = INTERVIEW_SESSIONS[session_id]

    session.history.append({
        "role": "candidate",
        "text": answer
    })

    next_question = ask_gemini(
        answer,
        user_prompt="Ask the next interview question based on the candidate's previous response."
)

    session.history.append({
        "role": "assistant",
        "text": next_question
    })

    return {
        "session_id": session_id,
        "question": next_question
    }

@app.post("/answer", response_model=AnswerResponse)
async def answer(
    audio_file: UploadFile = File(...),
    session_id: str | None = Form(None),
):
    try:
        session = INTERVIEW_SESSIONS.get(session_id or "") if session_id else None
        if session is None:
            if len(INTERVIEW_SESSIONS) == 1:
                session = next(iter(INTERVIEW_SESSIONS.values()))
            else:
                raise HTTPException(status_code=404, detail="Interview session not found")

        uploaded_path = _save_uploaded_audio(audio_file, session.session_id)
        try:
            candidate_text = transcribe_audio(str(uploaded_path))
        finally:
            uploaded_path.unlink(missing_ok=True)

        session.history.append({"role": "user", "text": candidate_text})

        if _is_vague_answer(candidate_text):
            session.fallback_attempts += 1
        else:
            session.fallback_attempts = 0

        next_phase = _next_stage_after_responses(session)
        next_question = generate_phase_question(session, next_phase, candidate_text)
        completed = next_phase == 'complete'

        session.history.append({"role": "assistant", "text": next_question})
        # text_to_speech(next_question)

        response = {
            "candidate_text": candidate_text,
            "next_question": next_question,
            "audio_url": _audio_route(),
            "stage": "interview_complete" if completed else next_phase,
        }

        if completed:
            INTERVIEW_SESSIONS.pop(session.session_id, None)

        return response
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/audio/{filename}")
async def get_audio_file(filename: str):
    try:
        requested = (OUTPUTS_DIR / filename).resolve()
        outputs_root = OUTPUTS_DIR.resolve()

        if requested.parent != outputs_root:
            raise HTTPException(status_code=400, detail="Invalid filename")
        if not requested.exists() or not requested.is_file():
            raise HTTPException(status_code=404, detail="Audio file not found")

        return FileResponse(path=requested)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/test-interview")
def test_interview():
    try:
        audio_path = UPLOADS_DIR / "recording.wav"
        if not audio_path.exists():
            raise HTTPException(status_code=404, detail=f"Audio file not found: {audio_path}")

        candidate_text = transcribe_audio(str(audio_path))
        print(f"Candidate transcript: {candidate_text}")

        ai_response = ask_gemini(candidate_text)
        print(f"Recruiter response: {ai_response}")

        # text_to_speech(ai_response)

        return {
            "candidate_text": candidate_text,
            "ai_response": ai_response,
            "audio_file": _audio_route(),
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc