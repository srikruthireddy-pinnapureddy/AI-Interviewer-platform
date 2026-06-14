'use client';
// components/interview/LaunchScreen.tsx

import { Database, FileText, Sparkles, Check, Loader2 } from 'lucide-react';
import type { LaunchStage } from '@/lib/types';

interface Stage {
  key: LaunchStage;
  icon: React.ReactNode;
  label: string;
  color: string;
}

const STAGES: Stage[] = [
  {
    key: 'kb',
    icon: <Database className="w-5 h-5" />,
    label: 'Creating knowledge base...',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    key: 'upload',
    icon: <FileText className="w-5 h-5" />,
    label: 'Uploading resume & JD content...',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    key: 'avatar',
    icon: <Sparkles className="w-5 h-5" />,
    label: 'Launching interview engine...',
    color: 'bg-green-100 text-green-600',
  },
];

interface Props {
  stage: LaunchStage;
}

export function LaunchScreen({ stage }: Props) {
  const activeIndex = STAGES.findIndex((s) => s.key === stage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-white animate-pulse" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Setting Up Your Interview</h2>
        <p className="text-blue-300 text-sm mb-10">
          Please wait while we configure everything for you
        </p>

        {/* Stage progress */}
        <div className="space-y-3 mb-8">
          {STAGES.map((s, i) => {
            const isDone   = i < activeIndex;
            const isActive = s.key === stage;

            return (
              <div
                key={s.key}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                  isActive
                    ? 'bg-white/15 border border-white/20'
                    : isDone
                    ? 'bg-white/8'
                    : 'bg-white/5 opacity-40'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isDone
                    ? 'bg-green-100 text-green-600'
                    : isActive
                    ? s.color
                    : 'bg-white/10 text-white/40'
                }`}>
                  {isDone ? (
                    <Check className="w-5 h-5" />
                  ) : isActive ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    s.icon
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  isActive ? 'text-white' : isDone ? 'text-green-300' : 'text-white/40'
                }`}>
                  {isDone ? s.label.replace('...', ' ✓') : s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Dots */}
        <div className="flex gap-1.5 justify-center">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
