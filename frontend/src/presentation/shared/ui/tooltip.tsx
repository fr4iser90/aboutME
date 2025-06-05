import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const tooltipContentStyle: React.CSSProperties = {
  zIndex: 50,
  overflow: 'hidden',
  borderRadius: 'var(--radius-base)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-popover, var(--color-background))',
  color: 'var(--color-popover-foreground, var(--color-text))',
  padding: '0.375rem 1rem',
  fontSize: '0.875rem',
  boxShadow: 'var(--theme-shadow-md)',
};

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, style, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(className)}
    style={{ ...tooltipContentStyle, ...style }}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }; 