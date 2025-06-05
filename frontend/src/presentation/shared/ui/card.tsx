import * as React from 'react';
import { cn } from '@/lib/utils';

const cardStyle: React.CSSProperties = {
  borderRadius: 'var(--radius-large)',
  border: '1px solid var(--color-border, #a78bfa)',
  background: 'var(--color-background)',
  color: 'var(--color-text)',
  boxShadow: 'var(--theme-shadow-sm)',
};

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, style, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(className)}
    style={{ ...cardStyle, ...style }}
    {...props}
  />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, style, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(className)}
    style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', padding: '1.5rem', ...style }}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, style, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(className)}
    style={{ fontSize: '2rem', fontWeight: 600, lineHeight: 1.1, letterSpacing: '0.01em', ...style }}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, style, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(className)}
    style={{ fontSize: '0.875rem', color: 'var(--color-text-muted, #94a3b8)', ...style }}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, style, ...props }, ref) => (
  <div ref={ref} className={cn(className)} style={{ padding: '1.5rem', paddingTop: 0, ...style }} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, style, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(className)}
    style={{ display: 'flex', alignItems: 'center', padding: '1.5rem', paddingTop: 0, ...style }}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
}; 