import * as React from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { cn } from '@/lib/utils';
import { buttonVariants } from './button';

const AlertDialog = AlertDialogPrimitive.Root;

const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

const AlertDialogPortal = AlertDialogPrimitive.Portal;

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 50,
  background: 'rgba(0,0,0,0.8)',
};

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, style, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(className)}
    style={{ ...overlayStyle, ...style }}
    {...props}
    ref={ref}
  />
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

const contentStyle: React.CSSProperties = {
  position: 'fixed',
  left: '50%',
  top: '50%',
  zIndex: 50,
  display: 'grid',
  width: '100%',
  maxWidth: '32rem',
  transform: 'translate(-50%, -50%)',
  gap: '1rem',
  border: '1px solid var(--color-border, #a78bfa)',
  background: 'var(--color-background)',
  padding: '1.5rem',
  boxShadow: 'var(--theme-shadow-lg)',
  borderRadius: 'var(--radius-large)',
  transition: 'all 0.2s',
};

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, style, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(className)}
      style={{ ...contentStyle, ...style }}
      {...props}
    />
  </AlertDialogPortal>
));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

const AlertDialogHeader = ({ className, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(className)}
    style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'center', ...style }}
    {...props}
  />
);
AlertDialogHeader.displayName = 'AlertDialogHeader';

const AlertDialogFooter = ({ className, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(className)}
    style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: '0.5rem', ...style }}
    {...props}
  />
);
AlertDialogFooter.displayName = 'AlertDialogFooter';

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, style, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn(className)}
    style={{ fontSize: '1.125rem', fontWeight: 600, ...style }}
    {...props}
  />
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, style, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn(className)}
    style={{ fontSize: '0.875rem', color: 'var(--color-text-muted, #94a3b8)', ...style }}
    {...props}
  />
));
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(className)}
    style={buttonVariants ? buttonVariants().style : {}}
    {...props}
  />
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(className)}
    style={buttonVariants ? buttonVariants({ variant: 'outline' }).style : { marginTop: '0.5rem' }}
    {...props}
  />
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}; 