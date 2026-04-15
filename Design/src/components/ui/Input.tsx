import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block mb-2.5 text-sm font-medium text-[rgb(var(--foreground))]">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(var(--muted-foreground))]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full px-4 py-3.5 bg-[rgb(var(--input))] border border-[rgb(var(--border))] rounded-2xl text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary)/0.5)] focus:border-[rgb(var(--primary))] transition-all duration-300 shadow-soft ${icon ? 'pl-12' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-2 text-sm text-[rgb(var(--destructive))]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
