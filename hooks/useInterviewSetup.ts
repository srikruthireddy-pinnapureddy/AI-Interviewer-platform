// 'use client';
// // hooks/useInterviewSetup.ts — Fixed: client-side template fallback so JD never fails

// import { useState, useCallback } from 'react';
// import type { SetupForm, InterviewData, LaunchStage } from '@/lib/types';
// import {
//   generateToken, generateCandidateId,
//   saveInterviewData, readFileAsText, isValidResumeFile,
// } from '@/lib/utils';
// import { DEFAULT_INTEGRITY_SETTINGS, API_ROUTES } from '@/lib/constants';

// // ─── Client-side template (last resort if server route fails) ────────────────
// function clientTemplateJD(position: string, company: string): string {
//   return `Role Overview
// We are looking for a talented ${position} to join ${company || 'our team'}. The ideal candidate will bring strong expertise and a passion for excellence.

// Key Responsibilities
// • Lead ${position} projects and initiatives end-to-end
// • Collaborate with cross-functional teams on key deliverables
// • Maintain high standards of quality and documentation
// • Mentor team members and contribute to knowledge sharing
// • Stay current with industry trends relevant to ${position}

// Required Qualifications
// • 3+ years of experience as a ${position} or similar role
// • Strong analytical and problem-solving skills
// • Excellent communication and collaboration abilities
// • Proven track record of delivering results

// Preferred Qualifications
// • Experience in a fast-growing environment
// • Familiarity with agile methodologies
// • Strong portfolio of relevant work

// What We Offer
// • Competitive salary and performance bonuses
// • Flexible remote-friendly work environment
// • Learning and development opportunities
// • Comprehensive benefits package`;
// }

// // ─── Call server route for JD generation (Groq + server-side fallback) ───────
// async function fetchGenerateJD(
//   position: string,
//   company: string,
//   resumeText: string
// ): Promise<string> {
//   const res = await fetch('/api/generate-jd', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ position, company, resumeText }),
//   });

//   if (!res.ok) throw new Error(`Generate JD failed: ${res.status}`);

//   const data = await res.json() as { jobDescription?: string; success?: boolean };
//   if (!data.jobDescription) throw new Error('No JD returned');
//   return data.jobDescription;
// }

// // ─── Extract candidate name from resume via server ────────────────────────────
// async function fetchExtractName(resumeText: string): Promise<string> {
//   try {
//     const res = await fetch('/api/extract-name', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ resumeText }),
//     });
//     if (!res.ok) return '';
//     const data = await res.json() as { name?: string };
//     return data.name || '';
//   } catch {
//     return '';
//   }
// }

// // ─── Hook ─────────────────────────────────────────────────────────────────────
// export interface UseInterviewSetupReturn {
//   form: SetupForm;
//   updateForm: (field: keyof SetupForm, value: string) => void;
//   resumeFile: File | null;
//   resumeText: string;
//   isExtractingName: boolean;
//   handleResumeFile: (file: File) => Promise<void>;
//   removeResume: () => void;
//   resumeError: string;
//   generatedJD: string;
//   editedJD: string;
//   setEditedJD: (v: string) => void;
//   isGeneratingJD: boolean;
//   jdError: string;
//   generateJD: () => Promise<void>;
//   finalJD: string;
//   isLaunching: boolean;
//   launchStage: LaunchStage;
//   launchError: string;
//   handleStartInterview: () => Promise<InterviewData | null>;
// }

// export function useInterviewSetup(
//   onComplete?: (data: InterviewData) => void
// ): UseInterviewSetupReturn {
//   const [form, setForm]                     = useState<SetupForm>({ candidateName: '', position: '', company: '' });
//   const [resumeFile, setResumeFile]         = useState<File | null>(null);
//   const [resumeText, setResumeText]         = useState('');
//   const [isExtractingName, setIsExtractingName] = useState(false);
//   const [resumeError, setResumeError]       = useState('');
//   const [generatedJD, setGeneratedJD]       = useState('');
//   const [editedJD, setEditedJD]             = useState('');
//   const [isGeneratingJD, setIsGeneratingJD] = useState(false);
//   const [jdError, setJdError]               = useState('');
//   const [isLaunching, setIsLaunching]       = useState(false);
//   const [launchStage, setLaunchStage]       = useState<LaunchStage>('kb');
//   const [launchError, setLaunchError]       = useState('');

