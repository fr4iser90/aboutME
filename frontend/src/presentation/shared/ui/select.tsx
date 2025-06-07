import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, style, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(className)}
    style={{
      display: 'flex',
      height: '2.5rem',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: 'var(--theme-radius-base)',
      border: '1px solid var(--color-border)',
      background: 'var(--theme-background)',
      padding: '0.5rem 0.75rem',
      fontSize: 'var(--theme-font-size-base)',
      outline: 'none',
      ...style
    }}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown style={{ height: '1rem', width: '1rem', opacity: 0.5 }} />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, style, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(className)}
    style={{ display: 'flex', cursor: 'default', alignItems: 'center', justifyContent: 'center', padding: '0.25rem', ...style }}
    {...props}
  >
    <ChevronUp style={{ height: '1rem', width: '1rem' }} />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, style, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(className)}
    style={{ display: 'flex', cursor: 'default', alignItems: 'center', justifyContent: 'center', padding: '0.25rem', ...style }}
    {...props}
  >
    <ChevronDown style={{ height: '1rem', width: '1rem' }} />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', style, ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(className)}
      style={{
        position: 'relative',
        zIndex: 50,
        maxHeight: '24rem',
        minWidth: '8rem',
        overflow: 'hidden',
        borderRadius: 'var(--theme-radius-base)',
        border: '1px solid var(--color-border)',
        background: 'var(--theme-background)',
        color: 'var(--theme-text)',
        boxShadow: 'var(--theme-shadow-md)',
        ...style
      }}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        style={{ padding: '0.25rem' }}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, style, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn(className)}
    style={{ padding: '0.375rem 0.5rem 0.375rem 2rem', fontSize: 'var(--theme-font-size-base)', fontWeight: 600, ...style }}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, style, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(className)}
    style={{
      position: 'relative',
      display: 'flex',
      width: '100%',
      cursor: 'default',
      userSelect: 'none',
      alignItems: 'center',
      borderRadius: 'var(--theme-radius-small)',
      padding: '0.375rem 0.5rem 0.375rem 2rem',
      fontSize: 'var(--theme-font-size-base)',
      outline: 'none',
      ...style
    }}
    {...props}
  >
    <span style={{ position: 'absolute', left: '0.5rem', display: 'flex', height: '1.25rem', width: '1.25rem', alignItems: 'center', justifyContent: 'center' }}>
      <SelectPrimitive.ItemIndicator>
        <Check style={{ height: '1rem', width: '1rem' }} />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, style, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn(className)}
    style={{ margin: '0.25rem 0', height: '1px', background: 'var(--color-border)', ...style }}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}; 