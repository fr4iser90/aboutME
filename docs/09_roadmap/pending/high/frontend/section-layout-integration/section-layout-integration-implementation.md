# Section Layout Integration - Implementation Plan

## 1. Project Overview

- **Feature/Component Name**: Section Layout Integration

- **Priority**: High

- **Category**: frontend

- **Status**: pending

- **Estimated Time**: 16 hours

- **Dependencies**: None

- **Related Issues**: Layout system inconsistency (separate Project Page Layouts and Project Screenshot Layouts)

- **Created**: 2025-11-21T17:23:25.000Z

---

## 2. Technical Requirements

- **Tech Stack**: TypeScript, React, Next.js

- **Architecture Pattern**: Component-based architecture

- **Database Changes**: None (config files only)

- **API Changes**: None (config API already exists)

- **Frontend Changes**: 
  - Extend SectionLayoutConfig interface
  - Update SectionLayoutEditor component
  - Modify ProjectModal to use section config
  - Modify BlogModal to use section config
  - Update ProjectLayout to use section config
  - Remove separate PageLayout usage in modals

- **Backend Changes**: None

---

## 3. File Impact Analysis

#### Files to Modify:

- [ ] `src/features/shared/utils/layoutConfig.ts` - Extend SectionLayoutConfig interface with detailLayout and mediaLayout
- [ ] `src/features/admin/components/LayoutEditor/SectionLayoutEditor.tsx` - Add UI for detail and media layout selection
- [ ] `src/features/portfolio/components/ProjectModal.tsx` - Use sectionLayouts.projects.detailLayout instead of PageLayout
- [ ] `src/features/blog/components/BlogModal.tsx` - Use sectionLayouts.blog.detailLayout instead of fixed layout
- [ ] `src/features/portfolio/components/ProjectLayout.tsx` - Use sectionLayouts.projects.mediaLayout instead of project.layout
- [ ] `src/features/portfolio/utils/frontmatterToBlocks.ts` - Update to use section config for detail layouts
- [ ] `src/app/api/admin/config/sections/route.ts` - Ensure API handles new fields

#### Files to Create:

- [ ] `src/features/shared/types/sectionLayouts.ts` - Type definitions for detail and media layouts
- [ ] `src/features/portfolio/components/layouts/DetailLayoutRenderer.tsx` - Reusable component for detail layouts
- [ ] `src/features/portfolio/components/layouts/MediaLayoutRenderer.tsx` - Reusable component for media layouts

#### Files to Delete:

- [ ] None (keep PageLayout.tsx for backward compatibility, mark as deprecated)

---

## 4. Implementation Phases

#### Phase 1: Type Definitions and Interfaces (4 hours)

- [ ] Create sectionLayouts.ts with new type definitions
- [ ] Extend SectionLayoutConfig interface
- [ ] Add DetailLayoutType and MediaLayoutType unions
- [ ] Update SectionLayoutsConfig interface
- [ ] Add validation functions
- [ ] Create migration helper for existing configs

#### Phase 2: Editor UI Extension (6 hours)

- [ ] Add detail layout selector to SectionLayoutEditor
- [ ] Add media layout selector to SectionLayoutEditor
- [ ] Add conditional rendering (only show if section supports it)
- [ ] Add preview for detail layouts
- [ ] Add preview for media layouts
- [ ] Update save/load functions
- [ ] Add default values for new fields

#### Phase 3: Modal and Component Integration (4 hours)

- [ ] Update ProjectModal to use sectionLayouts.projects.detailLayout
- [ ] Update BlogModal to use sectionLayouts.blog.detailLayout
- [ ] Create DetailLayoutRenderer component
- [ ] Create MediaLayoutRenderer component
- [ ] Update ProjectLayout to use sectionLayouts.projects.mediaLayout
- [ ] Add fallback to defaults if not configured
- [ ] Test all modals with new layouts

#### Phase 4: Cleanup and Documentation (2 hours)

- [ ] Mark PageLayout.tsx as deprecated (add JSDoc comment)
- [ ] Update all documentation files
- [ ] Remove unused imports
- [ ] Update LAYOUT_SYSTEM_DOCUMENTATION.md
- [ ] Update APPEARANCE_SYSTEM_EXPLANATION.md
- [ ] Create migration guide for existing configs

---

## 5. Code Standards & Patterns

- **Architectural Standards**: Follow existing component patterns

- **Coding Style**: ESLint with existing project rules, Prettier formatting

- **Naming Conventions**: camelCase for variables/functions, PascalCase for classes/components

- **Error Handling**: Try-catch with specific error types, proper error logging

- **Logging**: Console logging for development, structured logging for production

- **Testing**: Jest framework, test new components

- **Documentation**: JSDoc for all public methods, README updates