//   const updateForm = useCallback((field: keyof SetupForm, value: string) => {
//     setForm(prev => ({ ...prev, [field]: value }));
//   }, []);

//   // ── Resume upload ───────────────────────────────────────────────────────────
//   const handleResumeFile = useCallback(async (file: File) => {
//     if (!isValidResumeFile(file)) {
//       setResumeError('Please upload PDF, DOC, DOCX, or TXT.');
//       return;
//     }
//     setResumeFile(file);
//     setResumeError('');
//     try {
//       const text = await readFileAsText(file);
//       setResumeText(text);
//       if (text.length > 50) {
//         setIsExtractingName(true);
//         const name = await fetchExtractName(text);
//         if (name) setForm(prev => ({ ...prev, candidateName: name }));
//         setIsExtractingName(false);
//       }
//     } catch {
//       setResumeError('Could not read file. Try another format.');
//       setIsExtractingName(false);
//     }
//   }, []);

//   const removeResume = useCallback(() => {
//     setResumeFile(null); setResumeText(''); setResumeError('');
//   }, []);

//   // ── JD generation ───────────────────────────────────────────────────────────
//   const generateJD = useCallback(async () => {
//     if (!form.position.trim() || isGeneratingJD) return;
//     setIsGeneratingJD(true);
//     setJdError('');

//     try {
//       // Try server route first (Groq + server fallback)
//       const jd = await fetchGenerateJD(form.position, form.company, resumeText);
//       setGeneratedJD(jd);
//       setEditedJD(jd);
//     } catch (err) {
//       console.warn('[Setup] Server JD generation failed, using client template:', err);
//       // Client-side fallback — always succeeds
//       const fallback = clientTemplateJD(form.position, form.company);
//       setGeneratedJD(fallback);
//       setEditedJD(fallback);
//       // Don't set jdError — just silently use template
//     } finally {
//       setIsGeneratingJD(false);
//     }
//   }, [form.position, form.company, resumeText, isGeneratingJD]);

//   const finalJD = editedJD || generatedJD;

//   // ── Launch interview ────────────────────────────────────────────────────────
//   const handleStartInterview = useCallback(async (): Promise<InterviewData | null> => {
//     setIsLaunching(true);
//     setLaunchError('');

//     const token       = generateToken();
//     const candidateId = generateCandidateId();
//     const jdContent   = finalJD.trim() || clientTemplateJD(form.position, form.company);

//     try {
//       setLaunchStage('kb');
//       // Pre-fetch agent config (signed URL) — non-blocking if it fails
//       await fetchAgentConfig({
//         candidateName:  form.candidateName || 'Candidate',
//         position:       form.position,
//         company:        form.company || 'the company',
//         jobDescription: jdContent,
//         resumeText,
//       }).catch(err => console.warn('[Setup] Agent config prefetch failed (non-fatal):', err));

//       setLaunchStage('upload');
//       await new Promise(r => setTimeout(r, 500));

//       setLaunchStage('avatar');
//       await new Promise(r => setTimeout(r, 300));

//       const interviewData: InterviewData = {
//         token,
//         candidateId,
//         candidateName:   form.candidateName || 'Candidate',
//         position:        form.position,
//         company:         form.company || 'the company',
//         jobDescription:  jdContent,
//         resumeText,
//         resumeFileName:  resumeFile?.name || '',
//         knowledgeBaseId: null,
//         createdAt:       new Date().toISOString(),
//         integritySettings: { ...DEFAULT_INTEGRITY_SETTINGS },
//       };

//       saveInterviewData(interviewData);
//       onComplete?.(interviewData);
//       return interviewData;

//     } catch (err) {
//       const msg = err instanceof Error ? err.message : 'Failed to start interview';
//       setLaunchError(msg);
//       setIsLaunching(false);
//       return null;
//     }
//   }, [form, resumeText, resumeFile, finalJD, onComplete]);

//   return {
//     form, updateForm,
//     resumeFile, resumeText, isExtractingName, handleResumeFile, removeResume, resumeError,
//     generatedJD, editedJD, setEditedJD, isGeneratingJD, jdError, generateJD, finalJD,
//     isLaunching, launchStage, launchError, handleStartInterview,
//   };
// }
'use client';
// hooks/useInterviewSetup.ts
// Uses server-side parsing for PDF/DOCX/TXT + Groq JD generation

