import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-bold uppercase tracking-wider font-mono">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full border-2 border-black px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white rounded-none placeholder:text-zinc-400 ${
            error ? 'border-neo-coral focus:ring-neo-coral' : ''
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs font-bold text-neo-coral uppercase tracking-wide font-mono">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
