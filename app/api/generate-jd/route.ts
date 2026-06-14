// app/api/generate-jd/route.ts
// Uses Groq API — falls back to smart template if Groq unavailable

import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL   = 'llama-3.3-70b-versatile';

// ─── Template fallback — always works, no API needed ─────────────────────────
function templateJD(position: string, company: string): string {
  return `Role Overview
We are looking for a talented ${position} to join ${company || 'our team'}. The ideal candidate will bring strong expertise and passion for excellence in a fast-paced, collaborative environment.

Key Responsibilities
• Lead end-to-end delivery for ${position} projects and initiatives
• Collaborate cross-functionally with product, design, and engineering teams
• Maintain high standards of quality, documentation, and best practices
• Mentor junior team members and contribute to knowledge sharing
• Participate in planning, reviews, and continuous improvement cycles
• Analyze complex problems and propose scalable, effective solutions
• Stay current with industry trends relevant to the ${position} role

Required Qualifications
• 3+ years of professional experience as a ${position} or in a similar role
• Strong analytical thinking and problem-solving skills
• Excellent written and verbal communication abilities
• Proven track record of delivering results independently and in teams
• Bachelor's degree in a relevant field or equivalent practical experience

Preferred Qualifications
• Experience in a fast-growing or enterprise environment
• Familiarity with agile or scrum methodologies
• Strong portfolio of relevant project work
• Experience with modern tools and frameworks for ${position}

What We Offer
• Competitive salary and performance-based bonuses
• Flexible remote-friendly work environment
• Learning and development budget
• Comprehensive health and wellness benefits
• Inclusive, collaborative team culture`;
}

export async function POST(req: NextRequest) {
  // Parse body safely
  let position = '';
  let company  = '';
  let resumeText = '';

  try {
    const body = await req.json() as {
      position?: string;
      company?:  string;
      resumeText?: string;
    };
    position   = body.position   || '';
    company    = body.company    || '';
    resumeText = body.resumeText || '';
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!position.trim()) {
    return NextResponse.json({ error: 'position is required' }, { status: 400 });
  }

  // ── No Groq key → return template immediately ─────────────────────────────
  if (!GROQ_API_KEY) {
    console.warn('[JD] GROQ_API_KEY not set — using template');
    return NextResponse.json({
      success: true,
      jobDescription: templateJD(position, company),
      source: 'template',
    });
  }

  // ── Try Groq ──────────────────────────────────────────────────────────────
  const prompt = `Generate a professional Job Description for the following role.

Position: ${position}
Company: ${company || 'the company'}
${resumeText ? `Candidate Resume (for context):\n${resumeText.substring(0, 1200)}` : ''}

Write a structured JD with exactly these 5 sections:
1. Role Overview (2-3 sentences)
2. Key Responsibilities (5-7 bullet points starting with •)
3. Required Qualifications (4-5 bullet points starting with •)
4. Preferred Qualifications (3-4 bullet points starting with •)
5. What We Offer (3-4 bullet points starting with •)

Use plain section headers (no markdown ##). Keep it professional and concise.`;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: 1000,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: 'You are an expert HR professional. Write clear, professional job descriptions. Return only the JD content, no extra commentary.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[JD] Groq API error:', res.status, errText.slice(0, 200));
      // Fall back to template
      return NextResponse.json({
        success: true,
        jobDescription: templateJD(position, company),
        source: 'template_fallback',
      });
    }

    const data = await res.json() as {
      choices?: { message?: { content?: string } }[];
    };

    const jd = data.choices?.[0]?.message?.content?.trim() || '';

    if (!jd) {
      console.warn('[JD] Empty Groq response — using template');
      return NextResponse.json({
        success: true,
        jobDescription: templateJD(position, company),
        source: 'template_fallback',
      });
    }

    console.log('[JD] ✅ Generated via Groq for:', position);
    return NextResponse.json({
      success: true,
      jobDescription: jd,
      source: 'groq',
    });

  } catch (err) {
    // Network error — fall back to template, never crash
    console.error('[JD] Groq request failed:', err);
    return NextResponse.json({
      success: true,
      jobDescription: templateJD(position, company),
      source: 'template_fallback',
    });
  }
}