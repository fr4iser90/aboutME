import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const variantStyles: Record<string, React.CSSProperties> = {
  default: {
    background: 'var(--button-bg, var(--color-primary))',
    color: 'var(--button-text, var(--theme-body-foreground))',
    boxShadow: 'var(--button-shadow, var(--theme-shadow-default))',
    border: '1px solid var(--button-border, transparent)',
  },
  destructive: {
    background: 'var(--color-danger, #ef4444)',
    color: 'var(--button-text, #fff)',
    boxShadow: 'var(--theme-shadow-sm)',
    border: '1px solid var(--color-danger, #ef4444)',
  },
  outline: {
    background: 'var(--button-bg, var(--color-background))',
    color: 'var(--button-text, var(--theme-body-foreground))',
    border: '1px solid var(--button-border, var(--color-border, #a78bfa))',
    boxShadow: 'var(--theme-shadow-sm)',
  },
  secondary: {
    background: 'var(--button-bg, var(--color-secondary))',
    color: 'var(--button-text, var(--theme-body-foreground))',
    boxShadow: 'var(--theme-shadow-sm)',
    border: '1px solid var(--button-border, transparent)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--button-text, var(--color-accent))',
  },
  link: {
    background: 'transparent',
    color: 'var(--button-text, var(--color-primary))',
    textDecoration: 'underline',
  },
};

const sizeStyles: Record<string, React.CSSProperties> = {
  default: {
    height: '2.25rem',
    padding: 'var(--spacing-small) var(--spacing-large)',
    fontSize: 'var(--font-size-base)',
    borderRadius: 'var(--radius-base)',
  },
  sm: {
    height: '2rem',
    padding: 'var(--spacing-small) var(--spacing-base)',
    fontSize: 'var(--font-size-small)',
    borderRadius: 'var(--radius-base)',
  },
  lg: {
    height: '2.5rem',
    padding: 'var(--spacing-large) var(--spacing-large)',
    fontSize: 'var(--font-size-large)',
    borderRadius: 'var(--radius-large)',
  },
  icon: {
    height: '2.25rem',
    width: '2.25rem',
    padding: 0,
    borderRadius: 'var(--radius-large)',
  },
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    const mergedStyle = {
      ...variantStyles[variant],
      ...sizeStyles[size],
      ...style,
    };
    return (
      <Comp
        className={cn(className)}
        style={mergedStyle}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button }; 