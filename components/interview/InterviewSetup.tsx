// 'use client';
// // components/interview/InterviewSetup.tsx — Main setup orchestrator

// import { useState } from 'react';
// import { Sparkles } from 'lucide-react';

// import { StepIndicator }     from './StepIndicator';
// import { LaunchScreen }      from './LaunchScreen';
// import Step0BasicInfo        from './setup/Step0BasicInfo';
// import Step1ResumeUpload     from './setup/Step1ResumeUpload';
// import Step2JobDescription   from './setup/Step2JobDescription';
// import Step3Ready            from './setup/Step3Ready';
// import { useInterviewSetup } from '@/hooks/useInterviewSetup';
// import type { InterviewData } from '@/lib/types';

// const STEPS = ['Basic Info', 'Resume Upload', 'Job Description', 'Ready'] as const;

// interface Props {
//   onSetupComplete: (data: InterviewData) => void;
// }

// export default function InterviewSetup({ onSetupComplete }: Props) {
//   const [step, setStep]       = useState(0);
//   const [step0Error, setStep0Error] = useState('');

//   const {
//     form, updateForm,
//     resumeFile, isExtractingName, handleResumeFile, removeResume, resumeError,
//     generatedJD, editedJD, setEditedJD, isGeneratingJD, jdError, generateJD, finalJD,
//     isLaunching, launchStage, launchError, handleStartInterview,
//   } = useInterviewSetup(onSetupComplete);

//   // ── Step navigation helpers ─────────────────────────────────────────────────
//   const goNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
//   const goBack = () => setStep((s) => Math.max(s - 1, 0));

//   const handleStep0Next = () => {
//     if (!form.position.trim()) { setStep0Error('Please enter the job position/role.'); return; }
//     setStep0Error('');
//     goNext();
//   };

//   const handleStep1Next = () => {
//     if (!resumeFile) return; // button is disabled
//     goNext();
//     if (!generatedJD) generateJD();
//   };

//   const handleSkipResume = () => {
//     goNext();
//     if (!generatedJD) generateJD();
//   };

//   const handleStep2Next = () => {
//     if (!finalJD.trim()) return; // button disabled
//     goNext();
//   };

//   // ── Show launch screen while creating KB ────────────────────────────────────
//   if (isLaunching) {
//     return <LaunchScreen stage={launchStage} />;
//   }

//   // ─── Render ─────────────────────────────────────────────────────────────────
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
//       <div className="w-full max-w-2xl">

//         {/* Header */}
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4">
//             <Sparkles className="w-7 h-7 text-white" />
//           </div>
//           <h1 className="text-2xl font-bold text-white">AI Interview Setup</h1>
//           <p className="text-blue-300 mt-1 text-sm">Configure your session in minutes</p>
//         </div>

//         {/* Step indicator */}
//         <StepIndicator steps={[...STEPS]} currentStep={step} />

//         {/* Card */}
//         <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
//           <div className="p-8">
//             {step === 0 && (
//               <Step0BasicInfo
//                 form={form}
//                 onChange={updateForm}
//                 onNext={handleStep0Next}
//                 error={step0Error}
//               />
//             )}
//             {step === 1 && (
//               <Step1ResumeUpload
//                 resumeFile={resumeFile}
//                 candidateName={form.candidateName}
//                 isExtractingName={isExtractingName}
//                 error={resumeError}
//                 onFile={handleResumeFile}
//                 onRemove={removeResume}
//                 onNext={handleStep1Next}
//                 onSkip={handleSkipResume}
//                 onBack={goBack}
//               />
//             )}
//             {step === 2 && (
//               <Step2JobDescription
//                 position={form.position}
//                 company={form.company}
//                 hasResume={!!resumeFile}
//                 generatedJD={generatedJD}
//                 editedJD={editedJD}
//                 setEditedJD={setEditedJD}
//                 isGenerating={isGeneratingJD}
//                 error={jdError}
//                 onGenerate={generateJD}
//                 onNext={handleStep2Next}
//                 onBack={goBack}
//                 finalJD={finalJD}
//               />
//             )}
//             {step === 3 && (
//               <Step3Ready
//                 form={form}
//                 resumeFileName={resumeFile?.name ?? ''}
//                 hasJD={!!finalJD.trim()}
//                 launchError={launchError}
//                 onStart={handleStartInterview}
//                 onBack={goBack}
//               />
//             )}
//           </div>

//           {/* Progress bar */}
//           <div className="h-1 bg-gray-100">
//             <div
//               className="h-full bg-blue-600 transition-all duration-500"
//               style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
//             />
//           </div>
//         </div>

//         <p className="text-center text-blue-400/60 text-xs mt-4">
//           Powered by HeyGen AI Avatar + Claude AI
//         </p>
//       </div>
//     </div>
//   );
// }
'use client';
// components/interview/InterviewSetup.tsx
// Auto-generates JD immediately when Step 3 (Job Description) is entered

