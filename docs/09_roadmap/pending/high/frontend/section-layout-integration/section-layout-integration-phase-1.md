# Phase 1: Type Definitions and Interfaces

## Overview

Create type definitions and extend interfaces to support detail layouts and media layouts in section configurations.

**Estimated Time**: 4 hours
**Status**: Completed
**Progress**: 100%
**Completed**: 2025-11-21T17:26:56.000Z

---

## Tasks

### 1. Create Section Layout Types File

- [x] Create `src/features/shared/types/sectionLayouts.ts`
- [x] Define `DetailLayoutType` union type
- [x] Define `MediaLayoutType` union type
- [x] Export types for use in other files

**Code Structure:**
```typescript
export type DetailLayoutType = 
  | 'sidebar-left'
  | 'two-column'
  | 'masonry'
  | 'centered'
  | 'full-width'
  | null

export type MediaLayoutType = 
  | 'single'
  | 'grid'
  | 'gallery'
  | 'carousel'
  | 'video'
  | 'mixed'
  | null
```

---

### 2. Extend SectionLayoutConfig Interface

- [x] Update `src/features/shared/utils/layoutConfig.ts`
- [x] Import new types from sectionLayouts.ts
- [x] Extend `SectionLayoutConfig` interface
- [x] Add `detailLayout?: DetailLayoutType`
- [x] Add `mediaLayout?: MediaLayoutType`
- [x] Add `listColumns?: number`
- [x] Add `mediaColumns?: number`

**Updated Interface:**
```typescript
export interface SectionLayoutConfig {
  template: string // List layout (existing)
  listColumns?: number
  detailLayout?: DetailLayoutType
  mediaLayout?: MediaLayoutType
  mediaColumns?: number
  [key: string]: any
}
```

---

### 3. Add Validation Functions

- [x] Create `validateDetailLayout()` function
- [x] Create `validateMediaLayout()` function
- [x] Add JSDoc comments
- [x] Export validation functions

**Validation Functions:**
```typescript
export function validateDetailLayout(layout: string | null): DetailLayoutType {
  const validLayouts: DetailLayoutType[] = [
    'sidebar-left',
    'two-column',
    'masonry',
    'centered',
    'full-width',
    null
  ]
  return validLayouts.includes(layout as DetailLayoutType) 
    ? (layout as DetailLayoutType) 
    : 'sidebar-left'
}

export function validateMediaLayout(layout: string | null): MediaLayoutType {
  const validLayouts: MediaLayoutType[] = [
    'single',
    'grid',
    'gallery',
    'carousel',
    'video',
    'mixed',
    null
  ]
  return validLayouts.includes(layout as MediaLayoutType) 
    ? (layout as MediaLayoutType) 
    : 'grid'
}
```

---

### 4. Create Migration Helper

- [x] Create `migrateSectionLayouts()` function
- [x] Add defaults for projects section
- [x] Add defaults for blog section
- [x] Handle missing fields gracefully
- [x] Add JSDoc comments

**Migration Function:**
```typescript
export function migrateSectionLayouts(
  config: SectionLayoutsConfig
): SectionLayoutsConfig {
  const migrated = { ...config }
  
  // Migrate projects section
  if (migrated.projects) {
    if (!migrated.projects.detailLayout) {
      migrated.projects.detailLayout = 'sidebar-left'
    }
    if (!migrated.projects.mediaLayout) {
      migrated.projects.mediaLayout = 'grid'
    }
    if (!migrated.projects.listColumns) {
      migrated.projects.listColumns = 3
    }
  }
  
  // Migrate blog section
  if (migrated.blog) {
    if (!migrated.blog.detailLayout) {
      migrated.blog.detailLayout = 'sidebar-left'
    }
    if (!migrated.blog.listColumns) {
      migrated.blog.listColumns = 2
    }
  }
  
  return migrated
}
```

---

### 5. Update API Route

- [x] Update `src/app/api/admin/config/sections/route.ts`
- [x] Add migration call when loading configs
- [x] Validate new fields when saving
- [x] Ensure backward compatibility

**API Updates:**
```typescript
// In GET handler
const config = await loadConfig()
const migrated = migrateSectionLayouts(config.sectionLayouts || {})
return { sectionLayouts: migrated }

// In POST handler
const sectionLayouts = body.config.sectionLayouts
// Validate and migrate before saving
const validated = migrateSectionLayouts(sectionLayouts)
await saveConfig({ sectionLayouts: validated })
```

---

### 6. Write Tests

- [x] Test file: `frontend/tests/unit/sectionLayouts.test.js`
- [x] Test type validation functions
- [x] Test migration helper
- [x] Test default value assignment
- [x] Test backward compatibility

**Test Cases:**
- validateDetailLayout with valid values
- validateDetailLayout with invalid values
- validateMediaLayout with valid values
- validateMediaLayout with invalid values
- migrateSectionLayouts adds missing fields
- migrateSectionLayouts preserves existing fields
- migrateSectionLayouts handles empty config

---

## Success Criteria

- [x] All type definitions created
- [x] Interfaces extended correctly
- [x] Validation functions work
- [x] Migration helper tested
- [x] API handles new fields
- [x] Tests pass
- [x] No TypeScript errors

---

## Files Modified

- `src/features/shared/utils/layoutConfig.ts`
- `src/app/api/admin/config/sections/route.ts`

## Files Created

- `src/features/shared/types/sectionLayouts.ts`
- `frontend/tests/unit/sectionLayouts.test.js`

---

## Notes

- Keep backward compatibility
- Use null for optional layouts (sections that don't need them)
- Default values ensure old configs still work
- Migration happens automatically on load

