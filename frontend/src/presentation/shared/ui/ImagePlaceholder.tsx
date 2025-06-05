import React from 'react';
import { cn } from '@/lib/utils';

interface ImagePlaceholderProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
  size?: string;
}

const defaultStyle: React.CSSProperties = {
  width: 'var(--image-size, 200px)',
  height: 'var(--image-size, 200px)',
  background: 'var(--color-placeholder-bg, #e0e0e0)',
  color: 'var(--color-placeholder-text, #888)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'var(--image-radius, 1rem)',
  border: '1px dashed var(--color-border, #ccc)',
  fontSize: '1rem',
  fontWeight: 500,
  userSelect: 'none',
};

export const ImagePlaceholder = React.forwardRef<HTMLDivElement, ImagePlaceholderProps>(
  ({ className, style, text = 'Bild', size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(className)}
      style={{
        ...defaultStyle,
        ...(size ? { width: size, height: size } : {}),
        ...style,
      }}
      {...props}
    >
      {text}
    </div>
  )
);
ImagePlaceholder.displayName = 'ImagePlaceholder'; 