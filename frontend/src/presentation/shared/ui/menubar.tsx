import * as React from 'react';
import * as MenubarPrimitive from '@radix-ui/react-menubar';
import { Check, ChevronRight, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

const MenubarMenu = MenubarPrimitive.Menu;

const MenubarGroup = MenubarPrimitive.Group;

const MenubarPortal = MenubarPrimitive.Portal;

const MenubarSub = MenubarPrimitive.Sub;

const MenubarRadioGroup = MenubarPrimitive.RadioGroup;

const menubarRootStyle: React.CSSProperties = {
  display: 'flex',
  height: '2.5rem',
  alignItems: 'center',
  gap: '0.25rem',
  borderRadius: 'var(--theme-radius-base)',
  border: '1px solid var(--color-border, #a78bfa)',
  background: 'var(--theme-background)',
  padding: '0.25rem',
};

const Menubar = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
>(({ className, style, ...props }, ref) => (
  <MenubarPrimitive.Root
    ref={ref}
    className={cn(className)}
    style={{ ...menubarRootStyle, ...style }}
    {...props}
  />
));
Menubar.displayName = MenubarPrimitive.Root.displayName;

const menubarTriggerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  borderRadius: 'var(--theme-radius-small)',
  padding: '0.25rem 0.75rem',
  fontSize: 'var(--theme-font-size-base)',
  fontWeight: 500,
  background: 'transparent',
  color: 'var(--theme-text)',
  cursor: 'pointer',
  transition: 'background 0.2s, color 0.2s',
};

const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
>(({ className, style, ...props }, ref) => (
  <MenubarPrimitive.Trigger
    ref={ref}
    className={cn(className)}
    style={{ ...menubarTriggerStyle, ...style }}
    {...props}
  />
));
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName;

const MenubarSubTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, style, ...props }, ref) => (
  <MenubarPrimitive.SubTrigger
    ref={ref}
    className={cn(className)}
    style={{ ...menubarTriggerStyle, ...(inset ? { paddingLeft: '2rem' } : {}), ...style }}
    {...props}
  >
    {children}
    <ChevronRight style={{ marginLeft: 'auto', height: '1rem', width: '1rem' }} />
  </MenubarPrimitive.SubTrigger>
));
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName;

const MenubarSubContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>
>(({ className, style, ...props }, ref) => (
  <MenubarPrimitive.SubContent
    ref={ref}
    className={cn(className)}
    style={{ minWidth: '8rem', borderRadius: 'var(--theme-radius-base)', background: 'var(--theme-background)', color: 'var(--theme-text)', boxShadow: 'var(--theme-shadow-lg)', padding: '0.25rem', ...style }}
    {...props}
  />
));
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName;

const MenubarContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>
>(
  (
    { className, align = 'start', alignOffset = -4, sideOffset = 8, style, ...props },
    ref
  ) => (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        ref={ref}
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(className)}
        style={{ minWidth: '12rem', borderRadius: 'var(--theme-radius-base)', background: 'var(--theme-background)', color: 'var(--theme-text)', boxShadow: 'var(--theme-shadow-md)', padding: '0.25rem', ...style }}
        {...props}
      />
    </MenubarPrimitive.Portal>
  )
);
MenubarContent.displayName = MenubarPrimitive.Content.displayName;

const MenubarItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, style, ...props }, ref) => (
  <MenubarPrimitive.Item
    ref={ref}
    className={cn(className)}
    style={{ ...menubarTriggerStyle, ...(inset ? { paddingLeft: '2rem' } : {}), ...style }}
    {...props}
  />
));
MenubarItem.displayName = MenubarPrimitive.Item.displayName;

const MenubarCheckboxItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem>
>(({ className, children, checked, style, ...props }, ref) => (
  <MenubarPrimitive.CheckboxItem
    ref={ref}
    className={cn(className)}
    style={{ ...menubarTriggerStyle, ...style }}
    checked={checked}
    {...props}
  >
    <span style={{ position: 'absolute', left: '0.5rem', display: 'flex', height: '1.25rem', width: '1.25rem', alignItems: 'center', justifyContent: 'center' }}>
      <MenubarPrimitive.ItemIndicator>
        <Check style={{ height: '1rem', width: '1rem' }} />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.CheckboxItem>
));
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName;

const MenubarRadioItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem>
>(({ className, children, style, ...props }, ref) => (
  <MenubarPrimitive.RadioItem
    ref={ref}
    className={cn(className)}
    style={{ ...menubarTriggerStyle, ...style }}
    {...props}
  >
    <span style={{ position: 'absolute', left: '0.5rem', display: 'flex', height: '1.25rem', width: '1.25rem', alignItems: 'center', justifyContent: 'center' }}>
      <MenubarPrimitive.ItemIndicator>
        <Circle style={{ height: '0.5rem', width: '0.5rem', fill: 'currentColor' }} />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.RadioItem>
));
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName;

const MenubarLabel = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, style, ...props }, ref) => (
  <MenubarPrimitive.Label
    ref={ref}
    className={cn(className)}
    style={{ fontSize: 'var(--theme-font-size-base)', fontWeight: 600, padding: '0.25rem 0.75rem', ...(inset ? { paddingLeft: '2rem' } : {}), ...style }}
    {...props}
  />
));
MenubarLabel.displayName = MenubarPrimitive.Label.displayName;

const MenubarSeparator = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>
>(({ className, style, ...props }, ref) => (
  <MenubarPrimitive.Separator
    ref={ref}
    className={cn(className)}
    style={{ margin: '0.25rem 0', height: '1px', background: 'var(--color-border)', ...style }}
    {...props}
  />
));
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName;

const MenubarShortcut = ({ className, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(className)}
      style={{ marginLeft: 'auto', fontSize: '0.75rem', letterSpacing: '0.1em', opacity: 0.6, ...style }}
      {...props}
    />
  );
};
MenubarShortcut.displayName = 'MenubarShortcut';

export {
  Menubar,
  MenubarMenu,
  MenubarGroup,
  MenubarPortal,
  MenubarSub,
  MenubarRadioGroup,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioItem,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarShortcut,
}; 