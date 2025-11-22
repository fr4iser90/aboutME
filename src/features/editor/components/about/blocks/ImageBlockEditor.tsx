'use client'

import { type AboutImageBlock } from '../../../types/about'

interface ImageBlockEditorProps {
  block: AboutImageBlock
  onUpdate: (block: AboutImageBlock) => void
}

export default function ImageBlockEditor({ block, onUpdate }: ImageBlockEditorProps) {
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...block,
      imageUrl: e.target.value
    })
  }

  const handleAltChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...block,
      alt: e.target.value
    })
  }

  const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...block,
      caption: e.target.value
    })
  }

  return (
    <div className="about-image-block-editor">
      <div className="about-image-block-editor__field">
        <label className="about-image-block-editor__label">
          Image URL
        </label>
        <input
          type="url"
          value={block.imageUrl}
          onChange={handleImageUrlChange}
          className="about-image-block-editor__input"
          placeholder="/data/about/image.jpg or https://..."
        />
      </div>
      <div className="about-image-block-editor__field">
        <label className="about-image-block-editor__label">
          Alt Text
        </label>
        <input
          type="text"
          value={block.alt}
          onChange={handleAltChange}
          className="about-image-block-editor__input"
          placeholder="Image description"
        />
      </div>
      <div className="about-image-block-editor__field">
        <label className="about-image-block-editor__label">
          Caption (optional)
        </label>
        <input
          type="text"
          value={block.caption || ''}
          onChange={handleCaptionChange}
          className="about-image-block-editor__input"
          placeholder="Image caption"
        />
      </div>
      {block.imageUrl && (
        <div className="about-image-block-editor__preview">
          <img
            src={block.imageUrl}
            alt={block.alt}
            className="about-image-block-editor__preview-img"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
      )}
    </div>
  )
}

