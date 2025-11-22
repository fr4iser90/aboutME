'use client'

import { useEffect } from 'react'

interface DynamicBackgroundProps {
  backgroundImage?: string
}

export default function DynamicBackground({ backgroundImage }: DynamicBackgroundProps) {
  useEffect(() => {
    const updateBackground = () => {
      // Only set --dynamic-bg-image if no design is active
      // Designs have their own backgrounds via --design-bg-image
      const currentDesign = document.documentElement.getAttribute('data-design')
      
      if (currentDesign) {
        // Design is active - don't override with DynamicBackground
        // Design CSS will handle the background via --design-bg-image
        // Remove any inline style override
        document.documentElement.style.removeProperty('--dynamic-bg-image')
        return
      }
      
      // No design active - use theme background
      if (backgroundImage) {
        document.documentElement.style.setProperty('--dynamic-bg-image', `url('${backgroundImage}')`)
      } else {
        document.documentElement.style.setProperty('--dynamic-bg-image', "url('/assets/galaxy.png')")
      }
    }

    // Initial update
    updateBackground()

    // Watch for design changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-design') {
          updateBackground()
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-design']
    })

    return () => {
      observer.disconnect()
    }
  }, [backgroundImage])

  return null
}

