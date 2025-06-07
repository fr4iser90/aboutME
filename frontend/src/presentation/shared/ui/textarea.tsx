import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const textareaStyle: React.CSSProperties = {
  display: 'flex',
  minHeight: '60px',
  width: '100%',
  borderRadius: 'var(--theme-radius-base)',
  border: '1px solid var(--color-border, #a78bfa)',
  background: 'var(--theme-background)',
  color: 'var(--theme-text)',
  padding: '0.5rem 0.75rem',
  fontSize: 'var(--theme-font-size-base)',
  boxShadow: 'var(--theme-shadow-sm)',
  transition: 'background 0.2s, color 0.2s',
};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, style, ...props }, ref) => {
    return (
      <textarea
        className={cn(className)}
        style={{ ...textareaStyle, ...style }}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea }; 