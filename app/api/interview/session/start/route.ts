import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest) {
  const body = await req.json();
  // TODO: Persist session to your database (Prisma, Supabase, etc.)
  console.log('[Session] Started:', body.session_id, '| Candidate:', body.candidate_name);
  return NextResponse.json({ success: true, session_id: body.session_id });
}
