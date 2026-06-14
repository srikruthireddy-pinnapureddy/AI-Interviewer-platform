'use client';
// hooks/useSpeechRecognition.ts

import { useEffect, useRef, useState, useCallback } from 'react';
import type { SpeechRecognitionHookReturn } from '@/lib/types';

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: { transcript: string; confidence: number };
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResult[][];
  resultIndex: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart:  ((event: Event) => void) | null;
  onend:    ((event: Event) => void) | null;
  onerror:  ((event: Event & { error: string }) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

export function useSpeechRecognition(): SpeechRecognitionHookReturn {
  const [isListening, setIsListening]           = useState(false);
  const [transcript, setTranscript]             = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError]                       = useState<string | null>(null);
  const [isSupported, setIsSupported]           = useState(false);

  const recognitionRef      = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef  = useRef('');

  useEffect(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) return;

    setIsSupported(true);
    const recognition = new SR();
    recognitionRef.current = recognition;

    recognition.continuous      = true;
    recognition.interimResults  = true;
    recognition.lang            = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => { setIsListening(true); setError(null); };
    recognition.onend   = () => setIsListening(false);
    recognition.onerror = (e) => { setError(e.error); setIsListening(false); };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let finalVal = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        // const part   = result[0].transcript;
        const part = (result[0] as any).transcript as string;
        if ((result as unknown as { isFinal: boolean }).isFinal) {
          finalVal += part + ' ';
        } else {
          interim += part;
        }
      }

      finalTranscriptRef.current = finalVal;
      setTranscript(finalVal);
      setInterimTranscript(interim);
    };

    return () => { recognition.stop(); };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    setTranscript('');
    setInterimTranscript('');
    finalTranscriptRef.current = '';
    setError(null);
    try { recognitionRef.current.start(); } catch {}
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;
    try { recognitionRef.current.stop(); } catch {}
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    finalTranscriptRef.current = '';
  }, []);

  return { transcript, interimTranscript, isListening, error, isSupported, startListening, stopListening, resetTranscript };
}