---

## 6. Security Considerations

- [ ] Input validation for layout config values
- [ ] Sanitize user-provided layout names
- [ ] Validate layout type matches allowed values
- [ ] Prevent XSS in layout rendering
- [ ] Rate limiting for config updates (already exists)

---

## 7. Performance Requirements

- **Response Time**: < 100ms for layout config loading
- **Throughput**: N/A (config operations are infrequent)
- **Memory Usage**: Minimal (configs are small)
- **Database Queries**: None (file-based config)
- **Caching Strategy**: Cache section layouts in memory, invalidate on save

---

## 8. Testing Strategy

#### Unit Tests:

- [ ] Test file: `frontend/tests/unit/SectionLayoutConfig.test.js`
- [ ] Test cases: 
  - Type validation
  - Default value assignment
  - Config merging
  - Migration from old format
- [ ] Mock requirements: None

#### Integration Tests:

- [ ] Test file: `frontend/tests/integration/SectionLayoutEditor.test.jsx`
- [ ] Test scenarios:
  - Load section layouts
  - Save section layouts with new fields
  - Detail layout selection
  - Media layout selection
- [ ] Test data: Mock config files

#### Component Tests:

- [ ] Test file: `frontend/tests/unit/DetailLayoutRenderer.test.jsx`
- [ ] Test cases:
  - Render different detail layouts
  - Fallback to default
  - Error handling

- [ ] Test file: `frontend/tests/unit/MediaLayoutRenderer.test.jsx`
- [ ] Test cases:
  - Render different media layouts
  - Fallback to default
  - Error handling

---

## 9. Documentation Requirements

#### Code Documentation:

- [ ] JSDoc comments for all new interfaces and types
- [ ] JSDoc comments for DetailLayoutRenderer
- [ ] JSDoc comments for MediaLayoutRenderer
- [ ] README updates with new section layout structure

#### User Documentation:

- [ ] Update LAYOUT_SYSTEM_DOCUMENTATION.md
- [ ] Update APPEARANCE_SYSTEM_EXPLANATION.md
- [ ] Create migration guide for existing configs
- [ ] Update Section Layout Editor user guide

---

## 10. Deployment Checklist

#### Pre-deployment:

- [ ] All tests passing (unit, integration, component)
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Migration script tested
- [ ] Backward compatibility verified

#### Deployment:

- [ ] Backup existing config files
- [ ] Run migration script if needed
- [ ] Verify config files are valid JSON
- [ ] Test in staging environment

#### Post-deployment:

- [ ] Monitor for errors in layout rendering
- [ ] Verify all modals work correctly
- [ ] Check section editor functionality
- [ ] Collect user feedback

---

## 11. Rollback Plan

- [ ] Keep old PageLayout.tsx as fallback
- [ ] Config files can be manually reverted
- [ ] No database changes, so rollback is simple
- [ ] Document rollback procedure

---

## 12. Success Criteria

- [ ] All sections have consistent layout structure
- [ ] Detail layouts work for Projects and Blog
- [ ] Media layouts work for Projects (and can be reused for Blog)
- [ ] SectionLayoutEditor shows new options
- [ ] All modals use section configs
- [ ] No breaking changes for existing configs
- [ ] Documentation updated
- [ ] Tests pass

---

## 13. Risk Assessment

#### High Risk:

- [ ] Breaking existing configs - Mitigation: Migration helper, backward compatibility
- [ ] Modal rendering issues - Mitigation: Fallback to defaults, thorough testing

#### Medium Risk:

- [ ] Performance impact from additional config loading - Mitigation: Caching, lazy loading
- [ ] User confusion with new options - Mitigation: Clear UI, documentation

#### Low Risk:

- [ ] Type errors during migration - Mitigation: TypeScript strict mode, validation

---

## 14. AI Auto-Implementation Instructions

#### Task Database Fields:

- **source_type**: 'markdown_doc'
- **source_path**: 'docs/09_roadmap/pending/high/frontend/section-layout-integration/section-layout-integration-implementation.md'
- **category**: 'frontend'
- **automation_level**: 'semi_auto'
- **confirmation_required**: true
- **max_attempts**: 3
- **git_branch_required**: true
- **new_chat_required**: true

#### AI Execution Context:

```json
{
  "requires_new_chat": true,
  "git_branch_name": "feature/section-layout-integration",
  "confirmation_keywords": ["fertig", "done", "complete"],
  "fallback_detection": true,
  "max_confirmation_attempts": 3,
  "timeout_seconds": 300
}
```

#### Success Indicators:

- [ ] All checkboxes in phases completed
- [ ] Tests pass
- [ ] No TypeScript errors
- [ ] No build errors
- [ ] Code follows standards
- [ ] Documentation updated

---