import { useState, useCallback } from 'react';
import type { SetupForm, InterviewData, LaunchStage } from '@/lib/types';
import { generateToken, generateCandidateId, saveInterviewData } from '@/lib/utils';
import { DEFAULT_INTEGRITY_SETTINGS } from '@/lib/constants';

// ─── Client-side JD template (last resort fallback) ──────────────────────────
function clientTemplateJD(position: string, company: string): string {
  return `Role Overview
We are looking for a talented ${position} to join ${company || 'our team'}.

Key Responsibilities
• Lead ${position} projects end-to-end
• Collaborate with cross-functional teams
• Maintain high standards of quality and documentation
• Stay current with industry trends relevant to ${position}

Required Qualifications
• Relevant experience as a ${position} or similar role
• Strong analytical and problem-solving skills
• Excellent communication abilities
• Proven track record of delivering results

Preferred Qualifications
• Experience in a fast-growing environment
• Familiarity with agile methodologies

What We Offer
• Competitive salary and performance bonuses
• Flexible remote-friendly environment
• Learning and development opportunities`;
}

// ─── Server-side resume parser (PDF / DOCX / TXT) ────────────────────────────
async function parseResumeOnServer(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/parse-resume', {
    method: 'POST',
    body:   formData,
  });

  if (!res.ok) {
    const err = await res.json() as { error?: string };
    throw new Error(err.error || `Resume parse failed: ${res.status}`);
  }

  const data = await res.json() as { text?: string };
  return data.text || '';
}

// ─── Generate JD via Groq (server) ───────────────────────────────────────────
async function fetchGenerateJD(position: string, company: string, resumeText: string): Promise<string> {
  const res = await fetch('/api/generate-jd', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ position, company, resumeText }),
  });
  if (!res.ok) throw new Error(`JD generation failed: ${res.status}`);
  const data = await res.json() as { jobDescription?: string };
  if (!data.jobDescription) throw new Error('No JD returned');
  return data.jobDescription;
}

// ─── Extract name from resume (Groq) ─────────────────────────────────────────
async function fetchExtractName(resumeText: string): Promise<string> {
  try {
    const res = await fetch('/api/extract-name', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ resumeText }),
    });
    if (!res.ok) return '';
    const data = await res.json() as { name?: string };
    return data.name || '';
  } catch { return ''; }
}

// ─── Supported file types ─────────────────────────────────────────────────────
function isValidResumeFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return name.endsWith('.pdf')  ||
         name.endsWith('.docx') ||
         name.endsWith('.doc')  ||
         name.endsWith('.txt');
}

