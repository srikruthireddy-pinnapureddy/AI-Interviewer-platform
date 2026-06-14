import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  let body: Record<string, any> = {};
  try {
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const text = await req.text();
      if (text.trim()) body = JSON.parse(text);
    } else if (contentType.includes('multipart/form-data')) {
      const fd = await req.formData();
      fd.forEach((v, k) => { body[k] = v; });
    }
  } catch {}
  // TODO: Mark interview as completed in your database
  console.log('[Complete] Token:', params.token, '| Session:', body.session_id);
  return NextResponse.json({ success: true, token: params.token, completed_at: new Date().toISOString() });
}
