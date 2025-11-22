'use client'

import { useState, useEffect } from 'react'
import { applyThemeDesign, getCurrentTheme, getCurrentDesign, type ThemeType, type DesignType } from '../utils/themeDesign'

interface ThemeDesignSwitcherProps {
  availableThemes?: ThemeType[]
  availableDesigns?: DesignType[]
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

interface DesignInfo {
  id: string
  name: string
  icon: string
}

const defaultDesignIcons: Record<string, string> = {
  glassmorphism: '✨',
  'modern-glass': '💎',
  'minimal-clean': '▫️',
  cyberpunk: '🌃',
  flat: '⬜',
  minimal: '▫️',
  clean: '▫️',
  neumorphism: '🔲',
  gradient: '🌈'
}

export default function ThemeDesignSwitcher({ 
  availableThemes,
  availableDesigns,
  position = 'top-right'
}: ThemeDesignSwitcherProps) {
  const [theme, setTheme] = useState<ThemeType>('dark')
  const [design, setDesign] = useState<DesignType>('glassmorphism')
  const [themes, setThemes] = useState<ThemeType[]>(['dark', 'light'])
  const [designs, setDesigns] = useState<DesignInfo[]>([])
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Load config from API
  useEffect(() => {
    async function loadConfig() {
      try {
        const response = await fetch('/api/admin/config/theme')
        if (response.ok) {
          const data = await response.json()
          const config = data.config
          
          // Load themes
          // Priority: 1. availableThemes prop, 2. publicSwitcher.availableThemes (if set), 3. All enabled themes from config
          const configThemes = config?.themes || {}
          const publicSwitcherThemes = config?.publicSwitcher?.availableThemes
          
          let themeIds: string[]
          if (availableThemes && availableThemes.length > 0) {
            // Use prop if provided
            themeIds = availableThemes
          } else if (publicSwitcherThemes && publicSwitcherThemes.length > 0) {
            // Use publicSwitcher config if explicitly set
            themeIds = publicSwitcherThemes
          } else {
            // Use all enabled themes from config (default behavior)
            themeIds = Object.keys(configThemes).filter((id: string) => {
              const theme = configThemes[id]
              return theme && theme.enabled !== false
            })
          }
          setThemes(themeIds as ThemeType[])
          
          // Load designs
          const configDesigns = config?.designs || {}
          const publicSwitcherDesigns = config?.publicSwitcher?.availableDesigns
          
          // Priority: 1. availableDesigns prop, 2. publicSwitcher.availableDesigns (if set), 3. All enabled designs from config
          let designIds: string[]
          if (availableDesigns && availableDesigns.length > 0) {
            // Use prop if provided
            designIds = availableDesigns
          } else if (publicSwitcherDesigns && publicSwitcherDesigns.length > 0) {
            // Use publicSwitcher config if explicitly set
            designIds = publicSwitcherDesigns
          } else {
            // Use all enabled designs from config (default behavior)
            designIds = Object.keys(configDesigns).filter((id: string) => {
              const design = configDesigns[id]
              return design && design.enabled !== false
            })
          }
          
          const loadedDesigns: DesignInfo[] = designIds.map((id: string) => ({
            id,
            name: configDesigns[id]?.name || id,
            icon: defaultDesignIcons[id] || '🎨'
          }))
          
          setDesigns(loadedDesigns)
        }
      } catch (error) {
        console.warn('Could not load config from API, using defaults', error)
        setThemes(availableThemes || ['dark', 'light'])
        setDesigns([
          { id: 'glassmorphism', name: 'Glassmorphism', icon: '✨' },
          { id: 'modern-glass', name: 'Modern Glass', icon: '💎' },
          { id: 'minimal-clean', name: 'Minimal Clean', icon: '▫️' },
          { id: 'cyberpunk', name: 'Cyberpunk', icon: '🌃' }
        ])
      }
    }
    loadConfig()
  }, [availableThemes, availableDesigns])

  useEffect(() => {
    setMounted(true)
    
    // Load saved preferences
    const savedTheme = localStorage.getItem('portfolio-theme') as ThemeType | null
    const savedDesign = localStorage.getItem('portfolio-design') as DesignType | null
    
    const currentTheme = savedTheme || getCurrentTheme() || 'dark'
    const currentDesign = savedDesign || getCurrentDesign() || 'glassmorphism'
    
    setTheme(currentTheme)
    setDesign(currentDesign)
    applyThemeDesign(currentTheme, currentDesign)
  }, [])

  const handleThemeChange = (newTheme: ThemeType) => {
    setTheme(newTheme)
    applyThemeDesign(newTheme, design)
    localStorage.setItem('portfolio-theme', newTheme)
  }
  
  const handleDesignChange = (newDesign: DesignType) => {
    setDesign(newDesign)
    applyThemeDesign(theme, newDesign)
    localStorage.setItem('portfolio-design', newDesign)
  }

  if (!mounted || designs.length === 0) {
    return null
  }

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  }

  return (
    <div className={`fixed ${positionClasses[position]}`} style={{ zIndex: 'var(--z-floating)' }}>
      <div className="glass rounded-xl p-2">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-lg transition-all text-gray-400 hover:text-white hover:bg-gray-700"
            title="Theme & Design Settings"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </button>
        ) : (
          <div className="space-y-2">
            {/* Theme Selection */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-400">Theme:</span>
              {themes.map((t) => (
                <button
                  key={t}
                  onClick={() => handleThemeChange(t)}
                  className={`p-2 rounded-lg transition-all text-sm ${
                    theme === t
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                  title={t === 'dark' ? 'Dark Theme' : 'Light Theme'}
                >
                  {t === 'dark' ? '🌙' : '☀️'}
                </button>
              ))}
            </div>

            {/* Design Selection */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Design:</span>
              {designs.map((designInfo) => {
                const d = designInfo.id as DesignType
                return (
                  <button
                    key={d}
                    onClick={() => handleDesignChange(d)}
                    className={`p-2 rounded-lg transition-all text-sm ${
                      design === d
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                    title={designInfo.name}
                  >
                    {designInfo.icon}
                  </button>
                )
              })}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="w-full p-1 rounded-lg transition-all text-xs text-gray-400 hover:text-white hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

