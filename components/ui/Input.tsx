'use client';
interface InputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}
export function Input({ value, onChange, placeholder, className = '', onKeyDown }: InputProps) {
  return (
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown} placeholder={placeholder}
      className={`rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none ${className}`}
    />
  );
}
