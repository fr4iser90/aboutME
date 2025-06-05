import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const inputStyle: React.CSSProperties = {
  display: 'flex',
  height: '2.25rem',
  width: '100%',
  borderRadius: 'var(--radius-base)',
  border: '1px solid var(--color-border, #a78bfa)',
  background: 'var(--color-background)',
  color: 'var(--color-text)',
  padding: '0.25rem 0.75rem',
  fontSize: 'var(--font-size-base)',
  boxShadow: 'var(--theme-shadow-sm)',
  transition: 'background 0.2s, color 0.2s',
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, style, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(className)}
        style={{ ...inputStyle, ...style }}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input }; 