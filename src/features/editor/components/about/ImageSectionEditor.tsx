'use client'

import { type AboutImageSection } from '../../types/about'

interface ImageSectionEditorProps {
  section: AboutImageSection
  onUpdate: (section: AboutImageSection) => void
}

export default function ImageSectionEditor({ section, onUpdate }: ImageSectionEditorProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...section,
      title: e.target.value
    })
  }

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...section,
      imageUrl: e.target.value
    })
  }

  const handleAltChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...section,
      alt: e.target.value
    })
  }

  const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...section,
      caption: e.target.value
    })
  }

  return (
    <div className="about-image-section-editor">
      <div className="about-image-section-editor__field">
        <label className="about-image-section-editor__label">
          Title
        </label>
        <input
          type="text"
          value={section.title}
          onChange={handleTitleChange}
          className="about-image-section-editor__input"
          placeholder="Image"
        />
      </div>

      <div className="about-image-section-editor__field">
        <label className="about-image-section-editor__label">
          Image URL
        </label>
        <input
          type="url"
          value={section.imageUrl}
          onChange={handleImageUrlChange}
          className="about-image-section-editor__input"
          placeholder="/data/about/image.jpg or https://..."
        />
      </div>

      <div className="about-image-section-editor__field">
        <label className="about-image-section-editor__label">
          Alt Text
        </label>
        <input
          type="text"
          value={section.alt}
          onChange={handleAltChange}
          className="about-image-section-editor__input"
          placeholder="Image description"
        />
      </div>

      <div className="about-image-section-editor__field">
        <label className="about-image-section-editor__label">
          Caption (optional)
        </label>
        <input
          type="text"
          value={section.caption || ''}
          onChange={handleCaptionChange}
          className="about-image-section-editor__input"
          placeholder="Image caption"
        />
      </div>

      {section.imageUrl && (
        <div className="about-image-section-editor__preview">
          <img
            src={section.imageUrl}
            alt={section.alt}
            className="about-image-section-editor__preview-img"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
      )}
    </div>
  )
}

