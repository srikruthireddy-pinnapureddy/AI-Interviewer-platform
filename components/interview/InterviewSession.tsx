'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, Loader2, Mic, MicOff, RefreshCcw, Volume2 } from 'lucide-react';
import { useUnmount } from 'ahooks';

import { Transcript } from './Transcript';
import { LoadingIcon } from './Icons';
import { Button } from '@/components/ui/Button';
import { formatDuration, loadInterviewData } from '@/lib/utils';
import { downloadAudio, startInterview, submitAnswer } from '@/lib/interviewApi';
import type { InterviewData, Message } from '@/lib/types';

type SessionPhase = 'idle' | 'starting' | 'playing' | 'recording' | 'submitting' | 'complete' | 'error';

interface Props {
  onInterviewComplete?: (elapsed: number, transcriptCount: number) => void;
}

function friendlyError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('fetch') || lower.includes('network') || lower.includes('failed to fetch')) {
    return 'The interview service is unavailable right now. Please check that the FastAPI backend is running on localhost:8000.';
  }
  if (lower.includes('whisper') || lower.includes('transcrib')) {
    return 'We could not transcribe your response. Please try speaking again or check the backend Whisper service.';
  }
  if (lower.includes('gemini') || lower.includes('generate')) {
    return 'The interviewer could not generate the next question. Please retry the answer.';
  }
  if (lower.includes('xtts') || lower.includes('audio') || lower.includes('playback')) {
    return 'We could not generate or play the interviewer audio. Please try again.';
  }
  return message;
}

