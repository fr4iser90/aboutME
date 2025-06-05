import React from 'react';
import { cn } from '@/lib/utils';

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: number;
  gap?: string;
  style?: React.CSSProperties;
}

const defaultGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(var(--grid-columns, 3), 1fr)',
  gap: 'var(--grid-gap, 2rem)',
  width: '100%',
};

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, columns, gap, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(className)}
      style={{
        ...defaultGridStyle,
        ...(columns ? { gridTemplateColumns: `repeat(${columns}, 1fr)` } : {}),
        ...(gap ? { gap } : {}),
        ...style,
      }}
      {...props}
    />
  )
);
Grid.displayName = 'Grid'; 