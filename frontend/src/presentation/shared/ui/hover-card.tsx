import * as React from 'react';
import * as HoverCardPrimitive from '@radix-ui/react-hover-card';
import { cn } from '@/lib/utils';

const HoverCard = HoverCardPrimitive.Root;

const HoverCardTrigger = HoverCardPrimitive.Trigger;

const hoverCardContentStyle: React.CSSProperties = {
  zIndex: 50,
  width: '16rem',
  borderRadius: 'var(--radius-base)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-popover, var(--color-background))',
  color: 'var(--color-popover-foreground, var(--color-text))',
  padding: '1rem',
  boxShadow: 'var(--theme-shadow-md)',
  outline: 'none',
};

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, style, ...props }, ref) => (
  <HoverCardPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(className)}
    style={{ ...hoverCardContentStyle, ...style }}
    {...props}
  />
));
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

export { HoverCard, HoverCardTrigger, HoverCardContent }; 