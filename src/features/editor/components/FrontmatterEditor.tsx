'use client'

import { useState, useEffect } from 'react'
import type { ProjectLayoutConfig } from '@/features/portfolio/types'
import FileUpload from '@/features/upload/components/FileUpload'
import ScreenshotEditor from './ScreenshotEditor'
import { BaseModal } from '@/features/shared'

interface FrontmatterData {
  title?: string
  status?: 'active' | 'hidden' | 'draft'
  featured?: boolean
  category?: string
  layout?: ProjectLayoutConfig
  screenshots?: string[]
  [key: string]: any
}

interface FrontmatterEditorProps {
  frontmatter: FrontmatterData | null
  category: 'about' | 'blog' | 'projects'
  onUpdate: (updates: Partial<FrontmatterData>) => void
  onSave: () => void
}

export default function FrontmatterEditor({
  frontmatter,
  category,
  onUpdate,
  onSave
}: FrontmatterEditorProps) {
  const [localFrontmatter, setLocalFrontmatter] = useState<FrontmatterData>(frontmatter || {})
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    setLocalFrontmatter(frontmatter || {})
  }, [frontmatter])

  const handleChange = (key: string, value: any) => {
    const updated = { ...localFrontmatter, [key]: value }
    setLocalFrontmatter(updated)
    onUpdate(updated)
  }

  // Drag & Drop für Screenshot-Reihenfolge
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  
  // Screenshot Editor
  const [editingScreenshot, setEditingScreenshot] = useState<string | null>(null)

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const screenshots = [...(localFrontmatter.screenshots || [])]
    const draggedItem = screenshots[draggedIndex]
    screenshots.splice(draggedIndex, 1)
    screenshots.splice(index, 0, draggedItem)
    
    setLocalFrontmatter({ ...localFrontmatter, screenshots })
    handleChange('screenshots', screenshots)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  // Only show for projects (other categories have simpler frontmatter)
  if (category !== 'projects') {
    return null
  }

  return (
    <div className="frontmatter-editor">
      <div 
        className="frontmatter-editor__header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="frontmatter-editor__icon">
          {isExpanded ? '📂' : '📁'}
        </span>
        <span className="frontmatter-editor__title">Frontmatter</span>
        {!frontmatter && (
          <span className="frontmatter-editor__badge">New</span>
        )}
      </div>

      {isExpanded && (
        <div className="frontmatter-editor__content">
          {/* Basic Fields */}
          <div className="frontmatter-editor__section">
            <label className="frontmatter-editor__label">
              Title
              <input
                type="text"
                value={localFrontmatter.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                className="frontmatter-editor__input"
                placeholder="Project title"
              />
            </label>
          </div>

          <div className="frontmatter-editor__section">
            <label className="frontmatter-editor__label">
              Status
              <select
                value={localFrontmatter.status || 'active'}
                onChange={(e) => handleChange('status', e.target.value)}
                className="frontmatter-editor__select"
              >
                <option value="active">🟢 Active</option>
                <option value="hidden">👁️ Hidden</option>
                <option value="draft">📝 Draft</option>
              </select>
            </label>
          </div>

          <div className="frontmatter-editor__section">
            <label className="frontmatter-editor__label">
              <input
                type="checkbox"
                checked={localFrontmatter.featured || false}
                onChange={(e) => handleChange('featured', e.target.checked)}
                className="frontmatter-editor__checkbox"
              />
              <span>⭐ Featured</span>
            </label>
          </div>

          {/* Page Layout (Design) */}
          <div className="frontmatter-editor__section">
            <h3 className="frontmatter-editor__section-title">Page Layout (Design)</h3>
            
            <label className="frontmatter-editor__label">
              Design Template
              <select
                value={localFrontmatter.pageLayout || 'sidebar-left'}
                onChange={(e) => handleChange('pageLayout', e.target.value)}
                className="frontmatter-editor__select"
              >
                <option value="sidebar-left">📋 Sidebar Left (Standard)</option>
                <option value="sidebar-right">📋 Sidebar Right</option>
                <option value="full-width">📄 Full Width</option>
                <option value="two-column">📊 Two Column</option>
                <option value="centered">🎯 Centered</option>
                <option value="masonry">🧱 Masonry</option>
                <option value="split-screen">🖥️ Split Screen</option>
                <option value="hero-content">🎬 Hero Content</option>
                <option value="carousel-layout">🎠 Carousel</option>
                <option value="sticky-sidebar">📌 Sticky Sidebar</option>
              </select>
            </label>
            <p className="frontmatter-editor__help-text">
              Wähle das Design für deine Projekt-Seite. Das steuert die Position von Sidebar und Content.
            </p>
          </div>

          {/* Screenshots */}
          <div className="frontmatter-editor__section">
            <h3 className="frontmatter-editor__section-title">Screenshots</h3>
            
            {/* Screenshot Upload */}
            <div className="frontmatter-editor__upload">
              <FileUpload
                category="projects"
                multiple={true}
                onUploadComplete={(file) => {
                  const updated = [...(localFrontmatter.screenshots || []), file.url]
                  handleChange('screenshots', updated)
                }}
                onBatchUploadComplete={(files) => {
                  const updated = [...(localFrontmatter.screenshots || []), ...files.map(f => f.url)]
                  handleChange('screenshots', updated)
                }}
                onUploadError={(error) => {
                  console.error('Screenshot upload error:', error)
                  alert(`Upload failed: ${error}`)
                }}
                maxSize={5 * 1024 * 1024} // 5MB
                allowedTypes={['image/jpeg', 'image/png', 'image/webp', 'image/gif']}
                className="frontmatter-editor__file-upload"
              />
            </div>
            
            {/* Screenshot List */}
            <div className="frontmatter-editor__screenshots">
              {localFrontmatter.screenshots?.map((screenshot, index) => (
                <div 
                  key={index} 
                  className={`frontmatter-editor__screenshot-item ${draggedIndex === index ? 'frontmatter-editor__screenshot-item--dragging' : ''}`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="frontmatter-editor__screenshot-preview">
                    {screenshot && (
                      <img 
                        src={screenshot} 
                        alt={`Screenshot ${index + 1}`}
                        className="frontmatter-editor__screenshot-img"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                        draggable={false}
                      />
                    )}
                  </div>
                  <div className="frontmatter-editor__screenshot-drag-handle" title="Drag to reorder">
                    ⋮⋮
                  </div>
                  <input
                    type="text"
                    value={screenshot}
                    onChange={(e) => {
                      const updated = [...(localFrontmatter.screenshots || [])]
                      updated[index] = e.target.value
                      handleChange('screenshots', updated)
                    }}
                    className="frontmatter-editor__input"
                    placeholder="/uploads/projects/image.jpg"
                  />
                  <button
                    onClick={() => setEditingScreenshot(screenshot)}
                    className="frontmatter-editor__edit-btn"
                    title="Edit screenshot (crop/resize)"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => {
                      const updated = localFrontmatter.screenshots?.filter((_, i) => i !== index) || []
                      handleChange('screenshots', updated)
                    }}
                    className="frontmatter-editor__remove-btn"
                    title="Remove screenshot"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="frontmatter-editor__actions">
            <button
              onClick={onSave}
              className="frontmatter-editor__save-btn"
            >
              💾 Save Frontmatter
            </button>
          </div>
        </div>
      )}

      {/* Screenshot Editor Modal */}
      {editingScreenshot && (
        <BaseModal
          isOpen={!!editingScreenshot}
          onClose={() => setEditingScreenshot(null)}
          title="Edit Screenshot"
        >
          <ScreenshotEditor
            imageUrl={editingScreenshot}
            onSave={(croppedUrl) => {
              // Update screenshot in list
              const updated = localFrontmatter.screenshots?.map(url => 
                url === editingScreenshot ? croppedUrl : url
              ) || []
              handleChange('screenshots', updated)
              setEditingScreenshot(null)
            }}
            onCancel={() => setEditingScreenshot(null)}
          />
        </BaseModal>
      )}
    </div>
  )
}

