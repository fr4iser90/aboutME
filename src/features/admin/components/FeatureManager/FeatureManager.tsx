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
  category: 'content' | 'presentation' | 'design' | 'administration'
}

interface FeatureCategory {
  id: string
  name: string
  icon: string
  description: string
  features: Feature[]
}

interface FeatureManagerProps {
  features: Record<string, boolean>
  onChange: (featureName: string, enabled: boolean) => void
}

export default function FeatureManager({ features, onChange }: FeatureManagerProps) {
  const router = useRouter()

  // CMS-Kategorien (wie im Build Modal)
  const categories: FeatureCategory[] = [
    {
      id: 'content',
      name: 'Content Management',
      icon: '📝',
      description: 'Content types and content management',
      features: [
        {
          id: 'projects',
          label: 'Portfolio Projects',
          description: 'Display your projects portfolio',
          enabled: features.projects !== false,
          category: 'content'
        },
        {
          id: 'skills',
          label: 'Skills Section',
          description: 'Showcase your technical skills',
          enabled: features.skills !== false,
          category: 'content'
        },
        {
          id: 'aboutMe',
          label: 'About Section',
          description: 'Personal introduction and bio',
          enabled: features.aboutMe !== false,
          category: 'content'
        },
        {
          id: 'blog',
          label: 'Blog',
          description: 'Write and publish blog posts',
          enabled: features.blog === true,
          category: 'content'
        }
      ]
    },
    {
      id: 'presentation',
      name: 'Presentation & Interaction',
      icon: '🎨',
      description: 'User interactions and frontend features',
      features: [
        {
          id: 'contact',
          label: 'Contact Form',
          description: 'Let visitors contact you',
          enabled: features.contact === true,
          category: 'presentation'
        },
        {
          id: 'terminal',
          label: 'Terminal Game',
          description: 'Interactive terminal game (Terminal, Snake, Pacman)',
          enabled: features.terminal === true,
          category: 'presentation',
          hasConfig: true
        }
      ]
    },
    {
      id: 'design',
      name: 'Presentation & Design',
      icon: '🎨',
      description: 'Themes, layouts, and styling customization',
      features: [
        {
          id: 'hero',
          label: 'Hero Section',
          description: 'Hero section with avatar, name, and bio',
          enabled: features.hero !== false,
          category: 'design',
          hasConfig: true
        },
        {
          id: 'header',
          label: 'Header',
          description: 'Site header with navigation and branding',
          enabled: features.header !== false,
          category: 'design',
          hasConfig: true
        },
        {
          id: 'footer',
          label: 'Footer',
          description: 'Site footer with copyright and terminal button',
          enabled: features.footer !== false,
          category: 'design',
          hasConfig: true
        },
        {
          id: 'theme',
          label: 'Theme & Design System',
          description: 'Theme colors (dark/light) and design styles (glassmorphism/flat/minimal). Configure in Design & Themes.',
          enabled: features.theme !== false,
          category: 'design',
          hasConfig: true
        }
      ]
    },
    {
      id: 'administration',
      name: 'Administration & Access',
      icon: '🔐',
      description: 'Admin tools and access control',
      features: [
        {
          id: 'auth',
          label: 'Authentication',
          description: 'User authentication system',
          enabled: features.auth === true,
          category: 'administration',
          hasConfig: true
        },
        {
          id: 'editor',
          label: 'Content Editor',
          description: 'Edit content directly in the admin panel',
          enabled: features.editor === true,
          category: 'administration',
          dependencies: ['auth']
        },
        {
          id: 'fileUpload',
          label: 'Media Library',
          description: 'Upload and manage media files',
          enabled: features.fileUpload === true,
          category: 'administration',
          dependencies: ['auth']
        },
        {
          id: 'guestbook',
          label: 'Guestbook',
          description: 'Visitor guestbook with comments',
          enabled: features.guestbook === true,
          category: 'administration',
          dependencies: ['auth']
        }
      ]
    }
  ]

  const handleConfigure = (featureId: string) => {
    if (featureId === 'terminal') {
      router.push('/admin/features/games')
    } else if (featureId === 'auth') {
      alert('Auth configuration coming soon')
    } else if (featureId === 'hero') {
      alert('Hero configuration coming soon')
    } else if (featureId === 'theme') {
      router.push('/admin/theme')
    }
  }

  const handleToggle = (featureId: string, enabled: boolean) => {
    // Check dependencies before disabling
    const feature = categories
      .flatMap(cat => cat.features)
      .find(f => f.id === featureId)

    if (feature?.dependencies && feature.dependencies.length > 0) {
      // Check if all dependencies are enabled
      const allDependenciesEnabled = feature.dependencies.every(
        dep => features[dep] === true
      )
      
      if (!allDependenciesEnabled && enabled) {
        const missingDeps = feature.dependencies.filter(dep => features[dep] !== true)
        alert(`Cannot enable ${feature.label}: requires ${missingDeps.join(', ')}`)
        return
      }
    }

    // Check if disabling auth - disable dependent features
    if (featureId === 'auth' && !enabled) {
      const dependentFeatures = ['editor', 'fileUpload', 'guestbook']
      const hasEnabledDependents = dependentFeatures.some(dep => features[dep] === true)
      if (hasEnabledDependents) {
        if (confirm('Disabling Authentication will also disable: Content Editor, Media Library, and Guestbook. Continue?')) {
          // Disable dependent features
          dependentFeatures.forEach(dep => {
            if (features[dep] === true) {
              onChange(dep, false)
            }
          })
          onChange('auth', false)
        }
        return
      }
    }

    // Map special cases
    if (featureId === 'terminal') {
      onChange('terminal', enabled)
    } else if (featureId === 'theme') {
      onChange('theme', enabled)
    } else {
      onChange(featureId, enabled)
    }
  }

  return (
    <div className="feature-manager">
      {categories.map((category) => (
        <div key={category.id} className="feature-manager__section">
          <div className="feature-manager__section-header">
            <h2 className="feature-manager__section-title">
              <span className="feature-manager__section-icon">{category.icon}</span>
              {category.name}
            </h2>
            <p className="feature-manager__section-description">{category.description}</p>
          </div>
          <div className="feature-manager__list">
            {category.features.map((feature) => {
              // Check if feature is disabled due to missing dependencies
              const isDisabledByDeps = feature.dependencies && feature.dependencies.length > 0
                ? !feature.dependencies.every(dep => features[dep] === true)
                : false

              return (
                <FeatureToggle
                  key={feature.id}
                  name={feature.id}
                  label={feature.label}
                  description={feature.description}
                  enabled={feature.enabled}
                  disabled={isDisabledByDeps}
                  hasConfig={feature.hasConfig}
                  dependencies={feature.dependencies}
                  onChange={(enabled) => handleToggle(feature.id, enabled)}
                  onConfigure={() => handleConfigure(feature.id)}
                />
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
