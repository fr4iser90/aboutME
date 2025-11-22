'use client'

import { type AboutQuoteBlock } from '../../../types/about'

interface QuoteBlockEditorProps {
  block: AboutQuoteBlock
  onUpdate: (block: AboutQuoteBlock) => void
}

export default function QuoteBlockEditor({ block, onUpdate }: QuoteBlockEditorProps) {
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({
      ...block,
      content: e.target.value
    })
  }

  const handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...block,
      author: e.target.value
    })
  }

  return (
    <div className="about-quote-block-editor">
      <div className="about-quote-block-editor__field">
        <label className="about-quote-block-editor__label">
          Quote
        </label>
        <textarea
          value={block.content}
          onChange={handleContentChange}
          className="about-quote-block-editor__textarea"
          placeholder="Enter quote text..."
          rows={4}
        />
      </div>
      <div className="about-quote-block-editor__field">
        <label className="about-quote-block-editor__label">
          Author (optional)
        </label>
        <input
          type="text"
          value={block.author || ''}
          onChange={handleAuthorChange}
          className="about-quote-block-editor__input"
          placeholder="Author name"
        />
      </div>
    </div>
  )
}

