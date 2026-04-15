import { HTMLAttributes } from 'react';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  fallback?: string;
  gradient?: boolean;
  ring?: boolean;
}

export const Avatar = ({ 
  src, 
  alt = '', 
  size = 'md', 
  fallback, 
  gradient = false,
  ring = false,
  className = '', 
  ...props 
}: AvatarProps) => {
  const sizes = {
    xs: 'w-8 h-8 text-xs',
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 text-xl',
    '2xl': 'w-28 h-28 text-2xl'
  };
  
  const bgClass = gradient 
    ? 'bg-gradient-primary' 
    : 'bg-[rgb(var(--primary))]';
  
  const ringClass = ring 
    ? 'ring-4 ring-[rgb(var(--background))] ring-offset-2 ring-offset-[rgb(var(--background))]' 
    : '';
  
  return (
    <div
      className={`${sizes[size]} rounded-full overflow-hidden ${bgClass} ${ringClass} flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-soft ${className}`}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span>{fallback || alt.charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
};
