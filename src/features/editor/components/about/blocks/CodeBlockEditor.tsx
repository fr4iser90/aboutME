'use client'

import { type AboutCodeBlock } from '../../../types/about'

interface CodeBlockEditorProps {
  block: AboutCodeBlock
  onUpdate: (block: AboutCodeBlock) => void
}

export default function CodeBlockEditor({ block, onUpdate }: CodeBlockEditorProps) {
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({
      ...block,
      language: e.target.value || undefined
    })
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({
      ...block,
      content: e.target.value
    })
  }

  return (
    <div className="about-code-block-editor">
      <div className="about-code-block-editor__field">
        <label className="about-code-block-editor__label">
          Language
        </label>
        <select
          value={block.language || ''}
          onChange={handleLanguageChange}
          className="about-code-block-editor__select"
        >
          <option value="">Plain Text</option>
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="bash">Bash</option>
          <option value="json">JSON</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
          <option value="markdown">Markdown</option>
        </select>
      </div>
      <div className="about-code-block-editor__field">
        <label className="about-code-block-editor__label">
          Code
        </label>
        <textarea
          value={block.content}
          onChange={handleContentChange}
          className="about-code-block-editor__textarea"
          placeholder="Enter code here..."
          rows={10}
        />
      </div>
    </div>
  )
}

