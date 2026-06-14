// 'use client';
// // components/interview/InteractiveAvatarWrapper.tsx
// // Shows: Setup → Interview → Completion screen

// import { useState, useEffect } from 'react';
// import InterviewSession   from './InterviewSession';
// import InterviewSetup     from './InterviewSetup';
// import { loadInterviewData } from '@/lib/utils';
// import type { InterviewData } from '@/lib/types';

// export default function InteractiveAvatarWrapper() {
//   const [setupComplete, setSetupComplete] = useState(false);
//   const [isChecking, setIsChecking]       = useState(true);

//   useEffect(() => {
//     const existing = loadInterviewData();
//     if (existing?.token) setSetupComplete(true);
//     setIsChecking(false);
//   }, []);

//   if (isChecking) {
//     return (
//       <div className="h-screen flex items-center justify-center bg-gray-900">
//         <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
//       </div>
//     );
//   }

//   if (!setupComplete) {
//     return <InterviewSetup onSetupComplete={(_data: InterviewData) => setSetupComplete(true)} />;
//   }

//   // Interview session handles backend audio playback
//   return <InterviewSession />;
// }
'use client';
// components/interview/InteractiveAvatarWrapper.tsx
// Shows: Setup → Interview → Completion screen

import { useState, useEffect } from 'react';
import InterviewSession       from './InterviewSession';
import InterviewSetup         from './InterviewSetup';
import { InterviewComplete }  from './interviewcomplete';
import { loadInterviewData, clearInterviewData } from '@/lib/utils';
import type { InterviewData } from '@/lib/types';

type AppState = 'checking' | 'setup' | 'interview' | 'complete';

export default function InteractiveAvatarWrapper() {
  const [appState, setAppState]           = useState<AppState>('checking');
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [elapsedTime, setElapsedTime]     = useState(0);
  const [transcriptCount, setTranscriptCount] = useState(0);

  useEffect(() => {
    const existing = loadInterviewData();
    if (existing?.token) {
      setInterviewData(existing);
      setAppState('interview');
    } else {
      setAppState('setup');
    }
  }, []);

  const handleSetupComplete = (data: InterviewData) => {
    setInterviewData(data);
    setAppState('interview');
  };

  const handleInterviewComplete = (elapsed: number, txCount: number) => {
    setElapsedTime(elapsed);
    setTranscriptCount(txCount);
    setAppState('complete');
  };

  const handleStartNew = () => {
    clearInterviewData();
    sessionStorage.removeItem('interview_session_id');
    setInterviewData(null);
    setElapsedTime(0);
    setTranscriptCount(0);
    setAppState('setup');
  };

  if (appState === 'checking') {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (appState === 'setup') {
    return <InterviewSetup onSetupComplete={handleSetupComplete} />;
  }

  if (appState === 'complete') {
    return (
      <InterviewComplete
        interviewData={interviewData}
        elapsedTime={elapsedTime}
        transcriptCount={transcriptCount}
        onStartNew={handleStartNew}
      />
    );
  }

  // interview state
  return (
    <InterviewSession
      onInterviewComplete={handleInterviewComplete}
    />
  );
}