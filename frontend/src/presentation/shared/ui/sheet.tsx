import * as React from 'react';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 50,
  background: 'rgba(0,0,0,0.8)',
};

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, style, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(className)}
    style={{ ...overlayStyle, ...style }}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const getSheetContentStyle = (side: 'top' | 'bottom' | 'left' | 'right' = 'right'): React.CSSProperties => {
  const baseStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 50,
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    background: 'var(--theme-background)',
    padding: '1.5rem',
    boxShadow: 'var(--theme-shadow-lg)',
    transition: 'all 0.3s ease-in-out',
  };

  switch (side) {
    case 'top':
      return {
        ...baseStyle,
        inset: '0 auto auto 0',
        width: '100%',
        borderBottom: '1px solid var(--color-border)',
      };
    case 'bottom':
      return {
        ...baseStyle,
        inset: 'auto auto 0 0',
        width: '100%',
        borderTop: '1px solid var(--color-border)',
      };
    case 'left':
      return {
        ...baseStyle,
        inset: '0 auto auto 0',
        height: '100%',
        width: '75%',
        maxWidth: '24rem',
        borderRight: '1px solid var(--color-border)',
      };
    case 'right':
      return {
        ...baseStyle,
        inset: '0 0 auto auto',
        height: '100%',
        width: '75%',
        maxWidth: '24rem',
        borderLeft: '1px solid var(--color-border)',
      };
  }
};

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> {
  side?: 'top' | 'bottom' | 'left' | 'right';
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = 'right', className, children, style, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(className)}
      style={{ ...getSheetContentStyle(side), ...style }}
      {...props}
    >
      {children}
      <SheetPrimitive.Close style={{ position: 'absolute', right: '1rem', top: '1rem', borderRadius: 'var(--theme-radius-small)', opacity: 0.7, transition: 'opacity 0.2s' }}>
        <X style={{ height: '1rem', width: '1rem' }} />
        <span style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>Close</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(className)}
    style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'center', ...style }}
    {...props}
  />
);
SheetHeader.displayName = 'SheetHeader';

const SheetFooter = ({
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(className)}
    style={{ display: 'flex', flexDirection: 'column-reverse', gap: '0.5rem', justifyContent: 'flex-end', ...style }}
    {...props}
  />
);
SheetFooter.displayName = 'SheetFooter';

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, style, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn(className)}
    style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--theme-text)', ...style }}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, style, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn(className)}
    style={{ fontSize: '0.875rem', color: 'var(--theme-text-muted)', ...style }}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}; 