import { useState, useEffect, useRef } from 'react';
import { Sparkles, ChevronDown } from 'lucide-react';

import { StepIndicator }    from './StepIndicator';
import { LaunchScreen }     from './LaunchScreen';
import Step0BasicInfo       from './setup/Step0BasicInfo';
import Step1ResumeUpload    from './setup/Step1ResumeUpload';
import Step2JobDescription  from './setup/Step2JobDescription';
import Step3Ready           from './setup/Step3Ready';
import { useInterviewSetup } from '@/hooks/useInterviewSetup';
import type { InterviewData } from '@/lib/types';

const STEPS = ['Basic Info', 'Resume Upload', 'Job Description', 'Ready'] as const;

interface Props {
  onSetupComplete: (data: InterviewData) => void;
}

export default function InterviewSetup({ onSetupComplete }: Props) {
  const [step, setStep]           = useState(0);
  const [step0Error, setStep0Error] = useState('');

  const {
    form, updateForm,
    resumeFile, isParsingResume, handleResumeFile, removeResume, resumeError,
    generatedJD, editedJD, setEditedJD, isGeneratingJD, jdError, generateJD, finalJD,
    isLaunching, launchStage, launchError, handleStartInterview,
  } = useInterviewSetup(onSetupComplete);

  // ── AUTO-GENERATE JD when step 2 is entered ─────────────────────────────
  useEffect(() => {
    if (step === 2 && !generatedJD && !isGeneratingJD && form.position.trim()) {
      console.log('[Setup] Auto-generating JD for:', form.position);
      generateJD();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // ── Step navigation ───────────────────────────────────────────────────────
  const goBack = () => setStep(s => Math.max(s - 1, 0));

  const handleStep0Next = () => {
    if (!form.position.trim()) { setStep0Error('Please enter the job position.'); return; }
    setStep0Error('');
    setStep(1);
  };

  const handleStep1Next = () => { setStep(2); };   // auto-generates via useEffect
  const handleSkipResume = () => { setStep(2); };   // auto-generates via useEffect

  const handleStep2Next = () => {
    // If still generating, wait; if no JD yet, trigger it
    if (isGeneratingJD) return;
    if (!finalJD.trim()) { generateJD(); return; }
    setStep(3);
  };

  const cardRef = useRef<HTMLDivElement | null>(null);

  if (isLaunching) return <LaunchScreen stage={launchStage} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">AI Interview Setup</h1>
          <p className="text-blue-300 mt-1 text-sm">Configure your session in minutes</p>
        </div>

        <StepIndicator steps={[...STEPS]} currentStep={step} />

        <div ref={cardRef} className="bg-white rounded-2xl shadow-2xl overflow-hidden" id="setup-card">
          <div className="p-8">

            {step === 0 && (
              <Step0BasicInfo
                form={form}
                onChange={updateForm}
                onNext={handleStep0Next}
                error={step0Error}
              />
            )}
            {step === 1 && (
              <Step1ResumeUpload
                resumeFile={resumeFile}
                candidateName={form.candidateName}
                isParsingResume={isParsingResume}
                error={resumeError}
                onFile={handleResumeFile}
                onRemove={removeResume}
                onNext={handleStep1Next}
                onSkip={handleSkipResume}
                onBack={goBack}
              />
            )}
            {step === 2 && (
              <Step2JobDescription
                position={form.position}
                company={form.company}
                hasResume={!!resumeFile}
                generatedJD={generatedJD}
                editedJD={editedJD}
                setEditedJD={setEditedJD}
                isGenerating={isGeneratingJD}
                error={jdError}
                onGenerate={generateJD}
                onNext={handleStep2Next}
                onBack={goBack}
                finalJD={finalJD}
              />
            )}
            {step === 3 && (
              <Step3Ready
                form={form}
                resumeFileName={resumeFile?.name ?? ''}
                hasJD={!!finalJD.trim()}
                launchError={launchError}
                onStart={async () => { await handleStartInterview(); }}
                onBack={goBack}
              />
            )}

          </div>

          {/* Progress bar */}
          <div className="h-1 bg-gray-100">
            <div
              className="h-full bg-blue-600 transition-all duration-500"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        <p className="text-center text-blue-400/60 text-xs mt-4">
          Powered by FastAPI + Whisper + Gemini + XTTS
        </p>
      </div>
      {/* Floating scroll button */}
      <button
        aria-label="Scroll to setup"
        onClick={() => cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
        className="fixed right-6 bottom-6 z-50 bg-blue-600 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700"
      >
        <ChevronDown className="w-5 h-5" />
      </button>
    </div>
  );
}