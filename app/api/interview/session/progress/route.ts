import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest) {
  const body = await req.json();
  // TODO: Update session progress in your database
  console.log('[Progress]', body.session_id, body.progress + '%');
  return NextResponse.json({ success: true });
}
