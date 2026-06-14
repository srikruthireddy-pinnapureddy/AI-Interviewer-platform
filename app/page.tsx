// import Link from 'next/link';
// export default function Home() {
//   return (
//     <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
//       <div className="text-center">
//         <h1 className="text-4xl font-bold text-white mb-4">AI Interview Platform</h1>
//         <Link href="/interview" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg transition-all">
//           Start Interview →
//         </Link>
//       </div>
//     </main>
//   );
// }

// app/page.tsx
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/interview');
}
