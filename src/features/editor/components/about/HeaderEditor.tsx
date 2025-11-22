'use client'

import { type AboutHeader } from '../../types/about'

interface HeaderEditorProps {
  header: AboutHeader
  onChange: (header: AboutHeader) => void
}

export default function HeaderEditor({ header, onChange }: HeaderEditorProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...header,
      title: e.target.value
    })
  }

  const handleSubtitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...header,
      subtitle: e.target.value
    })
  }

  return (
    <div className="about-header-editor">
      <h3 className="about-header-editor__title">Header</h3>
      <div className="about-header-editor__fields">
        <div className="about-header-editor__field">
          <label className="about-header-editor__label">
            Title
          </label>
          <input
            type="text"
            value={header.title}
            onChange={handleTitleChange}
            className="about-header-editor__input"
            placeholder="About Me"
          />
        </div>
        <div className="about-header-editor__field">
          <label className="about-header-editor__label">
            Subtitle (optional)
          </label>
          <input
            type="text"
            value={header.subtitle || ''}
            onChange={handleSubtitleChange}
            className="about-header-editor__input"
            placeholder="Your tagline or short description"
          />
        </div>
      </div>
    </div>
  )
}

