// // app/api/parse-resume/route.ts
// // Properly extracts text from PDF, DOCX, and TXT files server-side

// import { NextRequest, NextResponse } from 'next/server';

// export async function POST(req: NextRequest) {
//   try {
//     const formData  = await req.formData();
//     const file      = formData.get('file') as File | null;

//     if (!file) {
//       return NextResponse.json({ error: 'No file provided' }, { status: 400 });
//     }

//     const fileName  = file.name.toLowerCase();
//     const arrayBuffer = await file.arrayBuffer();
//     const buffer    = Buffer.from(arrayBuffer);
//     let   text      = '';

//     console.log(`[Resume] Parsing: ${file.name} (${file.size} bytes)`);

//     // ── PDF ──────────────────────────────────────────────────────────────────
//     if (fileName.endsWith('.pdf')) {
//       try {
//         const pdfParse = (await import('pdf-parse')).default;
//         const parsed   = await pdfParse(buffer);
//         text = parsed.text || '';
//         console.log(`[Resume] PDF parsed: ${text.length} chars, ${parsed.numpages} pages`);
//       } catch (err) {
//         console.error('[Resume] PDF parse error:', err);
//         return NextResponse.json({ error: 'Failed to parse PDF. Try saving as .txt or .docx.' }, { status: 422 });
//       }
//     }

//     // ── DOCX ─────────────────────────────────────────────────────────────────
//     else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
//       try {
//         const mammoth = await import('mammoth');
//         const result  = await mammoth.extractRawText({ buffer });
//         text = result.value || '';
//         console.log(`[Resume] DOCX parsed: ${text.length} chars`);
//       } catch (err) {
//         console.error('[Resume] DOCX parse error:', err);
//         return NextResponse.json({ error: 'Failed to parse DOCX. Try saving as .txt.' }, { status: 422 });
//       }
//     }

//     // ── TXT / plain text ──────────────────────────────────────────────────────
//     else if (fileName.endsWith('.txt') || fileName.endsWith('.text')) {
//       text = buffer.toString('utf-8');
//       console.log(`[Resume] TXT read: ${text.length} chars`);
//     }

//     else {
//       return NextResponse.json(
//         { error: `Unsupported file type: ${fileName.split('.').pop()}. Use PDF, DOCX, or TXT.` },
//         { status: 400 }
//       );
//     }

//     // ── Clean up text ─────────────────────────────────────────────────────────
//     text = text
//       .replace(/\r\n/g, '\n')
//       .replace(/\r/g, '\n')
//       .replace(/\n{3,}/g, '\n\n')  // max 2 consecutive newlines
//       .replace(/[ \t]{2,}/g, ' ')  // collapse multiple spaces
//       .trim();

//     if (!text || text.length < 20) {
//       return NextResponse.json(
//         { error: 'File appears to be empty or unreadable. Try a different format.' },
//         { status: 422 }
//       );
//     }

//     console.log(`[Resume] ✅ Extracted ${text.length} chars from ${file.name}`);

//     return NextResponse.json({
//       success:  true,
//       text:     text.slice(0, 8000), // limit to 8k chars
//       length:   text.length,
//       fileName: file.name,
//     });

//   } catch (err: any) {
//     console.error('[Resume] Fatal:', err.message);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }
// app/api/parse-resume/route.ts
// Uses 'unpdf' — works natively with Next.js 14 App Router (no webpack issues)
// Install: npm install unpdf mammoth

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file     = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileName    = file.name.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    const buffer      = Buffer.from(arrayBuffer);
    let   text        = '';

    console.log(`[Resume] Parsing: ${file.name} (${(file.size / 1024).toFixed(0)} KB)`);

    // ── PDF — uses unpdf (Next.js compatible) ─────────────────────────────────
    if (fileName.endsWith('.pdf')) {
      try {
        const { extractText, getDocumentProxy } = await import('unpdf');
        const pdf  = await getDocumentProxy(new Uint8Array(arrayBuffer));
        const { text: extracted } = await extractText(pdf, { mergePages: true });
        text = extracted || '';
        console.log(`[Resume] PDF parsed via unpdf: ${text.length} chars`);
      } catch (err) {
        console.error('[Resume] PDF parse error:', err);
        return NextResponse.json(
          { error: 'Failed to parse PDF. Try saving as .txt or .docx.' },
          { status: 422 }
        );
      }
    }

    // ── DOCX / DOC ────────────────────────────────────────────────────────────
    else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      try {
        const mammoth = await import('mammoth');
        const result  = await mammoth.extractRawText({ buffer });
        text = result.value || '';
        console.log(`[Resume] DOCX parsed: ${text.length} chars`);
      } catch (err) {
        console.error('[Resume] DOCX parse error:', err);
        return NextResponse.json(
          { error: 'Failed to parse DOCX. Try saving as .txt.' },
          { status: 422 }
        );
      }
    }

    // ── TXT ───────────────────────────────────────────────────────────────────
    else if (fileName.endsWith('.txt')) {
      text = buffer.toString('utf-8');
      console.log(`[Resume] TXT read: ${text.length} chars`);
    }

    else {
      return NextResponse.json(
        { error: `Unsupported format: .${fileName.split('.').pop()}. Use PDF, DOCX, or TXT.` },
        { status: 400 }
      );
    }

    // ── Clean up ──────────────────────────────────────────────────────────────
    text = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]{2,}/g, ' ')
      .trim();

    if (!text || text.length < 20) {
      return NextResponse.json(
        { error: 'File appears empty or unreadable. Try a different format.' },
        { status: 422 }
      );
    }

    console.log(`[Resume] ✅ Extracted ${text.length} chars from ${file.name}`);

    return NextResponse.json({
      success:  true,
      text:     text.slice(0, 8000),
      length:   text.length,
      fileName: file.name,
    });

  } catch (err: any) {
    console.error('[Resume] Fatal:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}