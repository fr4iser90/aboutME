'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BaseModal } from '@/features/shared'
import { type ValidationResult } from '../services/jsonValidator'

interface FeatureStatus {
  id: string
  name: string
  enabled: boolean
  category: 'content' | 'presentation' | 'design' | 'administration'
  requires?: string[]
}

interface BuildReview {
  projects: Array<{
    name: string
    status: 'active' | 'hidden' | 'draft'
    featured: boolean
    category?: string
  }>
  files: {
    projects: number
    blog: number
    about: number
  }
  validation: {
    complete: number
    partial: number
    empty: number
    totalIssues: number
  }
  features: {
    content: FeatureStatus[]
    presentation: FeatureStatus[]
    design: FeatureStatus[]
    administration: FeatureStatus[]
  }
  buildSettings: {
    includeInactive: boolean
    featuredProjects: {
      enabled: boolean
      minStars: number
    }
    showAllProjects: boolean
  }
  design: {
    theme: {
      enabled: boolean
      defaultTheme: 'dark' | 'light' | 'auto'
      availableThemes: string[]
      customThemes: number
    }
    layout: {
      sectionOrder: string[]
      spacing: 'small' | 'medium' | 'large'
      template: 'default' | 'grid' | 'list' | 'card'
      headerStyle: 'default' | 'minimal' | 'transparent'
      footerStyle: 'default' | 'minimal' | 'centered'
    }
    styling: {
      colorPalette: {
        primary: string
        secondary: string
        accent: string
      }
      typography: {
        fontFamily: string
        fontSize: 'small' | 'medium' | 'large'
      }
      effects: {
        glassmorphism: boolean
        shadows: boolean
      }
    }
    hero: {
      enabled: boolean
      variant: 'floating' | 'card' | 'fullscreen' | 'minimal' | 'split'
      animation: boolean
      showStats: boolean
    }
  }
}

interface ValidationModalProps {
  isOpen: boolean
  onClose: () => void
  validationResults: Map<string, ValidationResult>
  buildReview?: BuildReview | null
  onRemoveEmptySections: () => void
  onBuildAnyway: () => void
  onCancel: () => void
}

