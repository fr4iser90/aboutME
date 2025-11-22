/**
 * Block Renderer
 * Main component that renders different block types
 * 
 * Created: 2025-11-16
 */

'use client'

import React from 'react'
import type { Block, BlockContext } from '../../types/blocks'
import type { MarkdownSection } from '@/features/shared/services/markdownParser'
import HeadingBlock from './HeadingBlock'
import LinkBlock from './LinkBlock'
import ImageBlock from './ImageBlock'
import ScreenshotBlock from './ScreenshotBlock'
import VideoBlock from './VideoBlock'
import TextBlock from './TextBlock'
import MarkdownBlock from './MarkdownBlock'
import SectionBlock from './SectionBlock'
import GridBlock from './GridBlock'
import NavigationBlock from './NavigationBlock'
import CodeBlock from './CodeBlock'
import QuoteBlock from './QuoteBlock'
import CalloutBlock from './CalloutBlock'
import StatsBlock from './StatsBlock'
import SeparatorBlock from './SeparatorBlock'
import SpacerBlock from './SpacerBlock'
import EmbedBlock from './EmbedBlock'
import TableBlock from './TableBlock'
import ListBlock from './ListBlock'

interface BlockRendererProps {
  block: Block
  context?: BlockContext
  githubUrl?: string
  projectName?: string
  markdownSections?: MarkdownSection[]
  isEditMode?: boolean
  onSectionsReorder?: (newOrder: MarkdownSection[]) => void
}

/**
 * Block Renderer
 * Renders the appropriate block component based on block type
 */
export default function BlockRenderer({ 
  block, 
  context = 'content',
  githubUrl,
  projectName,
  markdownSections,
  isEditMode = false,
  onSectionsReorder
}: BlockRendererProps) {
  try {
    switch (block.type) {
      case 'heading':
        return <HeadingBlock block={block} context={context} />
      
      case 'link':
        return <LinkBlock block={block} context={context} />
      
      case 'image':
        return <ImageBlock block={block} context={context} />
      
      case 'screenshot':
        return <ScreenshotBlock block={block} context={context} />
      
      case 'video':
        return <VideoBlock block={block} context={context} />
      
      case 'text':
        return <TextBlock block={block} context={context} />
      
      case 'markdown':
        return <MarkdownBlock block={block} context={context} githubUrl={githubUrl} projectName={projectName} />
      
      case 'section':
        return <SectionBlock block={block} context={context} />
      
      case 'grid':
        return <GridBlock block={block} context={context} githubUrl={githubUrl} projectName={projectName} markdownSections={markdownSections} />
      
      case 'navigation':
        return (
          <NavigationBlock 
            block={block} 
            context={context} 
            sections={markdownSections}
            isEditMode={isEditMode}
            onSectionsReorder={onSectionsReorder}
          />
        )
      
      case 'code':
        return <CodeBlock block={block} context={context} />
      
      case 'quote':
        return <QuoteBlock block={block} context={context} />
      
      case 'callout':
        return <CalloutBlock block={block} context={context} />
      
      case 'stats':
        return <StatsBlock block={block} context={context} />
      
      case 'separator':
        return <SeparatorBlock block={block} context={context} />
      
      case 'spacer':
        return <SpacerBlock block={block} context={context} />
      
      case 'embed':
        return <EmbedBlock block={block} context={context} />
      
      case 'table':
        return <TableBlock block={block} context={context} />
      
      case 'list':
        return <ListBlock block={block} context={context} />
      
      default:
        console.warn(`Unknown block type: ${(block as any).type}`)
        return null
    }
  } catch (error) {
    console.error(`Error rendering block ${block.id}:`, error)
    return null
  }
}

