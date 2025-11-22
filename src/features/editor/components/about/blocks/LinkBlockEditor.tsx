'use client'

import { type AboutLinkBlock } from '../../../types/about'

interface LinkBlockEditorProps {
  block: AboutLinkBlock
  onUpdate: (block: AboutLinkBlock) => void
}

export default function LinkBlockEditor({ block, onUpdate }: LinkBlockEditorProps) {
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...block,
      label: e.target.value
    })
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...block,
      url: e.target.value
    })
  }

  return (
    <div className="about-link-block-editor">
      <div className="about-link-block-editor__field">
        <label className="about-link-block-editor__label">
          Label
        </label>
        <input
          type="text"
          value={block.label}
          onChange={handleLabelChange}
          className="about-link-block-editor__input"
          placeholder="Link label"
        />
      </div>
      <div className="about-link-block-editor__field">
        <label className="about-link-block-editor__label">
          URL
        </label>
        <input
          type="url"
          value={block.url}
          onChange={handleUrlChange}
          className="about-link-block-editor__input"
          placeholder="https://example.com"
        />
      </div>
    </div>
  )
}

