'use client'

import { useState, useEffect } from 'react'
import { 
  type AboutData, 
  type AboutSection, 
  type AboutSectionType,
  createDefaultSection,
  generateSectionId
} from '../types/about'
import SectionEditor from './about/SectionEditor'
import HeaderEditor from './about/HeaderEditor'
import SocialLinksEditor from './about/SocialLinksEditor'
import ContactEditor from './about/ContactEditor'

interface AboutEditorProps {
  initialData?: AboutData
  onSave?: (data: AboutData) => void
  onCancel?: () => void
}

export default function AboutEditor({ initialData, onSave, onCancel }: AboutEditorProps) {
  const [data, setData] = useState<AboutData>(() => {
    if (initialData) {
      return initialData
    }
    // Default structure
    return {
      header: {
        title: 'About Me',
        subtitle: ''
      },
      sections: [],
      socialLinks: {
        github: null,
        twitter: null,
        linkedin: null,
        website: null,
        email: null
      },
      contact: {
        email: '',
        location: '',
        timezone: ''
      },
      metadata: {
        lastModified: new Date().toISOString(),
        generatedBy: 'about-editor'
      }
    }
  })

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update data when initialData changes
  useEffect(() => {
    if (initialData) {
      setData(initialData)
    }
  }, [initialData])

  const handleHeaderChange = (header: AboutData['header']) => {
    setData(prev => ({
      ...prev,
      header
    }))
  }

  const handleSectionAdd = (type: AboutSectionType) => {
    const newSection = createDefaultSection(type)
    setData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }))
  }

  const handleSectionUpdate = (sectionId: string, updatedSection: AboutSection) => {
    setData(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === sectionId ? updatedSection : s)
    }))
  }

  const handleSectionDelete = (sectionId: string) => {
    setData(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId)
    }))
  }

  const handleSectionMove = (fromIndex: number, toIndex: number) => {
    setData(prev => {
      const newSections = [...prev.sections]
      const [moved] = newSections.splice(fromIndex, 1)
      newSections.splice(toIndex, 0, moved)
      return {
        ...prev,
        sections: newSections
      }
    })
  }

  const handleSocialLinksChange = (socialLinks: AboutData['socialLinks']) => {
    setData(prev => ({
      ...prev,
      socialLinks
    }))
  }

  const handleContactChange = (contact: AboutData['contact']) => {
    setData(prev => ({
      ...prev,
      contact
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)

    try {
      // Update metadata
      const updatedData: AboutData = {
        ...data,
        metadata: {
          ...data.metadata,
          lastModified: new Date().toISOString()
        }
      }

      if (onSave) {
        onSave(updatedData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="about-editor">
      <div className="about-editor__header">
        <h2 className="about-editor__title">📝 About Me Editor</h2>
        <div className="about-editor__actions">
          {onCancel && (
            <button 
              type="button" 
              onClick={onCancel}
              className="about-editor__button about-editor__button--cancel"
            >
              Cancel
            </button>
          )}
          <button 
            type="button" 
            onClick={handleSave}
            disabled={isSaving}
            className="about-editor__button about-editor__button--save"
          >
            {isSaving ? 'Saving...' : '💾 Save'}
          </button>
        </div>
      </div>

      {error && (
        <div className="about-editor__error">
          ❌ {error}
        </div>
      )}

      <div className="about-editor__content">
        {/* Header Editor */}
        <div className="about-editor__section">
          <HeaderEditor
            header={data.header}
            onChange={handleHeaderChange}
          />
        </div>

        {/* Sections */}
        <div className="about-editor__section">
          <div className="about-editor__section-header">
            <h3 className="about-editor__section-title">Sections</h3>
            <div className="about-editor__section-actions">
              <div className="about-editor__add-menu">
                <button 
                  type="button"
                  className="about-editor__add-button"
                >
                  + Add Section
                </button>
                <div className="about-editor__add-menu-dropdown">
                  <button 
                    type="button"
                    onClick={() => handleSectionAdd('text')}
                    className="about-editor__add-menu-item"
                  >
                    📝 Text Section
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleSectionAdd('skills')}
                    className="about-editor__add-menu-item"
                  >
                    🛠️ Skills Section
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleSectionAdd('contact')}
                    className="about-editor__add-menu-item"
                  >
                    📧 Contact Section
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleSectionAdd('links')}
                    className="about-editor__add-menu-item"
                  >
                    🔗 Links Section
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleSectionAdd('image')}
                    className="about-editor__add-menu-item"
                  >
                    🖼️ Image Section
                  </button>
                </div>
              </div>
            </div>
          </div>

          {data.sections.length === 0 ? (
            <div className="about-editor__empty">
              <p>No sections yet. Add your first section to get started!</p>
            </div>
          ) : (
            <div className="about-editor__sections-list">
              {data.sections.map((section, index) => (
                <SectionEditor
                  key={section.id}
                  section={section}
                  index={index}
                  totalSections={data.sections.length}
                  onUpdate={(updated) => handleSectionUpdate(section.id, updated)}
                  onDelete={() => handleSectionDelete(section.id)}
                  onMoveUp={index > 0 ? () => handleSectionMove(index, index - 1) : undefined}
                  onMoveDown={index < data.sections.length - 1 ? () => handleSectionMove(index, index + 1) : undefined}
                />
              ))}
            </div>
          )}
        </div>

        {/* Social Links */}
        <div className="about-editor__section">
          <SocialLinksEditor
            socialLinks={data.socialLinks || {}}
            onChange={handleSocialLinksChange}
          />
        </div>

        {/* Contact Info */}
        <div className="about-editor__section">
          <ContactEditor
            contact={data.contact || {}}
            onChange={handleContactChange}
          />
        </div>
      </div>
    </div>
  )
}

