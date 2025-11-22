/**
 * Layout Types & Interfaces
 * Detail layout templates and slot definitions
 * 
 * Created: 2025-11-16
 * Updated: 2025-11-21 - Renamed to DetailLayoutTemplate and DetailLayoutConfig for clarity
 */

import type { Block } from './blocks'

/**
 * Detail Page Layout Template
 * All available layout templates for detail pages with blocks (project detail, blog post detail, etc.)
 * 
 * Note: This is different from SectionDetailLayoutType in sectionLayouts.ts which is used for section configs.
 * This type is used for detail page configurations with blocks and slots.
 */
export type DetailPageLayoutTemplate =
  | 'sidebar-left'
  | 'sidebar-right'
  | 'full-width'
  | 'two-column'
  | 'centered'
  | 'masonry'
  | 'split-screen'
  | 'hero-content'
  | 'carousel-layout'
  | 'sticky-sidebar'

/**
 * @deprecated Use DetailPageLayoutTemplate instead
 */
export type DetailLayoutTemplate = DetailPageLayoutTemplate

/**
 * Layout Slots
 * Defines where blocks can be placed in each layout template
 */
export interface LayoutSlots {
  sidebar?: Block[]
  content?: Block[]
  column1?: Block[]
  column2?: Block[]
  hero?: Block[]
  left?: Block[]
  right?: Block[]
  carousel?: Block[]
}

/**
 * Detail Page Layout Configuration
 * Complete layout configuration with template and slots for detail pages
 * Used for project detail pages, blog post detail pages, etc.
 */
export interface DetailPageLayoutConfig {
  template: DetailPageLayoutTemplate
  slots: LayoutSlots
}

/**
 * @deprecated Use DetailPageLayoutConfig instead
 */
export interface DetailLayoutConfig {
  template: DetailLayoutTemplate
  slots: LayoutSlots
}

