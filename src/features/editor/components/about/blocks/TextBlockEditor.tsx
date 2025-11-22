'use client'

import { type AboutTextBlock } from '../../../types/about'

interface TextBlockEditorProps {
  block: AboutTextBlock
  onUpdate: (block: AboutTextBlock) => void
}

export default function TextBlockEditor({ block, onUpdate }: TextBlockEditorProps) {
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({
      ...block,
      content: e.target.value
    })
  }

  return (
    <div className="about-text-block-editor">
      <label className="about-text-block-editor__label">
        Content (Plain Text - NO MARKDOWN!)
      </label>
      <textarea
        value={block.content}
        onChange={handleContentChange}
        className="about-text-block-editor__textarea"
        placeholder="Enter your text here..."
        rows={6}
      />
      <div className="about-text-block-editor__char-count">
        {block.content.length} characters
      </div>
    </div>
  )
}

