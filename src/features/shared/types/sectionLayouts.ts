/**
 * Section Layout Types
 * 
 * Type definitions for detail layouts and media layouts in section configurations
 * 
 * Created: 2025-11-21T17:23:25.000Z
 */

/**
 * Section Detail Layout Type
 * 
 * Layouts for detail pages within sections (project detail, blog post detail, etc.)
 * 
 * @example
 * const config: SectionLayoutConfig = {
 *   style: 'grid',
 *   detailLayout: 'sidebar-left'
 * }
 */
export type SectionDetailLayoutType = 
  | 'sidebar-left'
  | 'two-column'
  | 'masonry'
  | 'centered'
  | 'full-width'
  | null

/**
 * Section Media Layout Type
 * 
 * Layouts for media content within sections (screenshots, images, videos)
 * 
 * @example
 * const config: SectionLayoutConfig = {
 *   style: 'grid',
 *   mediaLayout: 'gallery'
 * }
 */
export type SectionMediaLayoutType = 
  | 'single'
  | 'grid'
  | 'gallery'
  | 'carousel'
  | 'video'
  | 'mixed'
  | null

/**
 * Validate Section Detail Layout
 * 
 * Validates and returns a valid SectionDetailLayoutType, or default if invalid
 * 
 * @param layout - Layout string to validate
 * @returns Valid SectionDetailLayoutType or default 'sidebar-left'
 */
export function validateDetailLayout(layout: string | null | undefined): SectionDetailLayoutType {
  const validLayouts: SectionDetailLayoutType[] = [
    'sidebar-left',
    'two-column',
    'masonry',
    'centered',
    'full-width',
    null
  ]
  
  if (layout === null || layout === undefined) {
    return 'sidebar-left'
  }
  
  return validLayouts.includes(layout as SectionDetailLayoutType) 
    ? (layout as SectionDetailLayoutType) 
    : 'sidebar-left'
}

/**
 * Validate Section Media Layout
 * 
 * Validates and returns a valid SectionMediaLayoutType, or default if invalid
 * 
 * @param layout - Layout string to validate
 * @returns Valid SectionMediaLayoutType or default 'grid'
 */
export function validateMediaLayout(layout: string | null | undefined): SectionMediaLayoutType {
  const validLayouts: SectionMediaLayoutType[] = [
    'single',
    'grid',
    'gallery',
    'carousel',
    'video',
    'mixed',
    null
  ]
  
  if (layout === null || layout === undefined) {
    return 'grid'
  }
  
  return validLayouts.includes(layout as SectionMediaLayoutType) 
    ? (layout as SectionMediaLayoutType) 
    : 'grid'
}


