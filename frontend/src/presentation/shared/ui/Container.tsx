import React from 'react';
import { cn } from '@/lib/utils';

const containerStyle: React.CSSProperties = {
  maxWidth: 'var(--container-width, 1200px)',
  marginLeft: 'auto',
  marginRight: 'auto',
  paddingLeft: 'var(--container-padding, 1rem)',
  paddingRight: 'var(--container-padding, 1rem)',
  width: '100%',
  boxSizing: 'border-box',
};

export const Container = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(className)}
      style={{ ...containerStyle, ...style }}
      {...props}
    />
  )
);
Container.displayName = 'Container'; 