'use client'

import { useState, useEffect } from 'react'
import { applyThemeDesign, getCurrentTheme, getCurrentDesign, type ThemeType, type DesignType } from '../utils/themeDesign'

interface DesignSwitcherProps {
  currentTheme?: ThemeType
  onDesignChange?: (design: DesignType) => void
  availableDesigns?: DesignType[]
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

export default function DesignSwitcher({ currentTheme, onDesignChange, availableDesigns }: DesignSwitcherProps) {
  const [design, setDesign] = useState<DesignType>('glassmorphism')
  const [designs, setDesigns] = useState<DesignInfo[]>([])
  const [mounted, setMounted] = useState(false)

  // Load designs from API
  useEffect(() => {
    async function loadDesigns() {
      try {
        const response = await fetch('/api/admin/config/theme')
        if (response.ok) {
          const data = await response.json()
          const configDesigns = data.config?.designs || {}
          const publicSwitcherDesigns = data.config?.publicSwitcher?.availableDesigns || []
          
          // Use availableDesigns prop, or publicSwitcher designs, or all enabled designs
          const designIds = availableDesigns || publicSwitcherDesigns || Object.keys(configDesigns).filter((id: string) => configDesigns[id]?.enabled !== false)
          
          const loadedDesigns: DesignInfo[] = designIds.map((id: string) => ({
            id,
            name: configDesigns[id]?.name || id,
            icon: defaultDesignIcons[id] || '🎨'
          }))
          
          setDesigns(loadedDesigns)
        }
      } catch (error) {
        console.warn('Could not load designs from API, using defaults', error)
        // Fallback to default designs
        setDesigns([
          { id: 'glassmorphism', name: 'Glassmorphism', icon: '✨' },
          { id: 'modern-glass', name: 'Modern Glass', icon: '💎' },
          { id: 'minimal-clean', name: 'Minimal Clean', icon: '▫️' },
          { id: 'cyberpunk', name: 'Cyberpunk', icon: '🌃' }
        ])
      }
    }
    loadDesigns()
  }, [availableDesigns])

  useEffect(() => {
    setMounted(true)
    
    // Load saved design preference
    const savedDesign = localStorage.getItem('portfolio-design') as DesignType | null
    const currentDesign = savedDesign || getCurrentDesign() || 'glassmorphism'
    
    setDesign(currentDesign)
  }, [])

  const handleDesignChange = (newDesign: DesignType) => {
    setDesign(newDesign)
    const theme = currentTheme || getCurrentTheme() || 'dark'
    applyThemeDesign(theme, newDesign)
    localStorage.setItem('portfolio-design', newDesign)
    onDesignChange?.(newDesign)
  }

  if (!mounted || designs.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4" style={{ zIndex: 'var(--z-floating)' }}>
      <div className="glass rounded-xl p-2">
        <div className="flex items-center gap-2">
          {designs.map((d) => (
            <button
              key={d.id}
              onClick={() => handleDesignChange(d.id)}
              className={`p-2 rounded-lg transition-all ${
                design === d.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
              title={d.name}
            >
              <span className="text-lg">{d.icon}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