export default function InterviewSession({ onInterviewComplete }: Props) {
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [phase, setPhase] = useState<SessionPhase>('idle');
  const [statusText, setStatusText] = useState('Preparing interview...');
  const [errorMessage, setErrorMessage] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isMicActive, setIsMicActive] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const interviewDataRef = useRef<InterviewData | null>(null);
  const completingRef = useRef(false);

  const addMessage = useCallback((text: string, isUser: boolean, type: Message['type'] = 'chat', level?: Message['level']) => {
    setMessages(prev => [...prev, {
      id: Date.now() + Math.floor(Math.random() * 1000),
      text,
      isUser,
      timestamp: new Date(),
      type,
      level,
    }]);
  }, []);

  const addSystemMessage = useCallback((text: string, level: Message['level'] = 'info') => {
    addMessage(text, false, 'system', level);
  }, [addMessage]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopMedia = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      try {
        recorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    recorderRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setIsMicActive(false);
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const cleanupRecording = useCallback(() => {
    clearTimer();
    stopAudio();
    stopMedia();
  }, [clearTimer, stopAudio, stopMedia]);

  const completeInterview = useCallback(() => {
    if (completingRef.current) return;
    completingRef.current = true;
    cleanupRecording();
    setPhase('complete');
    addSystemMessage('Interview complete.', 'success');
    const transcriptCount = messages.filter(message => message.type !== 'system').length;
    onInterviewComplete?.(elapsedTime, transcriptCount);
  }, [cleanupRecording, addSystemMessage, elapsedTime, messages, onInterviewComplete]);

  const startRecording = useCallback(async () => {
    try {
      setPhase('recording');
      setStatusText('Recording answer...');
      setCurrentTranscript('');

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      setIsMicActive(true);

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;

      recorder.start();
    } catch (err) {
      setPhase('error');
      setErrorMessage(friendlyError(err instanceof Error ? err.message : 'Microphone access failed'));
    }
  }, []);

  const playInterviewAudio = useCallback(async (audioFile: string, completed = false) => {
    try {
      setPhase('playing');
      setStatusText('Generating recruiter voice...');

      const objectUrl = await downloadAudio(audioFile);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      objectUrlRef.current = objectUrl;

      const audio = new Audio(objectUrl);
      audioRef.current = audio;
      audio.muted = isMuted;

      audio.onended = () => {
        if (completed) {
          completeInterview();
          return;
        }
        void startRecording();
      };

      audio.onerror = () => {
        setPhase('error');
        setErrorMessage('We could not play the interviewer audio. Please check your browser audio settings and retry.');
      };

      await audio.play();
    } catch (err) {
      setPhase('error');
      setErrorMessage(friendlyError(err instanceof Error ? err.message : 'Audio playback failed'));
    }
  }, [completeInterview, isMuted, startRecording]);

  const submitRecordedAnswer = useCallback(async () => {
    if (!recorderRef.current || phase !== 'recording') return;

    const recorder = recorderRef.current;
    setPhase('submitting');
    setStatusText('Transcribing response...');

    const audioBlob = await new Promise<Blob | null>((resolve) => {
      const localChunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          localChunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = localChunks.length > 0 ? new Blob(localChunks, { type: recorder.mimeType || 'audio/webm' }) : null;
        resolve(blob);
      };

      try {
        recorder.stop();
      } catch {
        resolve(null);
      }
    });

    recorderRef.current = null;
    stopMedia();

    if (!audioBlob || audioBlob.size < 1000) {
      setPhase('recording');
      setStatusText('Recording answer...');
      addSystemMessage('We did not capture enough audio. Please try answering again.', 'warning');
      void startRecording();
      return;
    }

    try {
      setStatusText('Evaluating answer...');
      const response = await submitAnswer(sessionId, audioBlob);

      if (response.session_id) {
        setSessionId(response.session_id);
      }

      if (response.candidate_text) {
        setCurrentTranscript(response.candidate_text);
        addMessage(response.candidate_text, true, 'voice_transcript');
      }

      if (response.next_question) {
        setCurrentQuestion(response.next_question);
        addMessage(response.next_question, false, 'voice_response');
      }

      await playInterviewAudio(response.audio_file, Boolean(response.completed));
    } catch (err) {
      setPhase('error');
      setErrorMessage(friendlyError(err instanceof Error ? err.message : 'Failed to submit answer'));
    }
  }, [addMessage, addSystemMessage, phase, playInterviewAudio, sessionId, startRecording, stopMedia]);

  const startInterviewFlow = useCallback(async () => {
    if (!interviewDataRef.current) return;

    try {
      setPhase('starting');
      setStatusText('Generating question...');
      addSystemMessage('Generating question...', 'info');

      const response = await startInterview({
        position: interviewDataRef.current.position,
        company: interviewDataRef.current.company,
        jobDescription: interviewDataRef.current.jobDescription,
        resumeText: interviewDataRef.current.resumeText,
        candidateName: interviewDataRef.current.candidateName,
      });

      if (response.session_id) {
        setSessionId(response.session_id);
      }

      setCurrentQuestion(response.question);
      addMessage(response.question, false, 'voice_response');
      await playInterviewAudio(response.audio_file, false);
    } catch (err) {
      setPhase('error');
      setErrorMessage(friendlyError(err instanceof Error ? err.message : 'Failed to start interview'));
    }
  }, [addMessage, addSystemMessage, playInterviewAudio]);

  const handleRetry = useCallback(() => {
    setErrorMessage('');
    setMessages([]);
    setPhase('idle');
    setCurrentQuestion('');
    setCurrentTranscript('');
    setSessionId(null);
    completingRef.current = false;
    cleanupRecording();
    void startInterviewFlow();
  }, [cleanupRecording, startInterviewFlow]);

  useEffect(() => {
    const data = loadInterviewData();
    if (data) {
      interviewDataRef.current = data;
      setInterviewData(data);
      void startInterviewFlow();
    } else {
      setPhase('error');
      setErrorMessage('Interview details are missing. Please return to the setup screen and start again.');
    }
  }, [startInterviewFlow]);

  useEffect(() => {
    const timer = setInterval(() => setElapsedTime(seconds => seconds + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useUnmount(() => {
    cleanupRecording();
  });

  const transcriptCount = messages.filter(message => message.type !== 'system').length;

  if (phase === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-center shadow-2xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-300">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Interview unavailable</h2>
          <p className="text-slate-300 leading-relaxed">{errorMessage}</p>
          <div className="mt-8 flex justify-center gap-3">
            <Button onClick={handleRetry} className="bg-blue-600 hover:bg-blue-700">
              <RefreshCcw className="mr-2 h-4 w-4" /> Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-center shadow-2xl">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300">
            <Volume2 className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold text-white">Interview complete</h1>
          <p className="mt-2 text-blue-200">Thanks, {interviewData?.candidateName || 'Candidate'}.</p>
          <div className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-black/20 p-5 text-left">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Position</p>
              <p className="mt-1 text-white">{interviewData?.position || '-'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Company</p>
              <p className="mt-1 text-white">{interviewData?.company || '-'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Duration</p>
              <p className="mt-1 text-white">{formatDuration(elapsedTime)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Messages</p>
              <p className="mt-1 text-white">{transcriptCount}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col p-4 md:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-blue-300/80">AI Interview Session</p>
            <h1 className="text-lg font-semibold">{interviewData?.candidateName || 'Candidate'} · {interviewData?.position || 'Interview'}</h1>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-200">
            {phase === 'starting' || phase === 'submitting' ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-300" />
            ) : (
              <span className={`h-2.5 w-2.5 rounded-full ${phase === 'recording' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
            )}
            <span>{statusText}</span>
          </div>
        </div>

        <div className="grid flex-1 gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
            <div className="border-b border-white/10 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Interviewer</p>
              <h2 className="mt-1 text-2xl font-semibold">Priya</h2>
              <p className="mt-1 text-sm text-slate-300">{currentQuestion || 'Preparing the next question...'}</p>
            </div>

            <div className="flex-1 overflow-hidden">
              <Transcript messages={messages} />
            </div>

            <div className="border-t border-white/10 px-5 py-4">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => void submitRecordedAnswer()}
                  disabled={phase !== 'recording'}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {phase === 'submitting' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mic className="mr-2 h-4 w-4" />}
                  {phase === 'recording' ? 'Submit Answer' : 'Waiting for question'}
                </Button>
                <button
                  type="button"
                  onClick={() => setIsMuted(prev => !prev)}
                  className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  {isMuted ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
                  {isMuted ? 'Mic muted' : 'Mic live'}
                </button>
                <div className="text-sm text-slate-300">
                  {phase === 'recording' ? 'Record your answer, then submit it.' : 'The next interviewer question will play automatically.'}
                </div>
              </div>
              {currentTranscript ? (
                <p className="mt-3 text-sm text-emerald-200">
                  Current transcript: {currentTranscript}
                </p>
              ) : null}
            </div>
          </section>

          <aside className="flex flex-col gap-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Session</p>
                  <p className="mt-1 text-lg font-semibold">{sessionId || 'Starting...'}</p>
                </div>
                <div className={`rounded-full px-3 py-1 text-xs font-medium ${isMicActive ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/10 text-slate-300'}`}>
                  {isMicActive ? 'Recording' : 'Idle'}
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Progress</p>
                <p className="mt-2 text-3xl font-bold text-white">{formatDuration(elapsedTime)}</p>
                <p className="mt-1 text-sm text-slate-300">{transcriptCount} interview messages</p>
              </div>

              {phase === 'submitting' ? (
                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-200">
                  <LoadingIcon />
                  <span>{statusText}</span>
                </div>
              ) : null}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Live state</p>
              <div className="mt-3 space-y-2 text-sm text-slate-300">
                <p>Introduction, then technical questions.</p>
                <p>Resume questions only after technical evaluation.</p>
                <p>HR and behavioral questions come near the end.</p>
              </div>
            </div>
          </aside>
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMessage}
          </div>
        ) : null}
      </div>
    </div>
  );
}