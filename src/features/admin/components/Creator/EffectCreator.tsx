'use client'

import { useState } from 'react'
import '@/features/admin/styles/creator.css'

interface EffectCreatorProps {
  onEffectCreated?: () => void
}

export default function EffectCreator({ onEffectCreated }: EffectCreatorProps) {
  const [effectName, setEffectName] = useState('')
  const [effectId, setEffectId] = useState('')
  const [description, setDescription] = useState('')
  const [variables, setVariables] = useState({
    glassBg: 'rgba(255, 255, 255, 0.03)',
    glassBgHover: 'rgba(255, 255, 255, 0.06)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    glassBorderHover: 'rgba(0, 212, 255, 0.2)',
    glassShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    glassShadowHover: '0 20px 40px rgba(0, 0, 0, 0.6)',
    blur: '24px',
    borderRadius: '24px',
    backdropFilter: 'blur(24px)',
    transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)'
  })
  const [lightOverrides, setLightOverrides] = useState({
    enabled: false,
    glassBg: 'rgba(255, 255, 255, 0.4)',
    glassBgHover: 'rgba(255, 255, 255, 0.6)',
    glassBorder: 'rgba(255, 255, 255, 0.5)',
    glassBorderHover: 'rgba(59, 130, 246, 0.3)',
    glassShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    glassShadowHover: '0 20px 40px rgba(0, 0, 0, 0.15)'
  })
  const [mobileOptimizations, setMobileOptimizations] = useState({
    enabled: false,
    blur: '8px',
    backdropFilter: 'blur(8px)',
    transition: 'all 0.3s ease'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Auto-generate effect ID from name
  const handleNameChange = (name: string) => {
    setEffectName(name)
    if (!effectId || effectId === generateIdFromName(effectName)) {
      setEffectId(generateIdFromName(name))
    }
  }

  const generateIdFromName = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleVariableChange = (key: string, value: string) => {
    setVariables(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleLightOverrideChange = (key: string, value: string) => {
    setLightOverrides(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleMobileOptimizationChange = (key: string, value: string) => {
    setMobileOptimizations(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      // Validate effect ID
      if (!effectId || !/^[a-z0-9-]+$/.test(effectId)) {
        throw new Error('Effect ID must be lowercase letters, numbers, and hyphens only')
      }

      if (!effectName.trim()) {
        throw new Error('Effect name is required')
      }

      const config: any = {
        id: effectId,
        name: effectName,
        description: description || undefined,
        variables
      }

      if (lightOverrides.enabled) {
        config.lightThemeOverrides = {
          glassBg: lightOverrides.glassBg,
          glassBgHover: lightOverrides.glassBgHover,
          glassBorder: lightOverrides.glassBorder,
          glassBorderHover: lightOverrides.glassBorderHover,
          glassShadow: lightOverrides.glassShadow,
          glassShadowHover: lightOverrides.glassShadowHover
        }
      }

      if (mobileOptimizations.enabled) {
        config.mobileOptimizations = {
          blur: mobileOptimizations.blur,
          backdropFilter: mobileOptimizations.backdropFilter,
          transition: mobileOptimizations.transition
        }
      }

      const response = await fetch('/api/admin/config/effects/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create effect')
      }

      setSuccess(`Effect "${effectName}" created successfully!`)
      setEffectName('')
      setEffectId('')
      setDescription('')
      setVariables({
        glassBg: 'rgba(255, 255, 255, 0.03)',
        glassBgHover: 'rgba(255, 255, 255, 0.06)',
        glassBorder: 'rgba(255, 255, 255, 0.08)',
        glassBorderHover: 'rgba(0, 212, 255, 0.2)',
        glassShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        glassShadowHover: '0 20px 40px rgba(0, 0, 0, 0.6)',
        blur: '24px',
        borderRadius: '24px',
        backdropFilter: 'blur(24px)',
        transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)'
      })
      setLightOverrides({
        enabled: false,
        glassBg: 'rgba(255, 255, 255, 0.4)',
        glassBgHover: 'rgba(255, 255, 255, 0.6)',
        glassBorder: 'rgba(255, 255, 255, 0.5)',
        glassBorderHover: 'rgba(59, 130, 246, 0.3)',
        glassShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        glassShadowHover: '0 20px 40px rgba(0, 0, 0, 0.15)'
      })
      setMobileOptimizations({
        enabled: false,
        blur: '8px',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.3s ease'
      })
      
      if (onEffectCreated) {
        onEffectCreated()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create effect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="creator">
      <div className="creator__header">
        <h2 className="creator__title">Create New Effect</h2>
        <p className="creator__description">
          Create a custom visual effect with your own CSS variables and styling.
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
        {/* Effect Name */}
        <div className="creator__field">
          <label className="creator__label">
            Effect Name *
            <input
              type="text"
              value={effectName}
              onChange={(e) => handleNameChange(e.target.value)}
              className="creator__input"
              placeholder="e.g., Frosted Glass"
              required
            />
          </label>
        </div>

        {/* Effect ID */}
        <div className="creator__field">
          <label className="creator__label">
            Effect ID *
            <input
              type="text"
              value={effectId}
              onChange={(e) => setEffectId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              className="creator__input"
              placeholder="e.g., frosted-glass"
              pattern="[a-z0-9-]+"
              required
            />
            <small className="creator__help">
              Lowercase letters, numbers, and hyphens only. Used as data-effect value.
            </small>
          </label>
        </div>

        {/* Description */}
        <div className="creator__field">
          <label className="creator__label">
            Description (Optional)
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="creator__input creator__textarea"
              placeholder="Brief description of the effect..."
              rows={3}
            />
          </label>
        </div>

        {/* Effect Variables */}
        <div className="creator__section">
          <h3 className="creator__section-title">Effect Variables</h3>
          <div className="creator__variable-grid">
            <div className="creator__field">
              <label className="creator__label">Glass Background</label>
              <input
                type="text"
                value={variables.glassBg}
                onChange={(e) => handleVariableChange('glassBg', e.target.value)}
                className="creator__input"
                placeholder="rgba(255, 255, 255, 0.03)"
              />
            </div>
            <div className="creator__field">
              <label className="creator__label">Glass Background (Hover)</label>
              <input
                type="text"
                value={variables.glassBgHover}
                onChange={(e) => handleVariableChange('glassBgHover', e.target.value)}
                className="creator__input"
                placeholder="rgba(255, 255, 255, 0.06)"
              />
            </div>
            <div className="creator__field">
              <label className="creator__label">Glass Border</label>
              <input
                type="text"
                value={variables.glassBorder}
                onChange={(e) => handleVariableChange('glassBorder', e.target.value)}
                className="creator__input"
                placeholder="rgba(255, 255, 255, 0.08)"
              />
            </div>
            <div className="creator__field">
              <label className="creator__label">Glass Border (Hover)</label>
              <input
                type="text"
                value={variables.glassBorderHover}
                onChange={(e) => handleVariableChange('glassBorderHover', e.target.value)}
                className="creator__input"
                placeholder="rgba(0, 212, 255, 0.2)"
              />
            </div>
            <div className="creator__field">
              <label className="creator__label">Glass Shadow</label>
              <input
                type="text"
                value={variables.glassShadow}
                onChange={(e) => handleVariableChange('glassShadow', e.target.value)}
                className="creator__input"
                placeholder="0 8px 32px rgba(0, 0, 0, 0.4)"
              />
            </div>
            <div className="creator__field">
              <label className="creator__label">Glass Shadow (Hover)</label>
              <input
                type="text"
                value={variables.glassShadowHover}
                onChange={(e) => handleVariableChange('glassShadowHover', e.target.value)}
                className="creator__input"
                placeholder="0 20px 40px rgba(0, 0, 0, 0.6)"
              />
            </div>
            <div className="creator__field">
              <label className="creator__label">Blur</label>
              <input
                type="text"
                value={variables.blur}
                onChange={(e) => handleVariableChange('blur', e.target.value)}
                className="creator__input"
                placeholder="24px"
              />
            </div>
            <div className="creator__field">
              <label className="creator__label">Border Radius</label>
              <input
                type="text"
                value={variables.borderRadius}
                onChange={(e) => handleVariableChange('borderRadius', e.target.value)}
                className="creator__input"
                placeholder="24px"
              />
            </div>
            <div className="creator__field">
              <label className="creator__label">Backdrop Filter</label>
              <input
                type="text"
                value={variables.backdropFilter}
                onChange={(e) => handleVariableChange('backdropFilter', e.target.value)}
                className="creator__input"
                placeholder="blur(24px)"
              />
            </div>
            <div className="creator__field">
              <label className="creator__label">Transition</label>
              <input
                type="text"
                value={variables.transition}
                onChange={(e) => handleVariableChange('transition', e.target.value)}
                className="creator__input"
                placeholder="all 0.5s cubic-bezier(0.23, 1, 0.32, 1)"
              />
            </div>
          </div>
        </div>

        {/* Light Theme Overrides */}
        <div className="creator__section">
          <div className="creator__field">
            <label className="creator__toggle">
              <input
                type="checkbox"
                checked={lightOverrides.enabled}
                onChange={(e) => setLightOverrides(prev => ({ ...prev, enabled: e.target.checked }))}
              />
              <span>Enable Light Theme Overrides</span>
            </label>
          </div>
          {lightOverrides.enabled && (
            <div className="creator__variable-grid">
              <div className="creator__field">
                <label className="creator__label">Glass BG (Light)</label>
                <input
                  type="text"
                  value={lightOverrides.glassBg}
                  onChange={(e) => handleLightOverrideChange('glassBg', e.target.value)}
                  className="creator__input"
                />
              </div>
              <div className="creator__field">
                <label className="creator__label">Glass BG Hover (Light)</label>
                <input
                  type="text"
                  value={lightOverrides.glassBgHover}
                  onChange={(e) => handleLightOverrideChange('glassBgHover', e.target.value)}
                  className="creator__input"
                />
              </div>
              <div className="creator__field">
                <label className="creator__label">Glass Border (Light)</label>
                <input
                  type="text"
                  value={lightOverrides.glassBorder}
                  onChange={(e) => handleLightOverrideChange('glassBorder', e.target.value)}
                  className="creator__input"
                />
              </div>
              <div className="creator__field">
                <label className="creator__label">Glass Border Hover (Light)</label>
                <input
                  type="text"
                  value={lightOverrides.glassBorderHover}
                  onChange={(e) => handleLightOverrideChange('glassBorderHover', e.target.value)}
                  className="creator__input"
                />
              </div>
              <div className="creator__field">
                <label className="creator__label">Glass Shadow (Light)</label>
                <input
                  type="text"
                  value={lightOverrides.glassShadow}
                  onChange={(e) => handleLightOverrideChange('glassShadow', e.target.value)}
                  className="creator__input"
                />
              </div>
              <div className="creator__field">
                <label className="creator__label">Glass Shadow Hover (Light)</label>
                <input
                  type="text"
                  value={lightOverrides.glassShadowHover}
                  onChange={(e) => handleLightOverrideChange('glassShadowHover', e.target.value)}
                  className="creator__input"
                />
              </div>
            </div>
          )}
        </div>

        {/* Mobile Optimizations */}
        <div className="creator__section">
          <div className="creator__field">
            <label className="creator__toggle">
              <input
                type="checkbox"
                checked={mobileOptimizations.enabled}
                onChange={(e) => setMobileOptimizations(prev => ({ ...prev, enabled: e.target.checked }))}
              />
              <span>Enable Mobile Optimizations</span>
            </label>
          </div>
          {mobileOptimizations.enabled && (
            <div className="creator__variable-grid">
              <div className="creator__field">
                <label className="creator__label">Blur (Mobile)</label>
                <input
                  type="text"
                  value={mobileOptimizations.blur}
                  onChange={(e) => handleMobileOptimizationChange('blur', e.target.value)}
                  className="creator__input"
                />
              </div>
              <div className="creator__field">
                <label className="creator__label">Backdrop Filter (Mobile)</label>
                <input
                  type="text"
                  value={mobileOptimizations.backdropFilter}
                  onChange={(e) => handleMobileOptimizationChange('backdropFilter', e.target.value)}
                  className="creator__input"
                />
              </div>
              <div className="creator__field">
                <label className="creator__label">Transition (Mobile)</label>
                <input
                  type="text"
                  value={mobileOptimizations.transition}
                  onChange={(e) => handleMobileOptimizationChange('transition', e.target.value)}
                  className="creator__input"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="creator__actions">
          <button
            type="submit"
            disabled={loading || !effectName || !effectId}
            className="creator__btn creator__btn--primary"
          >
            {loading ? 'Creating...' : 'Create Effect'}
          </button>
        </div>
      </form>
    </div>
  )
}

