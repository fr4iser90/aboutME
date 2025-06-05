import * as React from 'react';
import { cn } from '@/lib/utils';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
}

const variantStyles: Record<string, React.CSSProperties> = {
  default: {
    background: 'var(--color-background)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border, #a78bfa)',
    borderRadius: 'var(--radius-large)',
    padding: '1rem',
    position: 'relative',
    width: '100%',
    boxSizing: 'border-box',
  },
  destructive: {
    background: 'var(--color-danger, #ef4444)',
    color: 'var(--color-text, #fff)',
    border: '1px solid var(--color-danger, #ef4444)',
    borderRadius: 'var(--radius-large)',
    padding: '1rem',
    position: 'relative',
    width: '100%',
    boxSizing: 'border-box',
  },
};

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', style, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(className)}
      style={{ ...variantStyles[variant], ...style }}
      {...props}
    />
  )
);
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, style, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn(className)}
    style={{ marginBottom: '0.25rem', fontWeight: 500, lineHeight: 1.1, letterSpacing: '0.01em', ...style }}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, style, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(className)}
    style={{ fontSize: '0.875rem', lineHeight: 1.5, ...style }}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription }; 