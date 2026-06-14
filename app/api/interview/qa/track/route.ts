import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest) {
  const body = await req.json();
  // TODO: Save Q&A pair to your database
  console.log('[QA]', body.type + ':', String(body.content).substring(0, 60));
  return NextResponse.json({
    success: true,
    stats: { total_questions: 10, answered_questions: 0, progress_percentage: 0 },
  });
}
