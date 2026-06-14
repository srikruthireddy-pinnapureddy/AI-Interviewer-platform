'use client';
import { ButtonHTMLAttributes, forwardRef } from 'react';
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { className?: string; }
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', children, ...props }, ref) => (
    <button ref={ref}
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}>{children}</button>
  )
);
Button.displayName = 'Button';
