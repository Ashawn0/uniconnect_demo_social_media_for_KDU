import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'motion/react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  glow?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth, glow, className = '', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2.5 rounded-2xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(var(--primary))]';
    
    const variants = {
      primary: 'bg-[rgb(var(--primary))] text-white shadow-card hover:shadow-card-lg hover:scale-[1.02] active:scale-[0.98]',
      gradient: 'bg-gradient-primary text-white shadow-card hover:shadow-card-lg hover:scale-[1.02] active:scale-[0.98]',
      secondary: 'bg-[rgb(var(--muted))] text-[rgb(var(--foreground))] shadow-soft hover:shadow-card hover:bg-[rgb(var(--card-hover))]',
      ghost: 'text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] active:bg-[rgb(var(--muted))]',
      outline: 'border-2 border-[rgb(var(--border))] text-[rgb(var(--foreground))] hover:border-[rgb(var(--primary))] hover:bg-[rgb(var(--muted))] shadow-soft'
    };
    
    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-2.5 text-sm',
      lg: 'px-8 py-3.5 text-base'
    };
    
    const widthClass = fullWidth ? 'w-full' : '';
    const glowClass = glow ? 'glow-primary-hover' : '';
    
    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${glowClass} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
