'use client'

import { useState, useEffect } from 'react'

interface BackgroundConfig {
  useDefault: boolean
  defaultImage?: string
  customImage?: string
}

interface BackgroundEditorProps {
  onBackgroundChange?: (config: BackgroundConfig) => void
}

export default function BackgroundEditor({ onBackgroundChange }: BackgroundEditorProps) {
  const [config, setConfig] = useState<BackgroundConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [availableBackgrounds, setAvailableBackgrounds] = useState<string[]>([])
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadConfig()
    loadAvailableBackgrounds()
  }, [])

  const loadConfig = async () => {
    try {
      const response = await fetch('/data/config/config.json')
      const data = await response.json()
      const bgConfig = data.portfolio?.features?.background || data.features?.background || {
        useDefault: true,
        defaultImage: '/assets/galaxy.png'
      }
      setConfig(bgConfig)
    } catch (error) {
      console.error('Error loading config:', error)
      setConfig({ useDefault: true, defaultImage: '/assets/galaxy.png' })
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableBackgrounds = async () => {
    try {
      const response = await fetch('/api/upload/admin?category=background')
      const data = await response.json()
      if (data.success && data.files) {
        setAvailableBackgrounds(data.files.map((f: any) => f.url))
      }
    } catch (error) {
      console.error('Error loading backgrounds:', error)
    }
  }

  const saveConfig = async (newConfig: BackgroundConfig) => {
    setSaving(true)
    setMessage(null)

    try {
      const saveResponse = await fetch('/api/setup/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolio: {
            features: {
              background: newConfig
            }
          }
        })
      })

      if (saveResponse.ok) {
        setConfig(newConfig)
        setMessage({ type: 'success', text: 'Background updated successfully!' })
        setTimeout(() => setMessage(null), 3000)
        
        // Notify parent component
        if (onBackgroundChange) {
          onBackgroundChange(newConfig)
        }
      } else {
        throw new Error('Failed to save config')
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save background settings' })
      setTimeout(() => setMessage(null), 5000)
    } finally {
      setSaving(false)
    }
  }

  const handleUseDefault = () => {
    saveConfig({
      useDefault: true,
      defaultImage: '/assets/galaxy.png',
      customImage: config?.customImage
    })
  }

  const handleUseCustom = (imageUrl: string) => {
    saveConfig({
      useDefault: false,
      defaultImage: config?.defaultImage || '/assets/galaxy.png',
      customImage: imageUrl
    })
  }

  if (loading) {
    return (
      <div className="background-editor">
        <div className="background-editor__loading">Loading...</div>
      </div>
    )
  }

  return (
    <div className="background-editor">
      {message && (
        <div className={`background-editor__message background-editor__message--${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="background-editor__options">
        {/* Default Option */}
        <div className="background-editor__option">
          <div className="background-editor__preview">
            <img 
              src="/assets/galaxy.png" 
              alt="Default Background" 
              className="background-editor__preview-image"
            />
            <div className={`background-editor__badge ${config?.useDefault ? 'background-editor__badge--active' : ''}`}>
              {config?.useDefault ? 'Active' : 'Default'}
            </div>
          </div>
          <div className="background-editor__info">
            <h4 className="background-editor__option-title">Default Background</h4>
            <p className="background-editor__option-desc">Use the default galaxy background</p>
            <button
              onClick={handleUseDefault}
              disabled={config?.useDefault || saving}
              className={`background-editor__button ${config?.useDefault ? 'background-editor__button--active' : ''}`}
            >
              {config?.useDefault ? 'Currently Active' : 'Use Default'}
            </button>
          </div>
        </div>

        {/* Custom Options */}
        {availableBackgrounds.length > 0 && (
          <div className="background-editor__custom">
            <h4 className="background-editor__custom-title">Custom Backgrounds</h4>
            <div className="background-editor__custom-grid">
              {availableBackgrounds.map((url, index) => (
                <div key={index} className="background-editor__option">
                  <div className="background-editor__preview">
                    <img 
                      src={url} 
                      alt={`Custom Background ${index + 1}`}
                      className="background-editor__preview-image"
                    />
                    {!config?.useDefault && config?.customImage === url && (
                      <div className="background-editor__badge background-editor__badge--active">
                        Active
                      </div>
                    )}
                  </div>
                  <div className="background-editor__info">
                    <h4 className="background-editor__option-title">Custom {index + 1}</h4>
                    <button
                      onClick={() => handleUseCustom(url)}
                      disabled={(!config?.useDefault && config?.customImage === url) || saving}
                      className={`background-editor__button ${!config?.useDefault && config?.customImage === url ? 'background-editor__button--active' : ''}`}
                    >
                      {!config?.useDefault && config?.customImage === url ? 'Currently Active' : 'Use This'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {availableBackgrounds.length === 0 && (
          <div className="background-editor__empty">
            <p>No custom backgrounds uploaded yet.</p>
            <p>Upload a background image in the Media Library to use it here.</p>
          </div>
        )}
      </div>
    </div>
  )
}

