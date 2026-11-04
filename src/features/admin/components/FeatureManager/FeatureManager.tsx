'use client'

import { useRouter } from 'next/navigation'
import FeatureToggle from './FeatureToggle'

interface Feature {
  id: string
  label: string
  description: string
  enabled: boolean
  hasConfig?: boolean
  dependencies?: string[]
  category: 'content' | 'presentation' | 'design'
}

interface FeatureCategory {
  id: string
  name: string
  description: string
  features: Feature[]
}

interface FeatureManagerProps {
  features: Record<string, boolean>
  onChange: (featureName: string, enabled: boolean) => void
}

export default function FeatureManager({ features, onChange }: FeatureManagerProps) {
  const router = useRouter()

  const categories: FeatureCategory[] = [
    {
      id: 'content',
      name: 'Content',
      description: 'Sections shown on your public portfolio',
      features: [
        {
          id: 'projects',
          label: 'Projects',
          description: 'Portfolio projects grid',
          enabled: features.projects !== false,
          category: 'content',
        },
        {
          id: 'skills',
          label: 'Skills',
          description: 'Technical skills section',
          enabled: features.skills !== false,
          category: 'content',
        },
        {
          id: 'aboutMe',
          label: 'About',
          description: 'Personal introduction',
          enabled: features.aboutMe !== false,
          category: 'content',
        },
        {
          id: 'blog',
          label: 'Blog',
          description: 'Blog posts',
          enabled: features.blog === true,
          category: 'content',
        },
      ],
    },
    {
      id: 'presentation',
      name: 'Presentation',
      description: 'Visitor-facing interactions',
      features: [
        {
          id: 'contact',
          label: 'Contact',
          description: 'Contact links / form',
          enabled: features.contact === true,
          category: 'presentation',
        },
        {
          id: 'terminal',
          label: 'Terminal',
          description: 'Optional interactive terminal on the public site',
          enabled: features.terminal === true,
          category: 'presentation',
        },
      ],
    },
    {
      id: 'design',
      name: 'Layout & Design',
      description: 'Chrome and visual system',
      features: [
        {
          id: 'hero',
          label: 'Hero',
          description: 'Hero with avatar, name, bio',
          enabled: features.hero !== false,
          category: 'design',
        },
        {
          id: 'header',
          label: 'Header',
          description: 'Site header / navigation',
          enabled: features.header !== false,
          category: 'design',
        },
        {
          id: 'footer',
          label: 'Footer',
          description: 'Site footer',
          enabled: features.footer !== false,
          category: 'design',
        },
        {
          id: 'theme',
          label: 'Theme system',
          description: 'Colors and design styles — edit in Appearance',
          enabled: features.theme !== false,
          category: 'design',
          hasConfig: true,
        },
      ],
    },
  ]

  const handleConfigure = (featureId: string) => {
    if (featureId === 'theme') {
      router.push('/admin/appearance')
    }
  }

  const handleToggle = (featureId: string, enabled: boolean) => {
    onChange(featureId, enabled)
  }

  return (
    <div className="feature-manager">
      <p className="feature-manager__note text-sm opacity-70 mb-4">
        Single-admin mode: one password unlocks the CMS. No multi-user / OAuth.
      </p>
      {categories.map((category) => (
        <div key={category.id} className="feature-manager__section">
          <div className="feature-manager__section-header">
            <h2 className="feature-manager__section-title">{category.name}</h2>
            <p className="feature-manager__section-description">{category.description}</p>
          </div>
          <div className="feature-manager__list">
            {category.features.map((feature) => (
                <FeatureToggle
                  key={feature.id}
                  name={feature.id}
                  label={feature.label}
                  description={feature.description}
                  enabled={feature.enabled}
                  hasConfig={feature.hasConfig}
                  onChange={(enabled) => handleToggle(feature.id, enabled)}
                  onConfigure={
                    feature.hasConfig ? () => handleConfigure(feature.id) : undefined
                  }
                />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
