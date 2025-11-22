'use client'

import { useState } from 'react'
import { 
  type AboutSection,
  type AboutTextSection,
  type AboutSkillsSection,
  type AboutContactSection,
  type AboutLinksSection,
  type AboutImageSection
} from '../../types/about'
import TextSectionEditor from './TextSectionEditor'
import SkillsSectionEditor from './SkillsSectionEditor'
import ContactSectionEditor from './ContactSectionEditor'
import LinksSectionEditor from './LinksSectionEditor'
import ImageSectionEditor from './ImageSectionEditor'

interface SectionEditorProps {
  section: AboutSection
  index: number
  totalSections: number
  onUpdate: (section: AboutSection) => void
  onDelete: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
}

export default function SectionEditor({
  section,
  index,
  totalSections,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown
}: SectionEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const handleUpdate = (updated: AboutSection) => {
    onUpdate(updated)
  }

  const renderSectionEditor = () => {
    switch (section.type) {
      case 'text':
        return (
          <TextSectionEditor
            section={section as AboutTextSection}
            onUpdate={handleUpdate}
          />
        )
      case 'skills':
        return (
          <SkillsSectionEditor
            section={section as AboutSkillsSection}
            onUpdate={handleUpdate}
          />
        )
      case 'contact':
        return (
          <ContactSectionEditor
            section={section as AboutContactSection}
            onUpdate={handleUpdate}
          />
        )
      case 'links':
        return (
          <LinksSectionEditor
            section={section as AboutLinksSection}
            onUpdate={handleUpdate}
          />
        )
      case 'image':
        return (
          <ImageSectionEditor
            section={section as AboutImageSection}
            onUpdate={handleUpdate}
          />
        )
      default:
        return <div>Unknown section type</div>
    }
  }

  return (
    <div className="about-section-editor">
      <div className="about-section-editor__header">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="about-section-editor__toggle"
        >
          {isExpanded ? '▼' : '▶'}
        </button>
        <div className="about-section-editor__info">
          <span className="about-section-editor__type">
            {section.type === 'text' && '📝'}
            {section.type === 'skills' && '🛠️'}
            {section.type === 'contact' && '📧'}
            {section.type === 'links' && '🔗'}
            {section.type === 'image' && '🖼️'}
            {' '}
            {section.title || 'Untitled Section'}
          </span>
          <span className="about-section-editor__index">
            #{index + 1} of {totalSections}
          </span>
        </div>
        <div className="about-section-editor__actions">
          {onMoveUp && (
            <button
              type="button"
              onClick={onMoveUp}
              className="about-section-editor__action"
              title="Move up"
            >
              ↑
            </button>
          )}
          {onMoveDown && (
            <button
              type="button"
              onClick={onMoveDown}
              className="about-section-editor__action"
              title="Move down"
            >
              ↓
            </button>
          )}
          <button
            type="button"
            onClick={onDelete}
            className="about-section-editor__action about-section-editor__action--delete"
            title="Delete section"
          >
            🗑️
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="about-section-editor__content">
          {renderSectionEditor()}
        </div>
      )}
    </div>
  )
}

