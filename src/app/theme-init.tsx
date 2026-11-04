'use client'

import { useEffect } from 'react'
import { applyThemeDesign, type ThemeType, type DesignType } from '@/features/shared/utils/themeDesign'

/**
 * Theme Initialization Component
 * Loads defaults from public config (no auth) and applies theme.
 * Inline script in head handles FOUC; this syncs with config.json.
 */
export function ThemeInit() {
  useEffect(() => {
    async function loadThemeConfig() {
      let defaultTheme: ThemeType = 'dark'
      let defaultDesign: DesignType = 'minimal'

      try {
        const response = await fetch('/data/config/config.json', { cache: 'no-store' })
        if (response.ok) {
          const config = await response.json()
          defaultTheme = (config.appearance?.defaultTheme ||
            config.features?.theme?.defaultTheme ||
            'dark') as ThemeType
          defaultDesign = (config.appearance?.defaultDesign ||
            config.features?.theme?.defaultDesign ||
            'minimal') as DesignType
        }
      } catch {
        /* use hardcoded defaults */
      }

      const savedTheme = (localStorage.getItem('portfolio-theme') || defaultTheme) as ThemeType
      const savedDesign = (localStorage.getItem('portfolio-design') || defaultDesign) as DesignType
      applyThemeDesign(savedTheme, savedDesign)
    }

    loadThemeConfig()
  }, [])

  return null
}
