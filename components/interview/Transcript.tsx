'use client';
import type { Message } from '@/lib/types';
interface Props { messages: Message[]; }
export function Transcript({ messages }: Props) {
  return (
    <div className="flex flex-col gap-2 p-3 overflow-y-auto h-full">
      {messages.map((m) => (
        <div key={m.id} className={`flex ${m.isUser ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-xs rounded-2xl px-4 py-2 text-sm ${
            m.type === 'system' ? 'bg-gray-700 text-gray-300 italic text-xs'
            : m.isUser ? 'bg-blue-600 text-white'
            : 'bg-gray-700 text-white'
          }`}>{m.text}</div>
        </div>
      ))}
    </div>
  );
}
