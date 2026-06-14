import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'AI Interview Platform',
  description: 'FastAPI-powered AI interview platform with Whisper, Gemini, and XTTS',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
