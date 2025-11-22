'use client'

import { useState } from 'react'
import { 
  type AboutTextSection,
  type AboutBlock,
  type AboutBlockType,
  createDefaultBlock,
  generateBlockId
} from '../../types/about'
import BlockEditor from './BlockEditor'

interface TextSectionEditorProps {
  section: AboutTextSection
  onUpdate: (section: AboutTextSection) => void
}

export default function TextSectionEditor({ section, onUpdate }: TextSectionEditorProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...section,
      title: e.target.value
    })
  }

  const handleBlockAdd = (type: AboutBlockType) => {
    const newBlock = createDefaultBlock(type)
    onUpdate({
      ...section,
      blocks: [...section.blocks, newBlock]
    })
  }

  const handleBlockUpdate = (blockId: string, updatedBlock: AboutBlock) => {
    onUpdate({
      ...section,
      blocks: section.blocks.map(b => b.id === blockId ? updatedBlock : b)
    })
  }

  const handleBlockDelete = (blockId: string) => {
    onUpdate({
      ...section,
      blocks: section.blocks.filter(b => b.id !== blockId)
    })
  }

  const handleBlockMove = (fromIndex: number, toIndex: number) => {
    const newBlocks = [...section.blocks]
    const [moved] = newBlocks.splice(fromIndex, 1)
    newBlocks.splice(toIndex, 0, moved)
    onUpdate({
      ...section,
      blocks: newBlocks
    })
  }

  return (
    <div className="about-text-section-editor">
      <div className="about-text-section-editor__header">
        <input
          type="text"
          value={section.title}
          onChange={handleTitleChange}
          className="about-text-section-editor__title-input"
          placeholder="Section Title"
        />
      </div>

      <div className="about-text-section-editor__blocks">
        {section.blocks.length === 0 ? (
          <div className="about-text-section-editor__empty">
            <p>No blocks yet. Add your first block!</p>
          </div>
        ) : (
          section.blocks.map((block, index) => (
            <BlockEditor
              key={block.id}
              block={block}
              index={index}
              totalBlocks={section.blocks.length}
              onUpdate={(updated) => handleBlockUpdate(block.id, updated)}
              onDelete={() => handleBlockDelete(block.id)}
              onMoveUp={index > 0 ? () => handleBlockMove(index, index - 1) : undefined}
              onMoveDown={index < section.blocks.length - 1 ? () => handleBlockMove(index, index + 1) : undefined}
            />
          ))
        )}
      </div>

      <div className="about-text-section-editor__add-menu">
        <button 
          type="button"
          className="about-text-section-editor__add-button"
        >
          + Add Block
        </button>
        <div className="about-text-section-editor__add-menu-dropdown">
          <button 
            type="button"
            onClick={() => handleBlockAdd('heading')}
            className="about-text-section-editor__add-menu-item"
          >
            📝 Heading
          </button>
          <button 
            type="button"
            onClick={() => handleBlockAdd('text')}
            className="about-text-section-editor__add-menu-item"
          >
            📄 Text
          </button>
          <button 
            type="button"
            onClick={() => handleBlockAdd('list')}
            className="about-text-section-editor__add-menu-item"
          >
            • List
          </button>
          <button 
            type="button"
            onClick={() => handleBlockAdd('quote')}
            className="about-text-section-editor__add-menu-item"
          >
            💬 Quote
          </button>
          <button 
            type="button"
            onClick={() => handleBlockAdd('link')}
            className="about-text-section-editor__add-menu-item"
          >
            🔗 Link
          </button>
          <button 
            type="button"
            onClick={() => handleBlockAdd('image')}
            className="about-text-section-editor__add-menu-item"
          >
            🖼️ Image
          </button>
          <button 
            type="button"
            onClick={() => handleBlockAdd('divider')}
            className="about-text-section-editor__add-menu-item"
          >
            ➖ Divider
          </button>
          <button 
            type="button"
            onClick={() => handleBlockAdd('code')}
            className="about-text-section-editor__add-menu-item"
          >
            💻 Code
          </button>
        </div>
      </div>
    </div>
  )
}

