'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Feature {
  id: string
  name: string
  icon: string
  enabled: boolean
  isStandard: boolean
  hasConfig?: boolean
}

export default function FeatureToggleCard() {
  const router = useRouter()
  const [features, setFeatures] = useState<Feature[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await fetch('/api/setup/config')
        if (response.ok) {
          const data = await response.json()
          const config = data.config || data
          
          // Map features from config
          const featureList: Feature[] = [
            { id: 'projects', name: 'Projects', icon: '💼', enabled: config.features?.projects?.enabled !== false, isStandard: true },
            { id: 'skills', name: 'Skills', icon: '🎯', enabled: config.features?.skills?.enabled !== false, isStandard: true },
            { id: 'aboutMe', name: 'About Me', icon: '👤', enabled: config.features?.aboutMe?.enabled !== false, isStandard: true },
            { id: 'blog', name: 'Blog', icon: '📝', enabled: config.features?.blog?.enabled === true, isStandard: false },
            { id: 'contact', name: 'Contact', icon: '📧', enabled: config.features?.contact?.enabled === true, isStandard: false },
            { id: 'auth', name: 'Auth', icon: '🔐', enabled: config.features?.auth?.enabled === true, isStandard: false, hasConfig: true },
            { id: 'games', name: 'Games', icon: '🎮', enabled: config.features?.terminal?.enabled === true, isStandard: false, hasConfig: true }
          ]
          
          setFeatures(featureList)
        }
        setLoading(false)
      } catch (err) {
        console.error('Error fetching features:', err)
        setLoading(false)
      }
    }

    fetchFeatures()
  }, [])

  const standardFeatures = features.filter(f => f.isStandard)
  const optionalFeatures = features.filter(f => !f.isStandard)

  const handleClick = () => {
    router.push('/admin/features')
  }

  return (
    <div className="glass-card feature-toggle-card" onClick={handleClick}>
      {/* Header */}
      <div className="feature-toggle-card__header">
        <div className="feature-toggle-card__header-content">
          <span className="feature-toggle-card__header-icon">⚙️</span>
          <h3 className="feature-toggle-card__header-title">Features Overview</h3>
        </div>
        <span className="feature-toggle-card__header-action">Click to manage →</span>
      </div>

      {loading ? (
        <p className="feature-toggle-card__loading">Loading features...</p>
      ) : (
        <>
          {/* Standard Features */}
          <div className="feature-toggle-card__section">
            <h4 className="feature-toggle-card__section-title">
              Standard Features (Default ON)
            </h4>
            <div className="feature-toggle-card__grid">
              {standardFeatures.map((feature) => (
                <div 
                  key={feature.id}
                  className={`feature-toggle-card__item ${feature.enabled ? 'feature-toggle-card__item--enabled' : 'feature-toggle-card__item--disabled'}`}
                >
                  <span className="feature-toggle-card__item-icon">{feature.icon}</span>
                  <span className="feature-toggle-card__item-name">{feature.name}</span>
                  <span className="feature-toggle-card__item-status">
                    {feature.enabled ? '●' : '○'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Optional Features */}
          <div className="feature-toggle-card__section">
            <h4 className="feature-toggle-card__section-title">
              Optional Features (Default OFF)
            </h4>
            <div className="feature-toggle-card__grid">
              {optionalFeatures.map((feature) => (
                <div 
                  key={feature.id}
                  className={`feature-toggle-card__item ${feature.enabled ? 'feature-toggle-card__item--enabled' : 'feature-toggle-card__item--disabled'}`}
                >
                  <span className="feature-toggle-card__item-icon">{feature.icon}</span>
                  <span className="feature-toggle-card__item-name">{feature.name}</span>
                  {feature.hasConfig && (
                    <span className="feature-toggle-card__item-config">⚙️</span>
                  )}
                  <span className="feature-toggle-card__item-status">
                    {feature.enabled ? '●' : '○'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
