'use client';
// components/interview/setup/Step2JobDescription.tsx

import { useState } from 'react';
import { Sparkles, Eye, Edit3, RefreshCw, Briefcase, AlertCircle, Check, ChevronRight, ChevronLeft } from 'lucide-react';

interface Props {
  position: string;
  company: string;
  hasResume: boolean;
  generatedJD: string;
  editedJD: string;
  setEditedJD: (v: string) => void;
  isGenerating: boolean;
  error: string;
  onGenerate: () => Promise<void>;
  onNext: () => void;
  onBack: () => void;
  finalJD: string;
}

export default function Step2JobDescription({
  position, company, hasResume,
  generatedJD, editedJD, setEditedJD,
  isGenerating, error, onGenerate,
  onNext, onBack, finalJD,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);

  const handleRegenerate = async () => {
    setIsEditing(false);
    await onGenerate();
  };

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl font-semibold text-gray-800">Job Description</h2>
        {generatedJD && !isGenerating && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
            >
              {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
              {isEditing ? 'Preview' : 'Edit'}
            </button>
            <button
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 disabled:opacity-50 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              Regenerate
            </button>
          </div>
        )}
      </div>

      <p className="text-gray-500 text-sm mb-5">
        AI-generated JD for <strong>{position}</strong>
        {company ? ` at ${company}` : ''}
        {hasResume ? ' (tailored to candidate resume)' : ''}
      </p>

      {/* Generating state */}
      {isGenerating && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
            <Sparkles className="w-7 h-7 text-blue-500 animate-pulse" />
          </div>
          <p className="text-gray-600 font-medium">Generating Job Description...</p>
          <p className="text-gray-400 text-sm mt-1">
            Tailoring for {position}{hasResume ? ' based on candidate resume' : ''}
          </p>
          <div className="flex gap-1.5 mt-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* JD content */}
      {!isGenerating && generatedJD && (
        <div>
          {isEditing ? (
            <textarea
              value={editedJD}
              onChange={(e) => setEditedJD(e.target.value)}
              className="w-full h-72 px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 text-sm font-mono leading-relaxed resize-none"
            />
          ) : (
            <div className="bg-gray-50 rounded-xl p-5 h-72 overflow-y-auto border border-gray-100">
              <pre className="text-gray-700 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                {finalJD}
              </pre>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <Check className="w-3 h-3 text-green-500" />
            This JD will be uploaded to the HeyGen knowledge base for the AI interviewer
          </p>
        </div>
      )}

      {/* Empty state */}
      {!isGenerating && !generatedJD && (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
          <Briefcase className="w-10 h-10 text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm mb-4">No JD generated yet</p>
          <button
            onClick={onGenerate}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all"
          >
            <Sparkles className="w-4 h-4" /> Generate JD with AI
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={onGenerate} className="ml-auto text-blue-600 hover:underline font-medium">
            Retry
          </button>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2.5 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={onNext}
          disabled={isGenerating || !finalJD.trim()}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Continue <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