## 15. Initial Prompt Documentation

#### Original Prompt (Sanitized):

```markdown
# Initial Prompt: Section Layout Integration

## User Request:

Integrate detail layouts and media layouts into section layouts. Remove separate Project Page Layouts and Project Screenshot Layouts. Make everything reusable and consistent. Projects is a section, so detail and media layouts should be part of section configs.

## Language Detection:

- **Original Language**: German
- **Translation Status**: ✅ Converted to English
- **Sanitization Status**: ✅ No credentials or personal data

## Prompt Analysis:

- **Intent**: Refactor layout system to integrate all layout types into sections
- **Complexity**: High (touches multiple components and configs)
- **Scope**: Layout system refactoring, UI updates, component integration
- **Dependencies**: None

## Sanitization Applied:

- [x] Credentials removed (none found)
- [x] Personal information anonymized (none found)
- [x] Sensitive file paths generalized
- [x] Language converted to English
- [x] Technical terms preserved
- [x] Intent and requirements maintained
```

---

## 16. References & Resources

- **Technical Documentation**: 
  - LAYOUT_SYSTEM_DETAIL_ANALYSE.md
  - LAYOUT_SYSTEM_KORREKTUR.md
  - LAYOUT_SYSTEM_SOLL_ZUSTAND.md
- **API References**: 
  - `/api/admin/config/sections` - Section layout config API
- **Design Patterns**: 
  - Component composition pattern
  - Configuration-driven rendering
- **Best Practices**: 
  - TypeScript strict mode
  - React component patterns
- **Similar Implementations**: 
  - SectionLayoutEditor.tsx - Existing section editor
  - ProjectModal.tsx - Current modal implementation

---

## 17. Detailed Implementation Steps

### Step 1: Type Definitions

```typescript
// src/features/shared/types/sectionLayouts.ts

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

export interface SectionLayoutConfig {
  template: string // List layout (existing)
  listColumns?: number
  detailLayout?: DetailLayoutType
  mediaLayout?: MediaLayoutType
  mediaColumns?: number
  [key: string]: any
}
```

### Step 2: Editor UI Updates

Add to SectionLayoutEditor:
- Detail Layout selector (conditional, only for projects/blog)
- Media Layout selector (conditional, only for projects/blog)
- Column inputs for listColumns and mediaColumns
- Preview sections

### Step 3: Modal Updates

ProjectModal:
```typescript
const sectionLayouts = await getAllSectionLayouts()
const detailLayout = sectionLayouts.projects?.detailLayout || 'sidebar-left'
// Use DetailLayoutRenderer with detailLayout
```

BlogModal:
```typescript
const sectionLayouts = await getAllSectionLayouts()
const detailLayout = sectionLayouts.blog?.detailLayout || 'sidebar-left'
// Use DetailLayoutRenderer with detailLayout
```

### Step 4: ProjectLayout Update

```typescript
const sectionLayouts = await getAllSectionLayouts()
const mediaLayout = sectionLayouts.projects?.mediaLayout || project.layout || 'single'
// Use MediaLayoutRenderer with mediaLayout
```

---

## 18. Migration Strategy

### Existing Configs:

```json
{
  "sectionLayouts": {
    "projects": {
      "template": "grid"
    }
  }
}
```

### New Configs:

```json
{
  "sectionLayouts": {
    "projects": {
      "template": "grid",
      "listColumns": 3,
      "detailLayout": "sidebar-left",
      "mediaLayout": "grid",
      "mediaColumns": 2
    },
    "blog": {
      "template": "card-grid",
      "listColumns": 2,
      "detailLayout": "sidebar-left",
      "mediaLayout": "gallery"
    }
  }
}
```

### Migration Helper:

```typescript
function migrateSectionLayouts(config: SectionLayoutsConfig): SectionLayoutsConfig {
  // Add defaults for projects if detailLayout/mediaLayout missing
  if (config.projects && !config.projects.detailLayout) {
    config.projects.detailLayout = 'sidebar-left'
  }
  if (config.projects && !config.projects.mediaLayout) {
    config.projects.mediaLayout = 'grid'
  }
  // Add defaults for blog if detailLayout missing
  if (config.blog && !config.blog.detailLayout) {
    config.blog.detailLayout = 'sidebar-left'
  }
  return config
}
```

---

## 19. Backward Compatibility

- Keep PageLayout.tsx for now (mark as deprecated)
- Default values ensure old configs still work
- Migration helper adds missing fields
- No breaking changes to existing APIs

---

## 20. Future Enhancements

- [ ] Add detail layouts for other sections (timeline, skills)
- [ ] Add media layouts for blog images
- [ ] Add preview in editor for all layout types
- [ ] Add layout templates/presets
- [ ] Add layout export/import

