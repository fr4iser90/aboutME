'use client'

import { type AboutContactSection } from '../../types/about'

interface ContactSectionEditorProps {
  section: AboutContactSection
  onUpdate: (section: AboutContactSection) => void
}

export default function ContactSectionEditor({ section, onUpdate }: ContactSectionEditorProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...section,
      title: e.target.value
    })
  }

  const handleFieldChange = (key: 'email' | 'location' | 'timezone', value: string) => {
    onUpdate({
      ...section,
      [key]: value
    })
  }

  return (
    <div className="about-contact-section-editor">
      <div className="about-contact-section-editor__field">
        <label className="about-contact-section-editor__label">
          Title
        </label>
        <input
          type="text"
          value={section.title}
          onChange={handleTitleChange}
          className="about-contact-section-editor__input"
          placeholder="Contact"
        />
      </div>

      <div className="about-contact-section-editor__field">
        <label className="about-contact-section-editor__label">
          Email
        </label>
        <input
          type="email"
          value={section.email || ''}
          onChange={(e) => handleFieldChange('email', e.target.value)}
          className="about-contact-section-editor__input"
          placeholder="your@email.com"
        />
      </div>

      <div className="about-contact-section-editor__field">
        <label className="about-contact-section-editor__label">
          Location
        </label>
        <input
          type="text"
          value={section.location || ''}
          onChange={(e) => handleFieldChange('location', e.target.value)}
          className="about-contact-section-editor__input"
          placeholder="City, Country"
        />
      </div>

      <div className="about-contact-section-editor__field">
        <label className="about-contact-section-editor__label">
          Timezone
        </label>
        <input
          type="text"
          value={section.timezone || ''}
          onChange={(e) => handleFieldChange('timezone', e.target.value)}
          className="about-contact-section-editor__input"
          placeholder="UTC+1"
        />
      </div>
    </div>
  )
}

