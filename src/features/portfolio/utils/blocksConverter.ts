/**
 * Blocks Converter
 * Converts About-specific blocks to Block types
 */

import type { AboutBlock, AboutTextSection } from '@/features/editor/types/about'
import type { Block, HeadingBlock, TextBlock, ListBlock, QuoteBlock, LinkBlock, ImageBlock, SeparatorBlock, CodeBlock } from '../types/blocks'

/**
 * Convert About Block to Block
 */
export function convertBlock(aboutBlock: AboutBlock): Block {
  const baseBlock = {
    id: aboutBlock.id,
    animation: undefined,
    spacing: undefined,
    responsive: undefined
  }

  switch (aboutBlock.type) {
    case 'heading':
      return {
        ...baseBlock,
        type: 'heading',
        level: aboutBlock.level,
        content: aboutBlock.content
      } as HeadingBlock

    case 'text':
      return {
        ...baseBlock,
        type: 'text',
        content: aboutBlock.content,
        style: 'default'
      } as TextBlock

    case 'list':
      return {
        ...baseBlock,
        type: 'list',
        style: aboutBlock.style === 'numbered' ? 'numbered' : 'bullet',
        items: aboutBlock.items
      } as ListBlock

    case 'quote':
      return {
        ...baseBlock,
        type: 'quote',
        text: aboutBlock.content,
        author: aboutBlock.author,
        style: 'default'
      } as QuoteBlock

    case 'link':
      return {
        ...baseBlock,
        type: 'link',
        label: aboutBlock.label,
        url: aboutBlock.url,
        target: '_blank',
        rel: 'noopener noreferrer'
      } as LinkBlock

    case 'image':
      return {
        ...baseBlock,
        type: 'image',
        imageUrl: aboutBlock.imageUrl,
        alt: aboutBlock.alt,
        caption: aboutBlock.caption
      } as ImageBlock

    case 'divider':
      return {
        ...baseBlock,
        type: 'separator',
        style: 'line',
        spacingSize: 'medium'
      } as SeparatorBlock

    case 'code':
      return {
        ...baseBlock,
        type: 'code',
        language: aboutBlock.language || 'text',
        code: aboutBlock.content,
        theme: 'dark',
        showLineNumbers: false
      } as CodeBlock

    default:
      // Fallback to text block
      return {
        ...baseBlock,
        type: 'text',
        content: '',
        style: 'default'
      } as TextBlock
  }
}

/**
 * Convert Section blocks to Blocks
 */
export function convertSectionBlocksToBlocks(section: AboutTextSection): Block[] {
  return section.blocks.map(block => convertBlock(block))
}

