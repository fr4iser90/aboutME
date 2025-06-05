import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { Check, ChevronRight, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const DropdownMenuSub = DropdownMenuPrimitive.Sub;

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const dropdownItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  borderRadius: 'var(--radius-small)',
  padding: '0.25rem 0.75rem',
  fontSize: 'var(--font-size-base)',
  background: 'transparent',
  color: 'var(--color-text)',
  cursor: 'pointer',
  transition: 'background 0.2s, color 0.2s',
};

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, style, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(className)}
    style={{ ...dropdownItemStyle, ...(inset ? { paddingLeft: '2rem' } : {}), ...style }}
    {...props}
  >
    {children}
    <ChevronRight style={{ marginLeft: 'auto', height: '1rem', width: '1rem' }} />
  </DropdownMenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, style, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(className)}
    style={{ minWidth: '8rem', borderRadius: 'var(--radius-base)', background: 'var(--color-background)', color: 'var(--color-text)', boxShadow: 'var(--theme-shadow-lg)', padding: '0.25rem', ...style }}
    {...props}
  />
));
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, style, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(className)}
      style={{ minWidth: '8rem', borderRadius: 'var(--radius-base)', background: 'var(--color-background)', color: 'var(--color-text)', boxShadow: 'var(--theme-shadow-md)', padding: '0.25rem', ...style }}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, style, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(className)}
    style={{ ...dropdownItemStyle, ...(inset ? { paddingLeft: '2rem' } : {}), ...style }}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, style, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(className)}
    style={{ ...dropdownItemStyle, ...style }}
    checked={checked}
    {...props}
  >
    <span style={{ position: 'absolute', left: '0.5rem', display: 'flex', height: '1.25rem', width: '1.25rem', alignItems: 'center', justifyContent: 'center' }}>
      <DropdownMenuPrimitive.ItemIndicator>
        <Check style={{ height: '1rem', width: '1rem' }} />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, style, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(className)}
    style={{ ...dropdownItemStyle, ...style }}
    {...props}
  >
    <span style={{ position: 'absolute', left: '0.5rem', display: 'flex', height: '1.25rem', width: '1.25rem', alignItems: 'center', justifyContent: 'center' }}>
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle style={{ height: '0.5rem', width: '0.5rem', fill: 'currentColor' }} />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, style, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(className)}
    style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, padding: '0.25rem 0.75rem', ...(inset ? { paddingLeft: '2rem' } : {}), ...style }}
    {...props}
  />
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, style, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn(className)}
    style={{ margin: '0.25rem 0', height: '1px', background: 'var(--color-border, #a78bfa)', ...style }}
    {...props}
  />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuShortcut = ({ className, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(className)}
      style={{ marginLeft: 'auto', fontSize: '0.75rem', letterSpacing: '0.1em', opacity: 0.6, ...style }}
      {...props}
    />
  );
};
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}; 