/**
 * Section Layouts Tests
 * 
 * Tests for section layout type validation and migration
 * 
 * Created: 2025-11-21T17:26:56.000Z
 */

import { 
  validateDetailLayout, 
  validateMediaLayout, 
  migrateSectionLayouts 
} from '@/features/shared/types/sectionLayouts'

describe('Section Layouts', () => {
  describe('validateDetailLayout', () => {
    test('should return valid layout for sidebar-left', () => {
      expect(validateDetailLayout('sidebar-left')).toBe('sidebar-left')
    })

    test('should return valid layout for two-column', () => {
      expect(validateDetailLayout('two-column')).toBe('two-column')
    })

    test('should return valid layout for masonry', () => {
      expect(validateDetailLayout('masonry')).toBe('masonry')
    })

    test('should return valid layout for centered', () => {
      expect(validateDetailLayout('centered')).toBe('centered')
    })

    test('should return valid layout for full-width', () => {
      expect(validateDetailLayout('full-width')).toBe('full-width')
    })

    test('should return valid layout for null', () => {
      expect(validateDetailLayout(null)).toBe('sidebar-left')
    })

    test('should return default for invalid value', () => {
      expect(validateDetailLayout('invalid')).toBe('sidebar-left')
    })

    test('should return default for undefined', () => {
      expect(validateDetailLayout(undefined)).toBe('sidebar-left')
    })
  })

  describe('validateMediaLayout', () => {
    test('should return valid layout for single', () => {
      expect(validateMediaLayout('single')).toBe('single')
    })

    test('should return valid layout for grid', () => {
      expect(validateMediaLayout('grid')).toBe('grid')
    })

    test('should return valid layout for gallery', () => {
      expect(validateMediaLayout('gallery')).toBe('gallery')
    })

    test('should return valid layout for carousel', () => {
      expect(validateMediaLayout('carousel')).toBe('carousel')
    })

    test('should return valid layout for video', () => {
      expect(validateMediaLayout('video')).toBe('video')
    })

    test('should return valid layout for mixed', () => {
      expect(validateMediaLayout('mixed')).toBe('mixed')
    })

    test('should return default for null', () => {
      expect(validateMediaLayout(null)).toBe('grid')
    })

    test('should return default for invalid value', () => {
      expect(validateMediaLayout('invalid')).toBe('grid')
    })

    test('should return default for undefined', () => {
      expect(validateMediaLayout(undefined)).toBe('grid')
    })
  })

  describe('migrateSectionLayouts', () => {
    test('should add missing fields to projects section', () => {
      const config = {
        projects: {
          template: 'grid'
        }
      }
      const migrated = migrateSectionLayouts(config)
      
      expect(migrated.projects.detailLayout).toBe('sidebar-left')
      expect(migrated.projects.mediaLayout).toBe('grid')
      expect(migrated.projects.listColumns).toBe(3)
      expect(migrated.projects.template).toBe('grid')
    })

    test('should add missing fields to blog section', () => {
      const config = {
        blog: {
          template: 'card-grid'
        }
      }
      const migrated = migrateSectionLayouts(config)
      
      expect(migrated.blog.detailLayout).toBe('sidebar-left')
      expect(migrated.blog.listColumns).toBe(2)
      expect(migrated.blog.template).toBe('card-grid')
    })

    test('should preserve existing fields', () => {
      const config = {
        projects: {
          template: 'grid',
          detailLayout: 'two-column',
          mediaLayout: 'gallery',
          listColumns: 4
        }
      }
      const migrated = migrateSectionLayouts(config)
      
      expect(migrated.projects.detailLayout).toBe('two-column')
      expect(migrated.projects.mediaLayout).toBe('gallery')
      expect(migrated.projects.listColumns).toBe(4)
    })

    test('should handle empty config', () => {
      const config = {}
      const migrated = migrateSectionLayouts(config)
      
      expect(migrated).toEqual({})
    })

    test('should handle config with other sections', () => {
      const config = {
        skills: {
          template: 'list'
        },
        timeline: {
          template: 'vertical'
        }
      }
      const migrated = migrateSectionLayouts(config)
      
      expect(migrated.skills.template).toBe('list')
      expect(migrated.timeline.template).toBe('vertical')
    })
  })
})

