const API_BASE_URL = 'http://127.0.0.1:8000';

export interface StartInterviewPayload {
  position: string;
  company: string;
  jobDescription: string;
  resumeText: string;
  candidateName: string;
}

export interface StartInterviewResponse {
  session_id?: string;
  question: string;
  audio_file: string;
  completed?: boolean;
}

export interface SubmitAnswerResponse {
  session_id?: string;
  candidate_text: string;
  next_question: string;
  audio_file: string;
  completed?: boolean;
}

function buildUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

async function parseResponseError(response: Response): Promise<string> {
  const contentType = response.headers.get('content-type') || '';
  try {
    if (contentType.includes('application/json')) {
      const data = await response.json() as { detail?: string; error?: string };
      return data.detail || data.error || `Request failed with status ${response.status}`;
    }
    const text = await response.text();
    return text || `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

export async function startInterview(payload: StartInterviewPayload): Promise<StartInterviewResponse> {
  const response = await fetch(`${API_BASE_URL}/start-interview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseResponseError(response));
  }

  return response.json() as Promise<StartInterviewResponse>;
}

export async function submitAnswer(sessionId: string | null, audioFile: Blob): Promise<SubmitAnswerResponse> {
  const formData = new FormData();
  formData.append('audio_file', audioFile, 'answer.webm');
  if (sessionId) {
    formData.append('session_id', sessionId);
  }

  const response = await fetch(`${API_BASE_URL}/answer`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseResponseError(response));
  }

  return response.json() as Promise<SubmitAnswerResponse>;
}

export async function downloadAudio(audioFile: string): Promise<string> {
  const response = await fetch(buildUrl(audioFile));
  if (!response.ok) {
    throw new Error(`Audio download failed with status ${response.status}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export { API_BASE_URL };