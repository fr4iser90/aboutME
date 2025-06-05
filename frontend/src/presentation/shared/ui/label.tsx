import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/lib/utils';

const labelStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: 500,
  lineHeight: 1,
};

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, style, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(className)}
    style={{ ...labelStyle, ...style }}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label }; 