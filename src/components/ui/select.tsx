import React, { forwardRef } from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-bold uppercase tracking-wider font-mono">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`w-full border-2 border-black px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white rounded-none appearance-none ${
              error ? 'border-neo-coral focus:ring-neo-coral' : ''
            } ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-black font-bold border-l-2 border-black bg-neo-yellow">
            ▼
          </div>
        </div>
        {error && (
          <span className="text-xs font-bold text-neo-coral uppercase tracking-wide font-mono">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
