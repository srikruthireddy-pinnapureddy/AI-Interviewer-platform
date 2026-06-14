'use client';
// components/interview/setup/Step0BasicInfo.tsx

import { Briefcase, Building2, User, AlertCircle, ChevronRight } from 'lucide-react';
import type { SetupForm } from '@/lib/types';

interface Props {
  form: SetupForm;
  onChange: (field: keyof SetupForm, value: string) => void;
  onNext: () => void;
  error: string;
}

export default function Step0BasicInfo({ form, onChange, onNext, error }: Props) {
  const canProceed = form.position.trim().length > 0;

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-1">Basic Information</h2>
      <p className="text-gray-500 text-sm mb-6">Tell us about the role and the candidate</p>

      <div className="space-y-4">
        {/* Job Position */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <Briefcase className="w-4 h-4 inline mr-1.5 text-blue-500" />
            Job Position / Role <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.position}
            onChange={(e) => onChange('position', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && canProceed && onNext()}
            placeholder="e.g. Senior React Developer, AI/ML Engineer, Product Manager"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-400 text-sm transition-shadow"
          />
        </div>

        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <Building2 className="w-4 h-4 inline mr-1.5 text-blue-500" />
            Company Name{' '}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={form.company}
            onChange={(e) => onChange('company', e.target.value)}
            placeholder="e.g. Acme Corp, TechStartup Inc"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-400 text-sm transition-shadow"
          />
        </div>

        {/* Candidate Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <User className="w-4 h-4 inline mr-1.5 text-blue-500" />
            Candidate Name{' '}
            <span className="text-gray-400 font-normal">(auto-detected from resume)</span>
          </label>
          <input
            type="text"
            value={form.candidateName}
            onChange={(e) => onChange('candidateName', e.target.value)}
            placeholder="e.g. Sairam Ankani"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-400 text-sm transition-shadow"
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Continue <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
