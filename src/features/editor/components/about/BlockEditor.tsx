'use client'

import { 
  type AboutBlock,
  type AboutHeadingBlock,
  type AboutTextBlock,
  type AboutListBlock,
  type AboutQuoteBlock,
  type AboutLinkBlock,
  type AboutImageBlock,
  type AboutCodeBlock
} from '../../types/about'
import HeadingBlockEditor from './blocks/HeadingBlockEditor'
import TextBlockEditor from './blocks/TextBlockEditor'
import ListBlockEditor from './blocks/ListBlockEditor'
import QuoteBlockEditor from './blocks/QuoteBlockEditor'
import LinkBlockEditor from './blocks/LinkBlockEditor'
import ImageBlockEditor from './blocks/ImageBlockEditor'
import DividerBlockEditor from './blocks/DividerBlockEditor'
import CodeBlockEditor from './blocks/CodeBlockEditor'

interface BlockEditorProps {
  block: AboutBlock
  index: number
  totalBlocks: number
  onUpdate: (block: AboutBlock) => void
  onDelete: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
}

export default function BlockEditor({
  block,
  index,
  totalBlocks,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown
}: BlockEditorProps) {
  const renderBlockEditor = () => {
    switch (block.type) {
      case 'heading':
        return (
          <HeadingBlockEditor
            block={block}
            onUpdate={onUpdate}
          />
        )
      case 'text':
        return (
          <TextBlockEditor
            block={block}
            onUpdate={onUpdate}
          />
        )
      case 'list':
        return (
          <ListBlockEditor
            block={block}
            onUpdate={onUpdate}
          />
        )
      case 'quote':
        return (
          <QuoteBlockEditor
            block={block}
            onUpdate={onUpdate}
          />
        )
      case 'link':
        return (
          <LinkBlockEditor
            block={block}
            onUpdate={onUpdate}
          />
        )
      case 'image':
        return (
          <ImageBlockEditor
            block={block}
            onUpdate={onUpdate}
          />
        )
      case 'divider':
        return (
          <DividerBlockEditor
            block={block}
            onUpdate={onUpdate}
          />
        )
      case 'code':
        return (
          <CodeBlockEditor
            block={block}
            onUpdate={onUpdate}
          />
        )
      default:
        return <div>Unknown block type</div>
    }
  }

  return (
    <div className="about-block-editor">
      <div className="about-block-editor__header">
        <div className="about-block-editor__info">
          <span className="about-block-editor__type">
            {block.type === 'heading' && '📝'}
            {block.type === 'text' && '📄'}
            {block.type === 'list' && '•'}
            {block.type === 'quote' && '💬'}
            {block.type === 'link' && '🔗'}
            {block.type === 'image' && '🖼️'}
            {block.type === 'divider' && '➖'}
            {block.type === 'code' && '💻'}
            {' '}
            {block.type.charAt(0).toUpperCase() + block.type.slice(1)}
          </span>
          <span className="about-block-editor__index">
            Block #{index + 1}
          </span>
        </div>
        <div className="about-block-editor__actions">
          {onMoveUp && (
            <button
              type="button"
              onClick={onMoveUp}
              className="about-block-editor__action"
              title="Move up"
            >
              ↑
            </button>
          )}
          {onMoveDown && (
            <button
              type="button"
              onClick={onMoveDown}
              className="about-block-editor__action"
              title="Move down"
            >
              ↓
            </button>
          )}
          <button
            type="button"
            onClick={onDelete}
            className="about-block-editor__action about-block-editor__action--delete"
            title="Delete block"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="about-block-editor__content">
        {renderBlockEditor()}
      </div>
    </div>
  )
}

