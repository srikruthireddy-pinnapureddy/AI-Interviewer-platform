// 'use client';
// // components/interview/setup/Step1ResumeUpload.tsx

// import { useRef, useCallback } from 'react';
// import { Upload, FileText, X, Check, AlertCircle, ChevronRight, ChevronLeft, Database, Loader2 } from 'lucide-react';

// interface Props {
//   resumeFile: File | null;
//   candidateName: string;
//   isExtractingName: boolean;
//   error: string;
//   onFile: (file: File) => Promise<void>;
//   onRemove: () => void;
//   onNext: () => void;
//   onSkip: () => void;
//   onBack: () => void;
// }

// export default function Step1ResumeUpload({
//   resumeFile, candidateName, isExtractingName, error,
//   onFile, onRemove, onNext, onSkip, onBack,
// }: Props) {
//   const fileInputRef  = useRef<HTMLInputElement>(null);
//   const isDraggingRef = useRef(false);

//   const handleDrop = useCallback(async (e: React.DragEvent) => {
//     e.preventDefault();
//     const file = e.dataTransfer.files[0];
//     if (file) await onFile(file);
//   }, [onFile]);

//   const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) await onFile(file);
//     // Reset so same file can be re-selected
//     e.target.value = '';
//   }, [onFile]);

//   return (
//     <div>
//       <h2 className="text-xl font-semibold text-gray-800 mb-1">Upload Resume</h2>
//       <p className="text-gray-500 text-sm mb-6">
//         The AI interviewer uses this to ask personalized, resume-specific questions
//       </p>

//       {/* Drop Zone */}
//       <div
//         className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
//           resumeFile
//             ? 'border-green-400 bg-green-50'
//             : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
//         }`}
//         onDrop={handleDrop}
//         onDragOver={(e) => { e.preventDefault(); }}
//         onClick={() => !resumeFile && fileInputRef.current?.click()}
//       >
//         <input
//           ref={fileInputRef}
//           type="file"
//           className="hidden"
//           accept=".pdf,.doc,.docx,.txt"
//           onChange={handleFileChange}
//         />

//         {resumeFile ? (
//           <div>
//             <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
//               <FileText className="w-6 h-6 text-green-600" />
//             </div>
//             <p className="text-green-700 font-medium text-sm">{resumeFile.name}</p>
//             <p className="text-green-500 text-xs mt-1">
//               {(resumeFile.size / 1024).toFixed(0)} KB · Ready for knowledge base
//             </p>
//             {isExtractingName && (
//               <div className="flex items-center justify-center gap-2 mt-2 text-blue-600 text-xs">
//                 <Loader2 className="w-3 h-3 animate-spin" />
//                 Extracting candidate name...
//               </div>
//             )}
//             <button
//               onClick={(e) => { e.stopPropagation(); onRemove(); }}
//               className="mt-3 text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 mx-auto transition-colors"
//             >
//               <X className="w-3 h-3" /> Remove file
//             </button>
//           </div>
//         ) : (
//           <div>
//             <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
//               <Upload className="w-6 h-6 text-gray-400" />
//             </div>
//             <p className="text-gray-600 font-medium text-sm">Drop resume here or click to browse</p>
//             <p className="text-gray-400 text-xs mt-1">PDF, DOC, DOCX, TXT supported</p>
//           </div>
//         )}
//       </div>

//       {/* Candidate name detection badge */}
//       {candidateName && resumeFile && !isExtractingName && (
//         <div className="mt-3 flex items-center gap-2 bg-blue-50 rounded-lg px-4 py-2.5 text-sm">
//           <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
//           <span className="text-blue-700">
//             Candidate detected: <strong>{candidateName}</strong>
//           </span>
//         </div>
//       )}

//       {/* KB info banner */}
//       <div className="mt-3 flex items-start gap-2 bg-purple-50 rounded-lg px-4 py-3 text-xs text-purple-700">
//         <Database className="w-4 h-4 flex-shrink-0 mt-0.5" />
//         <span>
//           Resume content will be uploaded to the HeyGen knowledge base so the AI can
//           reference your experience during the interview.
//         </span>
//       </div>

//       {error && (
//         <div className="mt-3 flex items-center gap-2 text-red-600 bg-red-50 rounded-lg px-4 py-3 text-sm">
//           <AlertCircle className="w-4 h-4 flex-shrink-0" />
//           {error}
//         </div>
//       )}

//       <div className="mt-6 flex items-center justify-between">
//         <button
//           onClick={onBack}
//           className="flex items-center gap-1.5 px-4 py-2.5 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
//         >
//           <ChevronLeft className="w-4 h-4" /> Back
//         </button>
//         <div className="flex items-center gap-3">
//           <button
//             onClick={onSkip}
//             className="px-4 py-2.5 text-gray-500 hover:text-gray-700 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
//           >
//             Skip for now
//           </button>
//           <button
//             onClick={onNext}
//             disabled={!resumeFile}
//             className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
//           >
//             Continue <ChevronRight className="w-4 h-4" />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
'use client';
// components/interview/setup/Step1ResumeUpload.tsx

import { useRef } from 'react';
import { Upload, FileText, X, User, CheckCircle, Loader } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  resumeFile:      File | null;
  candidateName:   string;
  isParsingResume: boolean;   // renamed from isExtractingName
  error:           string;
  onFile:          (f: File) => void;
  onRemove:        () => void;
  onNext:          () => void;
  onSkip:          () => void;
  onBack:          () => void;
}

export default function Step1ResumeUpload({
  resumeFile, candidateName, isParsingResume, error,
  onFile, onRemove, onNext, onSkip, onBack,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Upload Resume</h2>
        <p className="text-gray-500 text-sm mt-1">
          Upload your resume so the AI can ask tailored questions
        </p>
      </div>

      {/* Supported formats */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span className="font-medium">Supported:</span>
        {['PDF', 'DOCX', 'DOC', 'TXT'].map(fmt => (
          <span key={fmt} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded font-mono">{fmt}</span>
        ))}
      </div>

      {/* Upload area */}
      {!resumeFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
        >
          <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-600 font-medium">Drop your resume here</p>
          <p className="text-gray-400 text-sm mt-1">or click to browse</p>
          <p className="text-gray-400 text-xs mt-2">PDF, DOCX, DOC, TXT · Max 10MB</p>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
          />
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-900 text-sm font-medium truncate max-w-56">{resumeFile.name}</p>
                <p className="text-gray-400 text-xs">{(resumeFile.size / 1024).toFixed(0)} KB</p>
              </div>
            </div>
            {!isParsingResume && (
              <button onClick={onRemove} className="text-gray-400 hover:text-red-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Parsing status */}
          {isParsingResume ? (
            <div className="mt-3 flex items-center gap-2 text-blue-600 text-sm">
              <Loader className="w-4 h-4 animate-spin" />
              <span>Reading resume text...</span>
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Resume parsed successfully</span>
            </div>
          )}
        </div>
      )}

      {/* Auto-extracted name */}
      {candidateName && !isParsingResume && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <User className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span className="text-green-800 text-sm">
            Name detected: <strong>{candidateName}</strong>
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <Button onClick={onBack} className="text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-2">
          ← Back
        </Button>
        <div className="flex gap-2">
          <Button onClick={onSkip} className="text-gray-500 bg-transparent hover:bg-gray-100 px-4 py-2 text-sm">
            Skip
          </Button>
          <Button
            onClick={onNext}
            disabled={isParsingResume}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isParsingResume ? 'Reading...' : resumeFile ? 'Continue →' : 'Skip →'}
          </Button>
        </div>
      </div>
    </div>
  );
}