/**
 * Sidebar Right Layout
 * Content on left, sidebar on right
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

interface SidebarRightLayoutProps {
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
 * Sidebar Right Layout
 * Renders content on left and sidebar on right
 */
export default function SidebarRightLayout({ 
  slots, 
  markdownSections, 
  githubUrl, 
  projectName,
  isEditMode = false,
  onSectionsReorder,
  draggingBlockType = null,
  isDragging = false
}: SidebarRightLayoutProps) {
  const sidebarBlocks = slots.sidebar || []
  const contentBlocks = slots.content || []

  return (
    <div className="project-modal-layout project-modal-layout--sidebar-right">
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
    </div>
  )
}