export default function ValidationModal({
  isOpen,
  onClose,
  validationResults,
  buildReview,
  onRemoveEmptySections,
  onBuildAnyway,
  onCancel
}: ValidationModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  // Gruppiere Ergebnisse nach Status
  const validFiles = Array.from(validationResults.entries()).filter(([_, result]) => result.isValid)
  const invalidFiles = Array.from(validationResults.entries()).filter(([_, result]) => !result.isValid)

  const totalIssues = Array.from(validationResults.values()).reduce((sum, result) => sum + result.errors.length, 0)

  const handleRemoveEmptySections = async () => {
    setIsProcessing(true)
    try {
      await onRemoveEmptySections()
      onClose()
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBuildAnyway = async () => {
    setIsProcessing(true)
    try {
      await onBuildAnyway()
      onClose()
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusIcon = (isValid: boolean) => {
    return isValid ? '✅' : '❌'
  }

  const getStatusText = (isValid: boolean) => {
    return isValid ? 'Valid' : 'Invalid'
  }

  if (!isOpen) return null

  // Prüfe ob Probleme gefunden wurden
  const hasIssues = Array.from(validationResults.values()).some(result => !result.isValid)

  // Aktive Projekte (werden gebaut)
  const activeProjects = buildReview?.projects.filter(p => p.status === 'active') || []
  const hiddenProjects = buildReview?.projects.filter(p => p.status === 'hidden') || []
  const featuredProjects = buildReview?.projects.filter(p => p.featured) || []

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="🚀 Build Review">
      <div className="validation-modal">
        {/* Features & Settings Section */}
        {buildReview && (
          <div className="validation-modal__features">
            <div className="validation-modal__features-header">
              <h3 className="validation-modal__section-title">⚙️ Features & Settings:</h3>
              <Link 
                href="/admin/features" 
                className="validation-modal__edit-link"
                onClick={(e) => {
                  e.stopPropagation()
                  onClose() // Modal schließen beim Klick
                }}
              >
                ✏️ Edit Features
              </Link>
            </div>
            
            {/* Content Management */}
            <div className="validation-modal__feature-category">
              <h4 className="validation-modal__category-title">📝 Content Management:</h4>
              <div className="validation-modal__feature-list">
                {buildReview.features.content.map((feature) => (
                  <div key={feature.id} className="validation-modal__feature-item">
                    <span className="validation-modal__feature-icon">
                      {feature.enabled ? '✅' : '❌'}
                    </span>
                    <span className="validation-modal__feature-name">{feature.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Presentation & Interaction */}
            <div className="validation-modal__feature-category">
              <h4 className="validation-modal__category-title">🎨 Presentation & Interaction:</h4>
              <div className="validation-modal__feature-list">
                {buildReview.features.presentation.map((feature) => (
                  <div key={feature.id} className="validation-modal__feature-item">
                    <span className="validation-modal__feature-icon">
                      {feature.enabled ? '✅' : '❌'}
                    </span>
                    <span className="validation-modal__feature-name">{feature.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Presentation & Design */}
            <div className="validation-modal__feature-category">
              <h4 className="validation-modal__category-title">🎨 Presentation & Design:</h4>
              <div className="validation-modal__feature-list">
                {buildReview.features.design.map((feature) => (
                  <div key={feature.id} className="validation-modal__feature-item">
                    <span className="validation-modal__feature-icon">
                      {feature.enabled ? '✅' : feature.id === 'styling' ? '🔜' : '✅'}
                    </span>
                    <span className="validation-modal__feature-name">
                      {feature.name}
                      {feature.id === 'styling' && ' (später)'}
                    </span>
                  </div>
                ))}
              </div>
              {buildReview.design && (
                <div className="validation-modal__design-details">
                  <div className="validation-modal__design-item">
                    <span className="validation-modal__design-label">Hero:</span>
                    <span className="validation-modal__design-value">
                      {buildReview.design.hero.enabled ? `${buildReview.design.hero.variant} variant` : 'Disabled'}
                    </span>
                  </div>
                  <div className="validation-modal__design-item">
                    <span className="validation-modal__design-label">Theme:</span>
                    <span className="validation-modal__design-value">
                      {buildReview.design.theme.defaultTheme} ({buildReview.design.theme.availableThemes.join(', ')})
                    </span>
                  </div>
                  <div className="validation-modal__design-item">
                    <span className="validation-modal__design-label">Layout:</span>
                    <span className="validation-modal__design-value">
                      {buildReview.design.layout.template} ({buildReview.design.layout.spacing} spacing)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Administration & Access */}
            <div className="validation-modal__feature-category">
              <h4 className="validation-modal__category-title">🔐 Administration & Access:</h4>
              <div className="validation-modal__feature-list">
                {buildReview.features.administration.map((feature) => (
                  <div key={feature.id} className="validation-modal__feature-item">
                    <span className="validation-modal__feature-icon">
                      {feature.enabled ? '✅' : '❌'}
                    </span>
                    <span className="validation-modal__feature-name">
                      {feature.name}
                      {feature.requires && feature.requires.length > 0 && (
                        <span className="validation-modal__feature-dependency">
                          {' '}(requires {feature.requires.join(', ')})
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Build Settings */}
            <div className="validation-modal__build-settings">
              <h4 className="validation-modal__category-title">🔧 Build Settings:</h4>
              <div className="validation-modal__settings-list">
                <div className="validation-modal__setting-item">
                  <span className="validation-modal__setting-label">Include Inactive Projects:</span>
                  <span className="validation-modal__setting-value">
                    {buildReview.buildSettings.includeInactive ? '✅ Yes' : '❌ No'}
                  </span>
                </div>
                <div className="validation-modal__setting-item">
                  <span className="validation-modal__setting-label">Featured Projects:</span>
                  <span className="validation-modal__setting-value">
                    {buildReview.buildSettings.featuredProjects.enabled 
                      ? `✅ Show (min ${buildReview.buildSettings.featuredProjects.minStars} stars)`
                      : '❌ Hide'}
                  </span>
                </div>
                <div className="validation-modal__setting-item">
                  <span className="validation-modal__setting-label">Show All Projects:</span>
                  <span className="validation-modal__setting-value">
                    {buildReview.buildSettings.showAllProjects ? '✅ Yes' : '❌ No (Featured only)'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Build Review Section */}
        {buildReview && (
          <div className="validation-modal__review">
            <h3 className="validation-modal__section-title">📦 What will be built:</h3>
            
            {/* Files Summary */}
            <div className="validation-modal__review-summary">
              <div className="validation-modal__review-item">
                <span className="validation-modal__review-label">Projects:</span>
                <span className="validation-modal__review-value">{buildReview.files.projects}</span>
              </div>
              <div className="validation-modal__review-item">
                <span className="validation-modal__review-label">Blog Posts:</span>
                <span className="validation-modal__review-value">{buildReview.files.blog}</span>
              </div>
              <div className="validation-modal__review-item">
                <span className="validation-modal__review-label">About:</span>
                <span className="validation-modal__review-value">{buildReview.files.about}</span>
              </div>
            </div>

            {/* Projects Status */}
            {buildReview.projects.length > 0 && (
              <div className="validation-modal__review-projects">
                <h4 className="validation-modal__review-subtitle">
                  ✅ Active Projects ({activeProjects.length}):
                </h4>
                <div className="validation-modal__project-list">
                  {activeProjects.map((project, index) => (
                    <div key={index} className="validation-modal__project-item">
                      <span className="validation-modal__project-name">{project.name}</span>
                      {project.featured && (
                        <span className="validation-modal__project-badge validation-modal__project-badge--featured">⭐ Featured</span>
                      )}
                      {project.category && (
                        <span className="validation-modal__project-badge">{project.category}</span>
                      )}
                    </div>
                  ))}
                </div>

                {hiddenProjects.length > 0 && (
                  <>
                    <h4 className="validation-modal__review-subtitle">
                      ⏸️ Hidden Projects ({hiddenProjects.length}) - will NOT be built:
                    </h4>
                    <div className="validation-modal__project-list">
                      {hiddenProjects.map((project, index) => (
                        <div key={index} className="validation-modal__project-item validation-modal__project-item--hidden">
                          <span className="validation-modal__project-name">{project.name}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {featuredProjects.length > 0 && (
                  <div className="validation-modal__review-note">
                    ⭐ {featuredProjects.length} featured project{featuredProjects.length !== 1 ? 's' : ''} will be highlighted
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Validation Summary */}
        <div className="validation-modal__summary">
          <div className="validation-modal__summary-item">
            <span className="validation-modal__summary-icon">✅</span>
            <span className="validation-modal__summary-text">Valid: {validFiles.length} files</span>
          </div>
          <div className="validation-modal__summary-item">
            <span className="validation-modal__summary-icon">❌</span>
            <span className="validation-modal__summary-text">Invalid: {invalidFiles.length} files</span>
          </div>
          <div className="validation-modal__summary-item">
            <span className="validation-modal__summary-icon">🔍</span>
            <span className="validation-modal__summary-text">Total Issues: {totalIssues}</span>
          </div>
        </div>

        {/* File Details */}
        <div className="validation-modal__details">
          {validFiles.length > 0 && (
            <div className="validation-modal__section">
              <h3 className="validation-modal__section-title">✅ Valid Files</h3>
              <div className="validation-modal__file-list">
                {validFiles.map(([filePath, result]) => (
                  <div key={filePath} className="validation-modal__file-item validation-modal__file-item--complete">
                    <span className="validation-modal__file-icon">{getStatusIcon(result.isValid)}</span>
                    <span className="validation-modal__file-name">{filePath.split('/').pop()}</span>
                    <span className="validation-modal__file-status">{getStatusText(result.isValid)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {invalidFiles.length > 0 && (
            <div className="validation-modal__section">
              <h3 className="validation-modal__section-title">❌ Files with Issues</h3>
              <div className="validation-modal__file-list">
                {invalidFiles.map(([filePath, result]) => (
                  <div key={filePath} className="validation-modal__file-item validation-modal__file-item--partial">
                    <span className="validation-modal__file-icon">{getStatusIcon(result.isValid)}</span>
                    <span className="validation-modal__file-name">{filePath.split('/').pop()}</span>
                    <span className="validation-modal__file-status">{getStatusText(result.isValid)}</span>
                    <div className="validation-modal__file-issues">
                      {result.errors.slice(0, 3).map((error, index) => (
                        <div key={index} className="validation-modal__issue">
                          <span className="validation-modal__issue-line">{error.path}:</span>
                          <span className="validation-modal__issue-text">{error.message}</span>
                        </div>
                      ))}
                      {result.errors.length > 3 && (
                        <div className="validation-modal__issue-more">
                          ... and {result.errors.length - 3} more issues
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="validation-modal__actions">
          {hasIssues && (
            <button
              onClick={handleRemoveEmptySections}
              disabled={isProcessing}
              className="validation-modal__btn validation-modal__btn--primary"
            >
              {isProcessing ? '⏳ Processing...' : '🗑️ Remove Empty Sections'}
            </button>
          )}
          <button
            onClick={handleBuildAnyway}
            disabled={isProcessing}
            className="validation-modal__btn validation-modal__btn--secondary"
          >
            {isProcessing ? '⏳ Building...' : hasIssues ? '🚀 Build Anyway' : '🚀 Build Portfolio'}
          </button>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="validation-modal__btn validation-modal__btn--tertiary"
          >
            Cancel
          </button>
        </div>
      </div>
    </BaseModal>
  )
}
