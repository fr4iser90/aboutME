'use client'

import { useEffect, useState } from 'react'
import { applyThemeDesign, type ThemeType, type DesignType } from '@/features/shared/utils/themeDesign'

/**
 * Theme Initialization Component
 * Loads theme config from API and applies it
 * The inline script in head handles initial load, this syncs with config
 */
export function ThemeInit() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Load theme config from API to get defaults
    async function loadThemeConfig() {
      try {
        const response = await fetch('/api/admin/config/theme')
        if (response.ok) {
          const data = await response.json()
          const config = data.config
          
          // Get saved preferences or use defaults from config
          const savedTheme = (localStorage.getItem('portfolio-theme') || config.defaultTheme || 'dark') as ThemeType
          const savedDesign = (localStorage.getItem('portfolio-design') || config.defaultDesign || 'glassmorphism') as DesignType
          
          // Apply theme (syncs with inline script)
          applyThemeDesign(savedTheme, savedDesign)
        }
      } catch (error) {
        // Fallback to localStorage or defaults
        const savedTheme = (localStorage.getItem('portfolio-theme') || 'dark') as ThemeType
        const savedDesign = (localStorage.getItem('portfolio-design') || 'glassmorphism') as DesignType
        applyThemeDesign(savedTheme, savedDesign)
      }
    }
    
    loadThemeConfig()
  }, [])

  return null
}

