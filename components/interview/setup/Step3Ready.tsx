'use client';
// components/interview/setup/Step3Ready.tsx

import { Check, User, Briefcase, Building2, FileText, Sparkles, Database, AlertCircle, ChevronLeft } from 'lucide-react';
import type { InterviewData, SetupForm } from '@/lib/types';

interface SummaryItem {
  icon: React.ReactNode;
  bgColor: string;
  label: string;
  value: string;
}

interface Props {
  form: SetupForm;
  resumeFileName: string;
  hasJD: boolean;
  launchError: string;
  onStart: () => Promise<InterviewData | null> | Promise<void>;
  onBack: () => void;
}

export default function Step3Ready({ form, resumeFileName, hasJD, launchError, onStart, onBack }: Props) {
  const summaryItems: SummaryItem[] = [
    {
      icon: <User className="w-4 h-4 text-blue-600" />,
      bgColor: 'bg-blue-100',
      label: 'CANDIDATE',
      value: form.candidateName || 'Not specified',
    },
    {
      icon: <Briefcase className="w-4 h-4 text-purple-600" />,
      bgColor: 'bg-purple-100',
      label: 'POSITION',
      value: form.position,
    },
    ...(form.company ? [{
      icon: <Building2 className="w-4 h-4 text-amber-600" />,
      bgColor: 'bg-amber-100',
      label: 'COMPANY',
      value: form.company,
    }] : []),
    ...(resumeFileName ? [{
      icon: <FileText className="w-4 h-4 text-green-600" />,
      bgColor: 'bg-green-100',
      label: 'RESUME',
      value: resumeFileName,
    }] : []),
    {
      icon: <Sparkles className="w-4 h-4 text-teal-600" />,
      bgColor: 'bg-teal-100',
      label: 'JOB DESCRIPTION',
      value: hasJD ? 'AI-generated ✓' : 'Not provided',
    },
  ];

  return (
    <div className="text-center">
      {/* Success icon */}
      <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
        <Check className="w-8 h-8 text-green-600" />
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-2">Everything is Ready!</h2>
      <p className="text-gray-500 text-sm mb-8">
        Click Start to create the knowledge base and launch your AI interview
      </p>

      {/* Summary card */}
      <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3 mb-6 border border-gray-100">
        {summaryItems.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-8 h-8 ${item.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
              {item.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 font-medium">{item.label}</p>
              <p className="text-sm text-gray-700 font-medium truncate">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* KB info banner */}
      <div className="flex items-start gap-2 bg-blue-50 rounded-xl px-4 py-3 text-xs text-blue-700 mb-6 text-left">
        <Database className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>
          Clicking <strong>Start AI Interview</strong> will automatically create a HeyGen
          knowledge base with your JD and resume, then connect the AI interviewer.
        </span>
      </div>

      {/* Launch error */}
      {launchError && (
        <div className="flex items-center gap-2 bg-red-50 rounded-xl px-4 py-3 text-sm text-red-600 mb-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {launchError}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2.5 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={onStart}
          className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold text-sm hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200 transition-all"
        >
          <Sparkles className="w-4 h-4" /> Start AI Interview
        </button>
      </div>
    </div>
  );
}
