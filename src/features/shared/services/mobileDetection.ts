// Mobile Detection Utility
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  
  return (
    window.innerWidth <= 768 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  )
}

export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore
    navigator.msMaxTouchPoints > 0
  )
}

export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (typeof window === 'undefined') return 'desktop'
  
  const width = window.innerWidth
  
  if (width <= 768) return 'mobile'
  if (width <= 1024) return 'tablet'
  return 'desktop'
}

// Performance optimization flags
export const shouldReduceMotion = (): boolean => {
  if (typeof window === 'undefined') return false
  
  return (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    isMobileDevice()
  )
}

export const shouldReduceBackdropFilter = (): boolean => {
  return isMobileDevice() || getDeviceType() === 'mobile'
}
