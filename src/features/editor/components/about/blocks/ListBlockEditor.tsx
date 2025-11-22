'use client'

import { type AboutListBlock } from '../../../types/about'

interface ListBlockEditorProps {
  block: AboutListBlock
  onUpdate: (block: AboutListBlock) => void
}

export default function ListBlockEditor({ block, onUpdate }: ListBlockEditorProps) {
  const handleStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({
      ...block,
      style: e.target.value as 'bullet' | 'numbered'
    })
  }

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...block.items]
    newItems[index] = value
    onUpdate({
      ...block,
      items: newItems
    })
  }

  const handleAddItem = () => {
    onUpdate({
      ...block,
      items: [...block.items, '']
    })
  }

  const handleRemoveItem = (index: number) => {
    const newItems = block.items.filter((_, i) => i !== index)
    onUpdate({
      ...block,
      items: newItems.length > 0 ? newItems : ['']
    })
  }

  return (
    <div className="about-list-block-editor">
      <div className="about-list-block-editor__field">
        <label className="about-list-block-editor__label">
          Style
        </label>
        <select
          value={block.style}
          onChange={handleStyleChange}
          className="about-list-block-editor__select"
        >
          <option value="bullet">Bullet List</option>
          <option value="numbered">Numbered List</option>
        </select>
      </div>

      <div className="about-list-block-editor__items">
        <label className="about-list-block-editor__label">
          Items
        </label>
        {block.items.map((item, index) => (
          <div key={index} className="about-list-block-editor__item">
            <input
              type="text"
              value={item}
              onChange={(e) => handleItemChange(index, e.target.value)}
              className="about-list-block-editor__input"
              placeholder={`Item ${index + 1}`}
            />
            <button
              type="button"
              onClick={() => handleRemoveItem(index)}
              className="about-list-block-editor__remove"
              disabled={block.items.length === 1}
            >
              🗑️
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddItem}
          className="about-list-block-editor__add"
        >
          + Add Item
        </button>
      </div>
    </div>
  )
}

