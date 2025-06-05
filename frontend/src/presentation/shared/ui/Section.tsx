import React from 'react';
import { cn } from '@/lib/utils';

const sectionStyle: React.CSSProperties = {
  paddingTop: 'var(--section-padding-y, 2rem)',
  paddingBottom: 'var(--section-padding-y, 2rem)',
  marginBottom: 'var(--section-margin-bottom, 2rem)',
  width: '100%',
};

export const Section = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => (
    <section
      ref={ref}
      className={cn(className)}
      style={{ ...sectionStyle, ...style }}
      {...props}
    />
  )
);
Section.displayName = 'Section'; 