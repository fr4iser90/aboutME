'use client'

import { useState } from 'react'
import ColorPicker from '../ThemeEditor/ColorPicker'
import '@/features/admin/styles/creator.css'

interface ThemeCreatorProps {
  onThemeCreated?: () => void
}

export default function ThemeCreator({ onThemeCreated }: ThemeCreatorProps) {
  const [themeName, setThemeName] = useState('')
  const [themeId, setThemeId] = useState('')
  const [colors, setColors] = useState({
    bgPrimary: '#050911',
    bgSecondary: '#0a0a0f',
    bgTertiary: '#1a1a2e',
    bgQuaternary: '#16213e',
    textPrimary: '#ffffff',
    textSecondary: '#e2e8f0',
    textMuted: '#94a3b8',
    textSubtle: '#64748b',
    neonBlue: '#00d4ff',
    neonPurple: '#8b5cf6',
    neonCyan: '#06b6d4',
    neonPink: '#ec4899',
    neonGreen: '#10b981'
  })
  const [backgroundImage, setBackgroundImage] = useState("url('/assets/galaxy.png')")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Auto-generate theme ID from name
  const handleNameChange = (name: string) => {
    setThemeName(name)
    if (!themeId || themeId === generateIdFromName(themeName)) {
      setThemeId(generateIdFromName(name))
    }
  }

  const generateIdFromName = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleColorChange = (colorKey: string, value: string) => {
    setColors(prev => ({
      ...prev,
      [colorKey]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      // Validate theme ID
      if (!themeId || !/^[a-z0-9-]+$/.test(themeId)) {
        throw new Error('Theme ID must be lowercase letters, numbers, and hyphens only')
      }

      if (!themeName.trim()) {
        throw new Error('Theme name is required')
      }

      const response = await fetch('/api/admin/config/themes/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: themeId,
          name: themeName,
          colors,
          backgroundImage
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create theme')
      }

      setSuccess(`Theme "${themeName}" created successfully!`)
      setThemeName('')
      setThemeId('')
      setColors({
        bgPrimary: '#050911',
        bgSecondary: '#0a0a0f',
        bgTertiary: '#1a1a2e',
        bgQuaternary: '#16213e',
        textPrimary: '#ffffff',
        textSecondary: '#e2e8f0',
        textMuted: '#94a3b8',
        textSubtle: '#64748b',
        neonBlue: '#00d4ff',
        neonPurple: '#8b5cf6',
        neonCyan: '#06b6d4',
        neonPink: '#ec4899',
        neonGreen: '#10b981'
      })
      setBackgroundImage("url('/assets/galaxy.png')")
      
      if (onThemeCreated) {
        onThemeCreated()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create theme')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="creator">
      <div className="creator__header">
        <h2 className="creator__title">Create New Theme</h2>
        <p className="creator__description">
          Create a custom theme with your own color palette and settings.
        </p>
      </div>

      {error && (
        <div className="creator__error">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="creator__success">
          <p>{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="creator__form">
        {/* Theme Name */}
        <div className="creator__field">
          <label className="creator__label">
            Theme Name *
            <input
              type="text"
              value={themeName}
              onChange={(e) => handleNameChange(e.target.value)}
              className="creator__input"
              placeholder="e.g., Midnight Blue"
              required
            />
          </label>
        </div>

        {/* Theme ID */}
        <div className="creator__field">
          <label className="creator__label">
            Theme ID *
            <input
              type="text"
              value={themeId}
              onChange={(e) => setThemeId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              className="creator__input"
              placeholder="e.g., midnight-blue"
              pattern="[a-z0-9-]+"
              required
            />
            <small className="creator__help">
              Lowercase letters, numbers, and hyphens only. Used as data-theme value.
            </small>
          </label>
        </div>

        {/* Background Colors */}
        <div className="creator__section">
          <h3 className="creator__section-title">Background Colors</h3>
          <div className="creator__color-grid">
            <div className="creator__color-field">
              <label className="creator__label">Primary Background</label>
              <ColorPicker
                value={colors.bgPrimary}
                onChange={(value) => handleColorChange('bgPrimary', value)}
              />
            </div>
            <div className="creator__color-field">
              <label className="creator__label">Secondary Background</label>
              <ColorPicker
                value={colors.bgSecondary}
                onChange={(value) => handleColorChange('bgSecondary', value)}
              />
            </div>
            <div className="creator__color-field">
              <label className="creator__label">Tertiary Background</label>
              <ColorPicker
                value={colors.bgTertiary}
                onChange={(value) => handleColorChange('bgTertiary', value)}
              />
            </div>
            <div className="creator__color-field">
              <label className="creator__label">Quaternary Background</label>
              <ColorPicker
                value={colors.bgQuaternary}
                onChange={(value) => handleColorChange('bgQuaternary', value)}
              />
            </div>
          </div>
        </div>

        {/* Text Colors */}
        <div className="creator__section">
          <h3 className="creator__section-title">Text Colors</h3>
          <div className="creator__color-grid">
            <div className="creator__color-field">
              <label className="creator__label">Primary Text</label>
              <ColorPicker
                value={colors.textPrimary}
                onChange={(value) => handleColorChange('textPrimary', value)}
              />
            </div>
            <div className="creator__color-field">
              <label className="creator__label">Secondary Text</label>
              <ColorPicker
                value={colors.textSecondary}
                onChange={(value) => handleColorChange('textSecondary', value)}
              />
            </div>
            <div className="creator__color-field">
              <label className="creator__label">Muted Text</label>
              <ColorPicker
                value={colors.textMuted}
                onChange={(value) => handleColorChange('textMuted', value)}
              />
            </div>
            <div className="creator__color-field">
              <label className="creator__label">Subtle Text</label>
              <ColorPicker
                value={colors.textSubtle}
                onChange={(value) => handleColorChange('textSubtle', value)}
              />
            </div>
          </div>
        </div>

        {/* Neon Colors */}
        <div className="creator__section">
          <h3 className="creator__section-title">Accent Colors (Neon)</h3>
          <div className="creator__color-grid">
            <div className="creator__color-field">
              <label className="creator__label">Neon Blue</label>
              <ColorPicker
                value={colors.neonBlue}
                onChange={(value) => handleColorChange('neonBlue', value)}
              />
            </div>
            <div className="creator__color-field">
              <label className="creator__label">Neon Purple</label>
              <ColorPicker
                value={colors.neonPurple}
                onChange={(value) => handleColorChange('neonPurple', value)}
              />
            </div>
            <div className="creator__color-field">
              <label className="creator__label">Neon Cyan</label>
              <ColorPicker
                value={colors.neonCyan}
                onChange={(value) => handleColorChange('neonCyan', value)}
              />
            </div>
            <div className="creator__color-field">
              <label className="creator__label">Neon Pink</label>
              <ColorPicker
                value={colors.neonPink}
                onChange={(value) => handleColorChange('neonPink', value)}
              />
            </div>
            <div className="creator__color-field">
              <label className="creator__label">Neon Green</label>
              <ColorPicker
                value={colors.neonGreen}
                onChange={(value) => handleColorChange('neonGreen', value)}
              />
            </div>
          </div>
        </div>

        {/* Background Image */}
        <div className="creator__field">
          <label className="creator__label">
            Background Image
            <input
              type="text"
              value={backgroundImage}
              onChange={(e) => setBackgroundImage(e.target.value)}
              className="creator__input"
              placeholder="url('/assets/galaxy.png')"
            />
            <small className="creator__help">
              CSS background-image value (e.g., url('/assets/galaxy.png'))
            </small>
          </label>
        </div>

        {/* Submit Button */}
        <div className="creator__actions">
          <button
            type="submit"
            disabled={loading || !themeName || !themeId}
            className="creator__btn creator__btn--primary"
          >
            {loading ? 'Creating...' : 'Create Theme'}
          </button>
        </div>
      </form>
    </div>
  )
}

