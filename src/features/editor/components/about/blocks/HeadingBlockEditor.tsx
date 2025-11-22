'use client'

import { type AboutHeadingBlock } from '../../../types/about'

interface HeadingBlockEditorProps {
  block: AboutHeadingBlock
  onUpdate: (block: AboutHeadingBlock) => void
}

export default function HeadingBlockEditor({ block, onUpdate }: HeadingBlockEditorProps) {
  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({
      ...block,
      level: parseInt(e.target.value) as 1 | 2 | 3 | 4
    })
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...block,
      content: e.target.value
    })
  }

  return (
    <div className="about-heading-block-editor">
      <div className="about-heading-block-editor__field">
        <label className="about-heading-block-editor__label">
          Level
        </label>
        <select
          value={block.level}
          onChange={handleLevelChange}
          className="about-heading-block-editor__select"
        >
          <option value={1}>H1</option>
          <option value={2}>H2</option>
          <option value={3}>H3</option>
          <option value={4}>H4</option>
        </select>
      </div>
      <div className="about-heading-block-editor__field">
        <label className="about-heading-block-editor__label">
          Content
        </label>
        <input
          type="text"
          value={block.content}
          onChange={handleContentChange}
          className="about-heading-block-editor__input"
          placeholder="Heading text"
        />
      </div>
    </div>
  )
}

