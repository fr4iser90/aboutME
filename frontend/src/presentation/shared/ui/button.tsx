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
    background: 'var(--theme-button-bg, var(--theme-primary))',
    color: 'var(--theme-button-text, var(--theme-body-foreground))',
    boxShadow: 'var(--theme-button-shadow, var(--theme-shadow-default))',
    border: '1px solid var(--theme-button-border, transparent)',
  },
  destructive: {
    background: 'var(--color-danger, #ef4444)',
    color: 'var(--theme-button-text, #fff)',
    boxShadow: 'var(--theme-shadow-sm)',
    border: '1px solid var(--color-danger, #ef4444)',
  },
  outline: {
    background: 'var(--theme-button-bg, var(--theme-background))',
    color: 'var(--theme-button-text, var(--theme-body-foreground))',
    border: '1px solid var(--theme-button-border, var(--color-border, #a78bfa))',
    boxShadow: 'var(--theme-shadow-sm)',
  },
  secondary: {
    background: 'var(--theme-button-bg, var(--theme-secondary))',
    color: 'var(--theme-button-text, var(--theme-body-foreground))',
    boxShadow: 'var(--theme-shadow-sm)',
    border: '1px solid var(--theme-button-border, transparent)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--theme-button-text, var(--theme-accent))',
  },
  link: {
    background: 'transparent',
    color: 'var(--theme-button-text, var(--theme-primary))',
    textDecoration: 'underline',
  },
};

const sizeStyles: Record<string, React.CSSProperties> = {
  default: {
    height: '2.25rem',
    padding: 'var(--theme-spacing-small) var(--theme-spacing-large)',
    fontSize: 'var(--theme-font-size-base)',
    borderRadius: 'var(--theme-radius-base)',
  },
  sm: {
    height: '2rem',
    padding: 'var(--theme-spacing-small) var(--theme-spacing-base)',
    fontSize: 'var(--theme-font-size-small)',
    borderRadius: 'var(--theme-radius-base)',
  },
  lg: {
    height: '2.5rem',
    padding: 'var(--theme-spacing-large) var(--theme-spacing-large)',
    fontSize: 'var(--theme-font-size-large)',
    borderRadius: 'var(--theme-radius-large)',
  },
  icon: {
    height: '2.25rem',
    width: '2.25rem',
    padding: 0,
    borderRadius: 'var(--theme-radius-large)',
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