// ─── Hook export interface ────────────────────────────────────────────────────
export interface UseInterviewSetupReturn {
  form:             SetupForm;
  updateForm:       (field: keyof SetupForm, value: string) => void;
  resumeFile:       File | null;
  resumeText:       string;
  isParsingResume:  boolean;
  resumeError:      string;
  handleResumeFile: (file: File) => Promise<void>;
  removeResume:     () => void;
  generatedJD:      string;
  editedJD:         string;
  setEditedJD:      (v: string) => void;
  isGeneratingJD:   boolean;
  jdError:          string;
  generateJD:       () => Promise<void>;
  finalJD:          string;
  isLaunching:      boolean;
  launchStage:      LaunchStage;
  launchError:      string;
  handleStartInterview: () => Promise<InterviewData | null>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useInterviewSetup(
  onComplete?: (data: InterviewData) => void
): UseInterviewSetupReturn {
  const [form, setForm]                       = useState<SetupForm>({ candidateName: '', position: '', company: '' });
  const [resumeFile, setResumeFile]           = useState<File | null>(null);
  const [resumeText, setResumeText]           = useState('');
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [resumeError, setResumeError]         = useState('');
  const [generatedJD, setGeneratedJD]         = useState('');
  const [editedJD, setEditedJD]               = useState('');
  const [isGeneratingJD, setIsGeneratingJD]   = useState(false);
  const [jdError, setJdError]                 = useState('');
  const [isLaunching, setIsLaunching]         = useState(false);
  const [launchStage, setLaunchStage]         = useState<LaunchStage>('kb');
  const [launchError, setLaunchError]         = useState('');

  const updateForm = useCallback((field: keyof SetupForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  // ── Resume upload + server-side parse ────────────────────────────────────────
  const handleResumeFile = useCallback(async (file: File) => {
    if (!isValidResumeFile(file)) {
      setResumeError('Please upload a PDF, DOCX, DOC, or TXT file.');
      return;
    }

    setResumeFile(file);
    setResumeError('');
    setIsParsingResume(true);

    try {
      // Server parses PDF/DOCX/TXT into clean text
      const text = await parseResumeOnServer(file);
      setResumeText(text);
      console.log(`[Setup] Resume parsed ✓ — ${text.length} chars from ${file.name}`);

      // Auto-extract candidate name
      if (text.length > 50) {
        const name = await fetchExtractName(text);
        if (name) {
          setForm(prev => ({ ...prev, candidateName: name }));
          console.log('[Setup] Name extracted:', name);
        }
      }
    } catch (err: any) {
      console.error('[Setup] Resume parse error:', err);
      setResumeError(err.message || 'Failed to read resume. Try a different format.');
    } finally {
      setIsParsingResume(false);
    }
  }, []);

  const removeResume = useCallback(() => {
    setResumeFile(null);
    setResumeText('');
    setResumeError('');
  }, []);

  // ── JD generation ─────────────────────────────────────────────────────────────
  const generateJD = useCallback(async () => {
    if (!form.position.trim() || isGeneratingJD) return;
    setIsGeneratingJD(true);
    setJdError('');

    try {
      const jd = await fetchGenerateJD(form.position, form.company, resumeText);
      setGeneratedJD(jd);
      setEditedJD(jd);
      console.log('[Setup] JD generated ✓');
    } catch (err) {
      // Silent fallback — always works
      console.warn('[Setup] JD generation failed, using template:', err);
      const fallback = clientTemplateJD(form.position, form.company);
      setGeneratedJD(fallback);
      setEditedJD(fallback);
    } finally {
      setIsGeneratingJD(false);
    }
  }, [form.position, form.company, resumeText, isGeneratingJD]);

  const finalJD = editedJD || generatedJD;

  // ── Launch interview ──────────────────────────────────────────────────────────
  const handleStartInterview = useCallback(async (): Promise<InterviewData | null> => {
    setIsLaunching(true);
    setLaunchError('');

    const token       = generateToken();
    const candidateId = generateCandidateId();
    const jdContent   = finalJD.trim() || clientTemplateJD(form.position, form.company);

    try {
      setLaunchStage('kb');
      await new Promise(r => setTimeout(r, 300));

      setLaunchStage('upload');
      await new Promise(r => setTimeout(r, 300));

      setLaunchStage('avatar');
      await new Promise(r => setTimeout(r, 200));

      const interviewData: InterviewData = {
        token,
        candidateId,
        candidateName:   form.candidateName || 'Candidate',
        position:        form.position,
        company:         form.company || 'the company',
        jobDescription:  jdContent,
        resumeText,                    // ← clean text from PDF/DOCX/TXT parser
        resumeFileName:  resumeFile?.name || '',
        knowledgeBaseId: null,
        createdAt:       new Date().toISOString(),
        // integritySettings: { ...DEFAULT_INTEGRITY_SETTINGS },
        integritySettings: {
          ...DEFAULT_INTEGRITY_SETTINGS,
          prohibitedObjects: [...DEFAULT_INTEGRITY_SETTINGS.prohibitedObjects],
        },
      };

      saveInterviewData(interviewData);

      console.log('[Setup] Interview started ✓', {
        candidate: interviewData.candidateName,
        position:  interviewData.position,
        resume:    `${resumeText.length} chars`,
        jd:        `${jdContent.length} chars`,
      });

      onComplete?.(interviewData);
      return interviewData;

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to start interview';
      setLaunchError(msg);
      setIsLaunching(false);
      return null;
    }
  }, [form, resumeText, resumeFile, finalJD, onComplete]);

  return {
    form, updateForm,
    resumeFile, resumeText, isParsingResume, resumeError,
    handleResumeFile, removeResume,
    generatedJD, editedJD, setEditedJD,
    isGeneratingJD, jdError, generateJD, finalJD,
    isLaunching, launchStage, launchError, handleStartInterview,
  };
}