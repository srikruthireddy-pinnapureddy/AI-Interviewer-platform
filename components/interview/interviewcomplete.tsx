// 'use client';
// import { useEffect, useState } from 'react';
// import { CheckCircle, Clock, MessageSquare, RotateCcw } from 'lucide-react';
// import type { InterviewData } from '@/lib/types';
// import { formatDuration } from '@/lib/utils';

// interface Props {
//   interviewData:   InterviewData | null;
//   elapsedTime:     number;
//   transcriptCount: number;
//   onStartNew:      () => void;
// }

// export function InterviewComplete({ interviewData, elapsedTime, transcriptCount, onStartNew }: Props) {
//   return (
//     <div className="h-screen w-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
//       <div className="w-full max-w-lg text-center">
//         <div className="w-24 h-24 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
//           <CheckCircle className="w-12 h-12 text-green-400" />
//         </div>
//         <h1 className="text-3xl font-bold text-white mb-2">Interview Complete!</h1>
//         <p className="text-blue-300 text-lg mb-8">Thank you, {interviewData?.candidateName || 'Candidate'}!</p>
//         <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 grid grid-cols-2 gap-4 text-left">
//           {[
//             { icon: '💼', label: 'POSITION', value: interviewData?.position || '-' },
//             { icon: '🏢', label: 'COMPANY',  value: interviewData?.company  || 'the company' },
//             { icon: '⏱️', label: 'DURATION', value: formatDuration(elapsedTime) },
//             { icon: '💬', label: 'EXCHANGES', value: `${transcriptCount} messages` },
//           ].map((s, i) => (
//             <div key={i} className="flex items-center gap-3">
//               <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center text-sm">{s.icon}</div>
//               <div>
//                 <p className="text-gray-400 text-xs font-medium">{s.label}</p>
//                 <p className="text-white text-sm font-medium truncate max-w-32">{s.value}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//         <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-5 py-4 mb-8">
//           <p className="text-blue-200 text-sm leading-relaxed">
//             Your interview responses have been recorded and saved. The hiring team will review your performance and reach out with next steps.
//           </p>
//         </div>
//         <div className="flex items-center justify-center gap-3">
//           <button onClick={onStartNew} className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium border border-white/20 transition-all">
//             <RotateCcw className="w-4 h-4" /> Start New Interview
//           </button>
//           <button onClick={() => { sessionStorage.clear(); window.location.href = '/'; }} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all">
//             Go Home
//           </button>
//         </div>
//         <p className="text-gray-600 text-xs mt-6">Session: {typeof window !== 'undefined' ? sessionStorage.getItem('interview_session_id') || 'N/A' : 'N/A'}</p>
//       </div>
//     </div>
//   );
// }
'use client';
import { CheckCircle, RotateCcw } from 'lucide-react';
import type { InterviewData } from '@/lib/types';
import { formatDuration } from '@/lib/utils';

interface Props {
  interviewData:   InterviewData | null;
  elapsedTime:     number;
  transcriptCount: number;
  onStartNew:      () => void;
}

export function InterviewComplete({ interviewData, elapsedTime, transcriptCount, onStartNew }: Props) {
  return (
    <div className="h-screen w-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg text-center">
        <div className="w-24 h-24 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Interview Complete!</h1>
        <p className="text-blue-300 text-lg mb-8">Thank you, {interviewData?.candidateName || 'Candidate'}!</p>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 grid grid-cols-2 gap-4 text-left">
          {[
            { icon: '💼', label: 'POSITION', value: interviewData?.position || '-' },
            { icon: '🏢', label: 'COMPANY',  value: interviewData?.company  || 'the company' },
            { icon: '⏱️', label: 'DURATION', value: formatDuration(elapsedTime) },
            { icon: '💬', label: 'EXCHANGES', value: `${transcriptCount} messages` },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center text-sm">{s.icon}</div>
              <div>
                <p className="text-gray-400 text-xs font-medium">{s.label}</p>
                <p className="text-white text-sm font-medium truncate max-w-32">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-5 py-4 mb-8">
          <p className="text-blue-200 text-sm leading-relaxed">
            Your interview responses have been recorded and saved. The hiring team will review your performance and reach out with next steps.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onStartNew}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium border border-white/20 transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Start New Interview
          </button>
          <button
            onClick={() => { sessionStorage.clear(); window.location.href = '/'; }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all"
          >
            Go Home
          </button>
        </div>
        <p className="text-gray-600 text-xs mt-6">
          Session:{' '}
          {typeof window !== 'undefined'
            ? sessionStorage.getItem('interview_session_id') || 'N/A'
            : 'N/A'}
        </p>
      </div>
    </div>
  );
}