// lib/utils.ts — Shared utility functions

import type { InterviewData } from './types';

// ─── Time formatting ──────────────────────────────────────────────────────────
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ─── Token generation ─────────────────────────────────────────────────────────
export function generateToken(): string {
  return `interview_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function generateCandidateId(): string {
  return `candidate_${Date.now()}`;
}

export function generateSessionId(candidateId?: string): string {
  return `session_${candidateId || Date.now()}_${Date.now()}`;
}

// ─── SessionStorage helpers ───────────────────────────────────────────────────
export function saveInterviewData(data: InterviewData): void {
  sessionStorage.setItem('interviewData', JSON.stringify(data));
}

export function loadInterviewData(): InterviewData | null {
  try {
    const raw = sessionStorage.getItem('interviewData');
    if (!raw) return null;
    return JSON.parse(raw) as InterviewData;
  } catch {
    return null;
  }
}

export function clearInterviewData(): void {
  sessionStorage.removeItem('interviewData');
}

// ─── File reading ─────────────────────────────────────────────────────────────
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = (e) => resolve((e.target?.result as string) || '');
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

// ─── File validation ──────────────────────────────────────────────────────────
export function isValidResumeFile(file: File): boolean {
  const ALLOWED_TYPES = [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  const ALLOWED_EXT = /\.(pdf|doc|docx|txt)$/i;
  return ALLOWED_TYPES.includes(file.type) || ALLOWED_EXT.test(file.name);
}

// ─── Debug logger ─────────────────────────────────────────────────────────────
export function createLogger(prefix: string) {
  return {
    log:   (...args: unknown[]) => console.log(`[${prefix}]`, ...args),
    warn:  (...args: unknown[]) => console.warn(`[${prefix}]`, ...args),
    error: (...args: unknown[]) => console.error(`[${prefix}]`, ...args),
  };
}

// ─── Interview progress ────────────────────────────────────────────────────────
export function calcProgress(answered: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(Math.round((answered / total) * 100), 100);
}

// ─── Beacon (send on page unload) ─────────────────────────────────────────────
export function sendBeaconCompletion(token: string, payload: Record<string, unknown>): void {
  const formData = new FormData();
  Object.entries(payload).forEach(([k, v]) => formData.append(k, String(v)));
  navigator.sendBeacon(`/api/interview/complete/${token}`, formData);
}

// ─── LocalStorage helpers ─────────────────────────────────────────────────────
export function markInterviewCompleted(token: string, sessionId: string): void {
  localStorage.setItem(
    `interview_completed_${token}`,
    JSON.stringify({ completed_at: new Date().toISOString(), session_id: sessionId, success: true })
  );
}

export function isInterviewCompleted(token: string): boolean {
  return !!localStorage.getItem(`interview_completed_${token}`);
}

