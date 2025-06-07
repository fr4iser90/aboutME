import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const Accordion = AccordionPrimitive.Root;

const itemStyle: React.CSSProperties = {
  borderBottom: '1px solid var(--color-border)',
};

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, style, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(className)}
    style={{ ...itemStyle, ...style }}
    {...props}
  />
));
AccordionItem.displayName = 'AccordionItem';

const triggerStyle: React.CSSProperties = {
  display: 'flex',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '1rem 0',
  fontWeight: 500,
  transition: 'all 0.2s',
  cursor: 'pointer',
  background: 'transparent',
  border: 'none',
  outline: 'none',
};

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, style, ...props }, ref) => (
  <AccordionPrimitive.Header style={{ display: 'flex' }}>
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(className)}
      style={{ ...triggerStyle, ...style }}
      {...props}
    >
      {children}
      <ChevronDown style={{ height: '1rem', width: '1rem', transition: 'transform 0.2s' }} />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const contentStyle: React.CSSProperties = {
  overflow: 'hidden',
  fontSize: '0.875rem',
  transition: 'all 0.2s',
};

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, style, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(className)}
    style={{ ...contentStyle, ...style }}
    {...props}
  >
    <div style={{ paddingBottom: '1rem', paddingTop: 0 }} className={cn(className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }; 