import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const popoverContentStyle: React.CSSProperties = {
  zIndex: 50,
  width: '18rem',
  borderRadius: 'var(--radius-base)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-popover, var(--color-background))',
  color: 'var(--color-popover-foreground, var(--color-text))',
  padding: '1rem',
  boxShadow: 'var(--theme-shadow-md)',
  outline: 'none',
};

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, style, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(className)}
      style={{ ...popoverContentStyle, ...style }}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent }; 