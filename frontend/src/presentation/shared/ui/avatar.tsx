import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/lib/utils';

const avatarRootStyle: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  height: '2.5rem',
  width: '2.5rem',
  flexShrink: 0,
  overflow: 'hidden',
  borderRadius: '9999px',
};

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, style, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(className)}
    style={{ ...avatarRootStyle, ...style }}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const avatarImageStyle: React.CSSProperties = {
  aspectRatio: '1 / 1',
  height: '100%',
  width: '100%',
};

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, style, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn(className)}
    style={{ ...avatarImageStyle, ...style }}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const avatarFallbackStyle: React.CSSProperties = {
  display: 'flex',
  height: '100%',
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '9999px',
  background: 'var(--color-muted, #f3f4f6)',
};

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, style, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(className)}
    style={{ ...avatarFallbackStyle, ...style }}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback }; 