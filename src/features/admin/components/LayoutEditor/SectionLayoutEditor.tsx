'use client'

import { useState, useEffect } from 'react'
import { 
  getAllSectionLayouts, 
  saveAllSectionLayouts,
  type SectionLayoutsConfig,
  type SectionType
} from '@/features/shared/utils/layoutConfig'
import type { SectionDetailLayoutType, SectionMediaLayoutType } from '@/features/shared/types/sectionLayouts'

interface SectionLayoutEditorProps {
  onSave?: () => void
}

const sections: Array<{
  id: SectionType
  name: string
  description: string
  availableTemplates: string[]
  supportsDetailLayout?: boolean
  supportsMediaLayout?: boolean
  availableDetailLayouts?: SectionDetailLayoutType[]
  availableMediaLayouts?: SectionMediaLayoutType[]
}> = [
  { 
    id: 'projects', 
    name: 'Projects', 
    description: 'Projects section layout',
    availableTemplates: ['grid', 'masonry', 'carousel', 'list'],
    supportsDetailLayout: true,
    supportsMediaLayout: true,
    availableDetailLayouts: ['sidebar-left', 'two-column', 'masonry', 'centered', 'full-width'],
    availableMediaLayouts: ['single', 'grid', 'gallery', 'carousel', 'video', 'mixed']
  },
  { 
    id: 'skills', 
    name: 'Skills', 
    description: 'Skills section layout',
    availableTemplates: ['grid', 'list', 'tags', 'compact'],
    supportsDetailLayout: false,
    supportsMediaLayout: false
  },
  { 
    id: 'timeline', 
    name: 'Timeline', 
    description: 'Timeline section layout',
    availableTemplates: ['vertical', 'horizontal', 'compact', 'cards'],
    supportsDetailLayout: false,
    supportsMediaLayout: false
  },
  { 
    id: 'blog', 
    name: 'Blog', 
    description: 'Blog section layout',
    availableTemplates: ['grid', 'list', 'magazine', 'compact'],
    supportsDetailLayout: true,
    supportsMediaLayout: true,
    availableDetailLayouts: ['sidebar-left', 'two-column', 'centered', 'full-width'],
    availableMediaLayouts: ['single', 'grid', 'gallery']
  },
  { 
    id: 'aboutMe', 
    name: 'About Me', 
    description: 'About Me section layout',
    availableTemplates: ['centered', 'two-column', 'full-width'],
    supportsDetailLayout: true,
    supportsMediaLayout: false,
    availableDetailLayouts: ['sidebar-left', 'two-column', 'centered', 'full-width']
  },
  { 
    id: 'contact', 
    name: 'Contact', 
    description: 'Contact section layout',
    availableTemplates: ['centered', 'split', 'full-width'],
    supportsDetailLayout: false,
    supportsMediaLayout: false
  }
]

export default function SectionLayoutEditor({ onSave }: SectionLayoutEditorProps) {
  const [configs, setConfigs] = useState<SectionLayoutsConfig>({})
  const [selectedSection, setSelectedSection] = useState<SectionType>('projects')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadConfigs()
  }, [])

  const loadConfigs = async () => {
    try {
      setLoading(true)
      setError(null)
      const loadedConfigs = await getAllSectionLayouts()
      setConfigs(loadedConfigs)
      setHasChanges(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load section layouts')
    } finally {
      setLoading(false)
    }
  }

  const handleStyleChange = (section: SectionType, style: string) => {
    setConfigs(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        style
      }
    }))
    setHasChanges(true)
    setSuccess(null)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      await saveAllSectionLayouts(configs)
      setHasChanges(false)
      setSuccess('Section layout configurations saved successfully')
      if (onSave) {
        onSave()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save section layouts')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    loadConfigs()
  }

  const currentSection = sections.find(s => s.id === selectedSection)
  const currentConfig = configs[selectedSection] || { style: 'grid' }
  const style = currentConfig.style || 'grid'

  if (loading) {
    return (
      <div className="section-layout-editor">
        <div className="section-layout-editor__loading">Loading section layouts...</div>
      </div>
    )
  }

  return (
    <div className="section-layout-editor">
      <div className="section-layout-editor__header">
        <h2 className="section-layout-editor__title">Section Layout Configuration</h2>
        <p className="section-layout-editor__description">
          Configure layout templates for each section
        </p>
      </div>

      {error && (
        <div className="section-layout-editor__error">
          {error}
        </div>
      )}

      {success && (
        <div className="section-layout-editor__success">
          {success}
        </div>
      )}

      <div className="section-layout-editor__content">
        {/* Section Tabs */}
        <div className="section-layout-editor__tabs">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setSelectedSection(section.id)}
              className={`section-layout-editor__tab ${
                selectedSection === section.id ? 'section-layout-editor__tab--active' : ''
              }`}
            >
              {section.name}
            </button>
          ))}
        </div>

        {/* Selected Section Configuration */}
        {currentSection && (
          <div className="section-layout-editor__section-config">
            <h3 className="section-layout-editor__section-title">
              {currentSection.name} Layout
            </h3>
            <p className="section-layout-editor__section-description">
              {currentSection.description}
            </p>

            <div className="section-layout-editor__template-selector">
              <label className="section-layout-editor__label">Section Style</label>
              <div className="section-layout-editor__template-grid">
                {currentSection.availableTemplates.map((template) => (
                  <button
                    key={template}
                    onClick={() => handleStyleChange(selectedSection, template)}
                    className={`section-layout-editor__template-card ${
                      style === template 
                        ? 'section-layout-editor__template-card--selected' 
                        : ''
                    }`}
                  >
                    <div className="section-layout-editor__template-name">
                      {template.charAt(0).toUpperCase() + template.slice(1)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="section-layout-editor__actions">
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="section-layout-editor__btn section-layout-editor__btn--primary"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          onClick={handleCancel}
          disabled={!hasChanges || saving}
          className="section-layout-editor__btn section-layout-editor__btn--secondary"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

