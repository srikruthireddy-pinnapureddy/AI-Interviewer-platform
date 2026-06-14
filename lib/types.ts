// lib/types.ts — Shared TypeScript interfaces for the AI Interview system

// import type { StartAvatarRequest } from '@heygen/streaming-avatar';

// ─── Interview Data ────────────────────────────────────────────────────────────
export interface InterviewData {
  token: string;
  candidateId: string;
  candidateName: string;
  position: string;
  company: string;
  jobDescription: string;
  resumeText: string;
  resumeFileName: string;
  knowledgeBaseId: string | null;
  createdAt: string;
  integritySettings?: IntegritySettings;
}

// ADD this instead:
// export type AvatarSessionConfig = Record<string, unknown>;

export interface AvatarSessionConfig {
  avatarName?:   string;
  knowledgeId?:  string;
  language?:     string;
  quality?:      string;
  voice?: {
    rate?:    number;
    emotion?: string;
    model?:   string;
  };
}

// ─── Setup Form ────────────────────────────────────────────────────────────────
export interface SetupForm {
  candidateName: string;
  position: string;
  company: string;
}

// ─── Chat Message ──────────────────────────────────────────────────────────────
export interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'chat' | 'system' | 'voice_transcript' | 'voice_response';
  level?: 'info' | 'success' | 'warning' | 'error';
}

// ─── Voice Transcript Entry ────────────────────────────────────────────────────
export interface VoiceTranscriptEntry {
  timestamp: Date;
  text: string;
  speaker: 'user' | 'avatar';
}

// ─── Integrity Monitoring ──────────────────────────────────────────────────────
export interface IntegritySettings {
  enabled: boolean;
  checkInterval?: number;
  minConfidence?: number;
  maxPeopleAllowed?: number;
  prohibitedObjects?: string[];
  warningThreshold?: number;
  debugMode?: boolean;
  skipFrames?: number;
  detectionTimeout?: number;
  maxRetries?: number;
  autoTerminate?: boolean;
  warningCount?: number;
  retryDelay?: number;
}

export interface IntegrityViolation {
  type: string;
  details: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  timestamp: Date;
}

// ─── Session ───────────────────────────────────────────────────────────────────
export interface InterviewSession {
  sessionId: string;
  interviewToken: string;
  candidateId: string;
  candidateName: string;
  position: string;
  company: string;
  startedAt: string;
}

// ─── Q&A Tracking ─────────────────────────────────────────────────────────────
export interface QATrackPayload {
  session_id: string;
  interview_token?: string;
  type: 'question' | 'answer' | 'system';
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface QATrackResponse {
  success: boolean;
  answered_questions: number;
  total_questions: number;
  stats?: {
    total_questions: number;
    answered_questions: number;
    progress_percentage: number;
  };
}

// ─── Knowledge Base ────────────────────────────────────────────────────────────
export interface KBCreateRequest {
  candidateName: string;
  position: string;
  company: string;
  token: string;
  resumeText: string;
  jobDescription: string;
}

export interface KBCreateResponse {
  success: boolean;
  knowledgeBaseId: string | null;
  uploadSuccess: boolean;
  message: string;
  error?: string;
}

// ─── Launch Stage ──────────────────────────────────────────────────────────────
export type LaunchStage = 'kb' | 'upload' | 'avatar';

// ─── Connection Quality ────────────────────────────────────────────────────────
export type ConnectionQuality = 'good' | 'fair' | 'poor';

// ─── Avatar Config Extended ────────────────────────────────────────────────────
// export interface AvatarSessionConfig extends StartAvatarRequest {
//   knowledgeId?: string;
//   prompt?: string;
// }

// ─── Speech Recognition ────────────────────────────────────────────────────────
export interface SpeechRecognitionHookReturn {
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
  error: string | null;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

// ─── Recording ────────────────────────────────────────────────────────────────
export interface RecordingConfig {
  video_codec: string;
  audio_codec: string;
  video_bitrate: string;
  audio_bitrate: string;
  resolution: string;
}
