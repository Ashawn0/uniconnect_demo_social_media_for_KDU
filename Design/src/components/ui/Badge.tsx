import { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'gradient';
  size?: 'sm' | 'md';
}

export const Badge = ({ 
  variant = 'default', 
  size = 'sm',
  className = '', 
  children, 
  ...props 
}: BadgeProps) => {
  const variants = {
    default: 'bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))] border border-[rgb(var(--border))]',
    primary: 'bg-[rgb(var(--primary)/0.1)] text-[rgb(var(--primary))] border border-[rgb(var(--primary)/0.2)]',
    success: 'bg-[rgb(var(--success)/0.1)] text-[rgb(var(--success))] border border-[rgb(var(--success)/0.2)]',
    warning: 'bg-[rgb(var(--warning)/0.1)] text-[rgb(var(--warning))] border border-[rgb(var(--warning)/0.2)]',
    danger: 'bg-[rgb(var(--destructive)/0.1)] text-[rgb(var(--destructive))] border border-[rgb(var(--destructive)/0.2)]',
    gradient: 'bg-gradient-soft text-[rgb(var(--primary))] border border-[rgb(var(--primary)/0.2)]'
  };
  
  const sizes = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3.5 py-1.5 text-sm'
  };
  
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
