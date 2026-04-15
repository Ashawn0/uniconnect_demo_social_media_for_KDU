import { HTMLAttributes } from 'react';
import { motion } from 'motion/react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  glass?: boolean;
  gradient?: boolean;
  glow?: boolean;
}

export const Card = ({ 
  hoverable = false, 
  glass = false, 
  gradient = false,
  glow = false,
  className = '', 
  children, 
  ...props 
}: CardProps) => {
  const baseStyles = 'rounded-3xl transition-all duration-300';
  
  let bgStyles = 'bg-[rgb(var(--card))] border border-[rgb(var(--border))] shadow-card';
  
  if (glass) {
    bgStyles = 'glass shadow-card-lg';
  }
  
  if (gradient) {
    bgStyles = 'border-gradient shadow-card-lg';
  }
  
  const hoverStyles = hoverable 
    ? 'cursor-pointer hover:shadow-card-lg hover:-translate-y-1 hover:border-[rgb(var(--primary)/0.3)]' 
    : '';
  
  const glowClass = glow ? 'glow-primary-hover' : '';
  
  if (hoverable) {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={`${baseStyles} ${bgStyles} ${hoverStyles} ${glowClass} ${className}`}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
  
  return (
    <div className={`${baseStyles} ${bgStyles} ${glowClass} ${className}`} {...props}>
      {children}
    </div>
  );
};
