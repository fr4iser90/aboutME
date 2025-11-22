'use client'

import { type AboutContact } from '../../types/about'

interface ContactEditorProps {
  contact: AboutContact
  onChange: (contact: AboutContact) => void
}

export default function ContactEditor({ contact, onChange }: ContactEditorProps) {
  const handleChange = (key: keyof AboutContact, value: string) => {
    onChange({
      ...contact,
      [key]: value
    })
  }

  return (
    <div className="about-contact-editor">
      <h3 className="about-contact-editor__title">Contact Info</h3>
      <div className="about-contact-editor__fields">
        <div className="about-contact-editor__field">
          <label className="about-contact-editor__label">
            Email
          </label>
          <input
            type="email"
            value={contact.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            className="about-contact-editor__input"
            placeholder="your@email.com"
          />
        </div>

        <div className="about-contact-editor__field">
          <label className="about-contact-editor__label">
            Location
          </label>
          <input
            type="text"
            value={contact.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
            className="about-contact-editor__input"
            placeholder="City, Country"
          />
        </div>

        <div className="about-contact-editor__field">
          <label className="about-contact-editor__label">
            Timezone
          </label>
          <input
            type="text"
            value={contact.timezone || ''}
            onChange={(e) => handleChange('timezone', e.target.value)}
            className="about-contact-editor__input"
            placeholder="UTC+1"
          />
        </div>
      </div>
    </div>
  )
}

