// app/api/extract-name/route.ts
// Uses Groq API to extract candidate name from resume

import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY!;
const GROQ_MODEL   = 'llama-3.3-70b-versatile';

export async function POST(req: NextRequest) {
  try {
    const { resumeText } = await req.json() as { resumeText: string };
    if (!resumeText) return NextResponse.json({ name: '' });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: 50,
        temperature: 0,
        messages: [
          {
            role: 'system',
            content: 'You extract candidate names from resumes. Return ONLY valid JSON. No extra text.',
          },
          {
            role: 'user',
            content: `Extract the candidate full name from this resume. Return ONLY JSON like: {"name": "John Doe"} or {"name": ""} if not found.\n\nResume:\n${resumeText.substring(0, 800)}`,
          },
        ],
      }),
    });

    if (!response.ok) return NextResponse.json({ name: '' });

    const data = await response.json() as {
      choices?: { message?: { content?: string } }[];
    };

    const text = data.choices?.[0]?.message?.content || '{}';
    try {
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim()) as { name: string };
      return NextResponse.json({ name: parsed.name || '' });
    } catch {
      return NextResponse.json({ name: '' });
    }

  } catch (err) {
    console.error('[ExtractName]', err);
    return NextResponse.json({ name: '' });
  }
}
