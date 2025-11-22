/**
 * Animation Manager
 * Utility functions for managing block animations
 * 
 * Created: 2025-11-16
 */

import type { AnimationConfig } from '../types/blocks'

/**
 * Get animation CSS classes from animation config
 */
export function getAnimationClasses(
  animation?: AnimationConfig,
  globalEnabled: boolean = true
): string {
  if (!animation || !globalEnabled || animation.type === 'none') {
    return ''
  }

  // Check for prefers-reduced-motion
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return ''
  }

  const classes = [`block-animation-${animation.type}`]
  
  if (animation.delay) {
    classes.push(`block-animation-delay-${animation.delay}`)
  }
  
  if (animation.duration) {
    classes.push(`block-animation-duration-${animation.duration}`)
  }

  return classes.join(' ')
}

/**
 * Get responsive CSS classes
 */
export function getResponsiveClasses(responsive?: { hideOnMobile?: boolean; hideOnDesktop?: boolean }): string {
  if (!responsive) return ''
  
  const classes: string[] = []
  
  if (responsive.hideOnMobile) {
    classes.push('block-hide-mobile')
  }
  
  if (responsive.hideOnDesktop) {
    classes.push('block-hide-desktop')
  }
  
  return classes.join(' ')
}

/**
 * Get spacing styles
 */
export function getSpacingStyles(spacing?: { top?: string | number; bottom?: string | number; left?: string | number; right?: string | number }): React.CSSProperties {
  if (!spacing) return {}
  
  return {
    marginTop: spacing.top,
    marginBottom: spacing.bottom,
    marginLeft: spacing.left,
    marginRight: spacing.right,
  }
}

