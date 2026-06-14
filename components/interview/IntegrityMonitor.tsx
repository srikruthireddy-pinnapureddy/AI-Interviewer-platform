'use client';
import { RefObject } from 'react';
import type { IntegritySettings, IntegrityViolation } from '@/lib/types';
interface Props {
  videoRef: RefObject<HTMLVideoElement>;
  token: string;
  enabled: boolean;
  settings: IntegritySettings;
  onViolation: (violations: IntegrityViolation[]) => void;
  onTerminate: (reason: string) => void;
}
// Placeholder — replace with your actual integrity monitor (e.g., TensorFlow.js COCO-SSD)
export default function IntegrityMonitor({ enabled }: Props) {
  if (!enabled) return null;
  return null;
}
