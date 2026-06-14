// lib/constants.ts
import type { } from './types';

export const INTERVIEW_TIMING = {
  MAX_DURATION_MS:         45 * 60 * 1000,
  INACTIVITY_TIMEOUT_MS:   10 * 60 * 1000,
  MIN_RESPONSE_TIME_MS:    2_000,
  SPEECH_TIMEOUT_MS:       5_000,
  SILENCE_THRESHOLD_MS:    2_000,
  AUDIO_ENABLE_DELAY_MS:   1_500,
  SPEECH_RESTART_DELAY_MS: 1_000,
} as const;

export const DEFAULT_INTEGRITY_SETTINGS = {
  enabled:           true,
  checkInterval:     1000,
  minConfidence:     0.5,
  maxPeopleAllowed:  1,
  prohibitedObjects: ['cell phone', 'book', 'laptop'],
  warningThreshold:  3,
  debugMode:         process.env.NODE_ENV === 'development',
  skipFrames:        3,
  detectionTimeout:  800,
  maxRetries:        1,
  autoTerminate:     true,
  warningCount:      2,
  retryDelay:        1000,
} as const;

export const API_ROUTES = {
  SESSION_START:    '/api/interview/session/start',
  SESSION_PROGRESS: '/api/interview/session/progress',
  QA_TRACK:         '/api/interview/qa/track',
  COMPLETE:         (token: string) => `/api/interview/complete/${token}`,
  RECORDING_UPLOAD: '/api/interview/recording/upload',
} as const;
