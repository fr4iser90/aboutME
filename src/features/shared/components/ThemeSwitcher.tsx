'use client'

import { useState, useEffect } from 'react'
import { applyThemeDesign, getCurrentTheme, getCurrentDesign, type ThemeType, type DesignType } from '../utils/themeDesign'

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeType>('dark')
  const [design, setDesign] = useState<DesignType>('glassmorphism')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Load saved theme and design preferences
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

  if (!mounted) {
    return null
  }

  return (
    <div className="fixed top-4 right-4" style={{ zIndex: 'var(--z-floating)' }}>
      <div className="glass rounded-xl p-2">
        <div className="flex items-center gap-2">
          {/* Light Theme */}
          <button
            onClick={() => handleThemeChange('light')}
            className={`p-2 rounded-lg transition-all ${
              theme === 'light'
                ? 'bg-yellow-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            title="Light Theme"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
            </svg>
          </button>

          {/* Dark Theme */}
          <button
            onClick={() => handleThemeChange('dark')}
            className={`p-2 rounded-lg transition-all ${
              theme === 'dark'
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            title="Dark Theme"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
