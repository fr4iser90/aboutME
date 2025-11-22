'use client'

import { type AboutLinksSection } from '../../types/about'

interface LinksSectionEditorProps {
  section: AboutLinksSection
  onUpdate: (section: AboutLinksSection) => void
}

export default function LinksSectionEditor({ section, onUpdate }: LinksSectionEditorProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...section,
      title: e.target.value
    })
  }

  const handleLinkChange = (index: number, key: 'label' | 'url', value: string) => {
    const newLinks = [...section.links]
    newLinks[index] = {
      ...newLinks[index],
      [key]: value
    }
    onUpdate({
      ...section,
      links: newLinks
    })
  }

  const handleAddLink = () => {
    onUpdate({
      ...section,
      links: [...section.links, { label: '', url: '' }]
    })
  }

  const handleRemoveLink = (index: number) => {
    const newLinks = section.links.filter((_, i) => i !== index)
    onUpdate({
      ...section,
      links: newLinks.length > 0 ? newLinks : [{ label: '', url: '' }]
    })
  }

  return (
    <div className="about-links-section-editor">
      <div className="about-links-section-editor__field">
        <label className="about-links-section-editor__label">
          Title
        </label>
        <input
          type="text"
          value={section.title}
          onChange={handleTitleChange}
          className="about-links-section-editor__input"
          placeholder="Links"
        />
      </div>

      <div className="about-links-section-editor__links">
        <label className="about-links-section-editor__label">
          Links
        </label>
        {section.links.map((link, index) => (
          <div key={index} className="about-links-section-editor__link">
            <input
              type="text"
              value={link.label}
              onChange={(e) => handleLinkChange(index, 'label', e.target.value)}
              className="about-links-section-editor__input"
              placeholder="Link label"
            />
            <input
              type="url"
              value={link.url}
              onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
              className="about-links-section-editor__input"
              placeholder="https://example.com"
            />
            <button
              type="button"
              onClick={() => handleRemoveLink(index)}
              className="about-links-section-editor__remove"
              disabled={section.links.length === 1}
            >
              🗑️
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddLink}
          className="about-links-section-editor__add"
        >
          + Add Link
        </button>
      </div>
    </div>
  )
}

