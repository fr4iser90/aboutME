/**
 * Hero Content Layout
 * Hero slot at top, then sidebar + content
 * 
 * Created: 2025-11-16
 */

'use client'

import React from 'react'
import type { LayoutSlots } from '../../types/layouts'
import BlockRenderer from '../blocks/BlockRenderer'
import DraggableBlock from '@/features/editor/components/DraggableBlock'
import SlotPlaceholder from '@/features/editor/components/SlotPlaceholder'
import type { BlockType } from '../../types/blocks'
import type { MarkdownSection } from '@/features/shared/services/markdownParser'

interface HeroContentLayoutProps {
  slots: LayoutSlots
  markdownSections?: MarkdownSection[]
  githubUrl?: string
  projectName?: string
  isEditMode?: boolean
  onSectionsReorder?: (newOrder: MarkdownSection[]) => void
  draggingBlockType?: BlockType | null
  isDragging?: boolean
}

/**
 * Hero Content Layout
 * Renders hero at top, then sidebar + content
 */
export default function HeroContentLayout({ 
  slots, 
  markdownSections, 
  githubUrl, 
  projectName,
  isEditMode = false,
  onSectionsReorder,
  draggingBlockType = null,
  isDragging = false
}: HeroContentLayoutProps) {
  const heroBlocks = slots.hero || []
  const sidebarBlocks = slots.sidebar || []
  const contentBlocks = slots.content || []

  return (
    <div className="project-modal-layout project-modal-layout--hero-content">
        <div className="project-content project-content--hero">
        {/* Platzhalter GANZ OBEN */}
        {isEditMode && (
          <SlotPlaceholder
            slot="hero"
            position="top"
            blockType={draggingBlockType || undefined}
            isEditMode={isEditMode}
            isDragging={isDragging}
          />
        )}
        
        {/* Hero Blocks */}
        {heroBlocks.map((block, index) => (
          <React.Fragment key={block.id}>
            {isEditMode ? (
              <DraggableBlock
                block={block}
                slot="hero"
                index={index}
                isEditMode={isEditMode}
                context="hero"
                githubUrl={githubUrl}
                projectName={projectName}
                markdownSections={markdownSections}
                onSectionsReorder={onSectionsReorder}
              />
            ) : (
            <BlockRenderer
              block={block}
              context="hero"
              githubUrl={githubUrl}
              projectName={projectName}
              markdownSections={markdownSections}
                isEditMode={isEditMode}
                onSectionsReorder={onSectionsReorder}
              />
            )}
            
            {/* Platzhalter ZWISCHEN Blocks */}
            {isEditMode && (
              <SlotPlaceholder
                slot="hero"
                position={index + 1}
                blockType={draggingBlockType || undefined}
                isEditMode={isEditMode}
                isDragging={isDragging}
            />
            )}
          </React.Fragment>
        ))}
        
        {/* Platzhalter GANZ UNTEN */}
        {isEditMode && (
          <SlotPlaceholder
            slot="hero"
            position="bottom"
            blockType={draggingBlockType || undefined}
            isEditMode={isEditMode}
            isDragging={isDragging}
          />
        )}
        </div>
      
      <div className="project-modal-layout">
          <aside className="project-sidebar">
          {/* Platzhalter GANZ OBEN */}
          {isEditMode && (
            <SlotPlaceholder
              slot="sidebar"
              position="top"
              blockType={draggingBlockType || undefined}
              isEditMode={isEditMode}
              isDragging={isDragging}
            />
          )}
          
          {/* Sidebar Blocks */}
          {sidebarBlocks.map((block, index) => (
            <React.Fragment key={block.id}>
              {isEditMode ? (
                <DraggableBlock
                  block={block}
                  slot="sidebar"
                  index={index}
                  isEditMode={isEditMode}
                  context="sidebar"
                  githubUrl={githubUrl}
                  projectName={projectName}
                  markdownSections={markdownSections}
                  onSectionsReorder={onSectionsReorder}
                />
              ) : (
              <BlockRenderer
                block={block}
                context="sidebar"
                markdownSections={markdownSections}
                githubUrl={githubUrl}
                projectName={projectName}
                  isEditMode={isEditMode}
                  onSectionsReorder={onSectionsReorder}
                />
              )}
              
              {/* Platzhalter ZWISCHEN Blocks */}
              {isEditMode && (
                <SlotPlaceholder
                  slot="sidebar"
                  position={index + 1}
                  blockType={draggingBlockType || undefined}
                  isEditMode={isEditMode}
                  isDragging={isDragging}
              />
              )}
            </React.Fragment>
          ))}
          
          {/* Platzhalter GANZ UNTEN */}
          {isEditMode && (
            <SlotPlaceholder
              slot="sidebar"
              position="bottom"
              blockType={draggingBlockType || undefined}
              isEditMode={isEditMode}
              isDragging={isDragging}
            />
          )}
          </aside>
        
        <main className="project-content">
          {/* Platzhalter GANZ OBEN */}
          {isEditMode && (
            <SlotPlaceholder
              slot="content"
              position="top"
              blockType={draggingBlockType || undefined}
              isEditMode={isEditMode}
              isDragging={isDragging}
            />
          )}
          
          {/* Content Blocks */}
          {contentBlocks.map((block, index) => (
            <React.Fragment key={block.id}>
              {isEditMode ? (
                <DraggableBlock
                  block={block}
                  slot="content"
                  index={index}
                  isEditMode={isEditMode}
                  context="content"
                  githubUrl={githubUrl}
                  projectName={projectName}
                  markdownSections={markdownSections}
                  onSectionsReorder={onSectionsReorder}
                />
              ) : (
            <BlockRenderer
              block={block}
              context="content"
              githubUrl={githubUrl}
              projectName={projectName}
              markdownSections={markdownSections}
                  isEditMode={isEditMode}
                  onSectionsReorder={onSectionsReorder}
                />
              )}
              
              {/* Platzhalter ZWISCHEN Blocks */}
              {isEditMode && (
                <SlotPlaceholder
                  slot="content"
                  position={index + 1}
                  blockType={draggingBlockType || undefined}
                  isEditMode={isEditMode}
                  isDragging={isDragging}
            />
              )}
            </React.Fragment>
          ))}
          
          {/* Platzhalter GANZ UNTEN */}
          {isEditMode && (
            <SlotPlaceholder
              slot="content"
              position="bottom"
              blockType={draggingBlockType || undefined}
              isEditMode={isEditMode}
              isDragging={isDragging}
            />
          )}
        </main>
      </div>
    </div>
  )
}

