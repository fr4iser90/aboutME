'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Feature {
  id: string
  name: string
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

          const featureList: Feature[] = [
            { id: 'projects', name: 'Projects', enabled: config.features?.projects?.enabled !== false, isStandard: true },
            { id: 'skills', name: 'Skills', enabled: config.features?.skills?.enabled !== false, isStandard: true },
            { id: 'aboutMe', name: 'About Me', enabled: config.features?.aboutMe?.enabled !== false, isStandard: true },
            { id: 'blog', name: 'Blog', enabled: config.features?.blog?.enabled === true, isStandard: false },
            { id: 'contact', name: 'Contact', enabled: config.features?.contact?.enabled === true, isStandard: false },
            { id: 'terminal', name: 'Terminal', enabled: config.features?.terminal?.enabled === true, isStandard: false },
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

  if (loading) {
    return (
      <div className="feature-toggle-card glass-card">
        <p className="text-gray-400">Loading features…</p>
      </div>
    )
  }

  return (
    <div className="feature-toggle-card glass-card">
      <div className="feature-toggle-card__header">
        <h3 className="feature-toggle-card__title">Features</h3>
        <button
          type="button"
          className="feature-toggle-card__manage"
          onClick={() => router.push('/admin/features')}
        >
          Manage
        </button>
      </div>
      <ul className="feature-toggle-card__list">
        {features.map((feature) => (
          <li key={feature.id} className="feature-toggle-card__item">
            <span className="feature-toggle-card__item-name">{feature.name}</span>
            <span
              className={`feature-toggle-card__item-status ${
                feature.enabled
                  ? 'feature-toggle-card__item-status--on'
                  : 'feature-toggle-card__item-status--off'
              }`}
            >
              {feature.enabled ? 'On' : 'Off'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
