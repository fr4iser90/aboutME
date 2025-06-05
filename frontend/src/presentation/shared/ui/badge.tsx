import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const variantStyles: Record<string, React.CSSProperties> = {
  default: {
    background: 'var(--color-primary)',
    color: 'var(--color-text)',
    border: '1px solid transparent',
  },
  secondary: {
    background: 'var(--color-secondary)',
    color: 'var(--color-text)',
    border: '1px solid transparent',
  },
  destructive: {
    background: 'var(--color-danger, #ef4444)',
    color: 'var(--color-text, #fff)',
    border: '1px solid transparent',
  },
  outline: {
    background: 'transparent',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border, #a78bfa)',
  },
};

function Badge({ className, variant = 'default', style, ...props }: BadgeProps) {
  const mergedStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: '9999px',
    padding: '0.125rem 0.625rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    transition: 'background 0.2s, color 0.2s',
    ...variantStyles[variant],
    ...style,
  };
  return (
    <div className={cn(className)} style={mergedStyle} {...props} />
  );
}

export { Badge }; 