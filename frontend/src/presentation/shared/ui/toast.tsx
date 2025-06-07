import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const ToastProvider = ToastPrimitives.Provider;

const toastViewportStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  zIndex: 100,
  display: 'flex',
  flexDirection: 'column-reverse',
  maxHeight: '100vh',
  width: '100%',
  right: 0,
  padding: '1rem',
  gap: '0.5rem',
};

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, style, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(className)}
    style={{ ...toastViewportStyle, ...style }}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastRootStyle: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: 'var(--theme-radius-base)',
  border: '1px solid var(--color-border)',
  background: 'var(--theme-background)',
  color: 'var(--theme-text)',
  boxShadow: 'var(--theme-shadow-lg)',
  padding: '1.5rem 2rem 1.5rem 1.5rem',
  marginBottom: '0.5rem',
  transition: 'all 0.2s',
};

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>
>(({ className, style, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(className)}
      style={{ ...toastRootStyle, ...style }}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const toastActionStyle: React.CSSProperties = {
  display: 'inline-flex',
  height: '2rem',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'var(--theme-radius-base)',
  border: '1px solid var(--color-border)',
  background: 'transparent',
  padding: '0 0.75rem',
  fontSize: '0.875rem',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'background 0.2s, color 0.2s',
};

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, style, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(className)}
    style={{ ...toastActionStyle, ...style }}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const toastCloseStyle: React.CSSProperties = {
  position: 'absolute',
  right: '0.5rem',
  top: '0.5rem',
  borderRadius: 'var(--theme-radius-small)',
  padding: '0.25rem',
  color: 'var(--theme-text-muted)',
  opacity: 0.7,
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  transition: 'opacity 0.2s',
};

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, style, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(className)}
    style={{ ...toastCloseStyle, ...style }}
    toast-close=""
    {...props}
  >
    <X style={{ height: '1rem', width: '1rem' }} />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, style, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn(className)}
    style={{ fontSize: '1rem', fontWeight: 600, ...style }}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, style, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn(className)}
    style={{ fontSize: '0.875rem', opacity: 0.9, ...style }}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}; 