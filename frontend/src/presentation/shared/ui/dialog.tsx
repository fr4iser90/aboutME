import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, style, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(className)}
    style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.8)', ...style }}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, style, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(className)}
      style={{
        position: 'fixed',
        left: '50%',
        top: '50%',
        zIndex: 50,
        display: 'grid',
        width: '100%',
        maxWidth: '32rem',
        transform: 'translate(-50%, -50%)',
        gap: '1rem',
        border: '1px solid var(--color-border)',
        background: 'var(--theme-background)',
        padding: '1.5rem',
        boxShadow: 'var(--theme-shadow-lg)',
        borderRadius: 'var(--theme-radius-large)',
        transition: 'all 0.2s',
        ...style
      }}
      {...props}
    >
      {children}
      <DialogPrimitive.Close style={{ position: 'absolute', right: '1rem', top: '1rem', borderRadius: 'var(--theme-radius-small)', opacity: 0.7, transition: 'opacity 0.2s' }}>
        <X style={{ height: '1rem', width: '1rem' }} />
        <span style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(className)}
    style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', textAlign: 'center', ...style }}
    {...props}
  />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({ className, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(className)}
    style={{ display: 'flex', flexDirection: 'column-reverse', gap: '0.5rem', justifyContent: 'flex-end', ...style }}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, style, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(className)}
    style={{ fontSize: '1.125rem', fontWeight: 600, lineHeight: 1, letterSpacing: '-0.025em', ...style }}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, style, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(className)}
    style={{ fontSize: '0.875rem', color: 'var(--theme-text-muted)', ...style }}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}; 