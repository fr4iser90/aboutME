import * as React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cn } from '@/lib/utils';

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = 'horizontal', decorative = true, style, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(className)}
      style={{
        flexShrink: 0,
        background: 'var(--color-border)',
        ...(orientation === 'horizontal' ? {
          height: '1px',
          width: '100%',
        } : {
          height: '100%',
          width: '1px',
        }),
        ...style
      }}
      {...props}
    />
  )
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator }; 