# Phase 2: Editor UI Extension

## Overview

Extend SectionLayoutEditor to allow users to configure detail layouts and media layouts for each section.

**Estimated Time**: 6 hours
**Status**: Completed
**Progress**: 100%
**Completed**: 2025-11-21T17:26:56.000Z

---

## Tasks

### 1. Update Section Definitions

- [ ] Update `sections` array in SectionLayoutEditor.tsx
- [ ] Add `supportsDetailLayout` property
- [ ] Add `supportsMediaLayout` property
- [ ] Add `availableDetailLayouts` array
- [ ] Add `availableMediaLayouts` array

**Updated Structure:**
```typescript
const sections: Array<{
  id: SectionType
  name: string
  description: string
  availableTemplates: string[]
  supportsDetailLayout?: boolean
  supportsMediaLayout?: boolean
  availableDetailLayouts?: DetailLayoutType[]
  availableMediaLayouts?: MediaLayoutType[]
}> = [
  { 
    id: 'projects', 
    name: 'Projects', 
    description: 'Projects section layout',
    availableTemplates: ['grid', 'masonry', 'carousel', 'list'],
    supportsDetailLayout: true,
    supportsMediaLayout: true,
    availableDetailLayouts: ['sidebar-left', 'two-column', 'masonry', 'centered', 'full-width'],
    availableMediaLayouts: ['single', 'grid', 'gallery', 'carousel', 'video', 'mixed']
  },
  { 
    id: 'blog', 
    name: 'Blog', 
    description: 'Blog section layout',
    availableTemplates: ['grid', 'list', 'magazine', 'compact'],
    supportsDetailLayout: true,
    supportsMediaLayout: true,
    availableDetailLayouts: ['sidebar-left', 'two-column', 'centered', 'full-width'],
    availableMediaLayouts: ['single', 'grid', 'gallery']
  },
  // ... other sections
]
```

---

### 2. Add Detail Layout Selector

- [ ] Add detail layout selector UI component
- [ ] Show only if `supportsDetailLayout` is true
- [ ] Use radio buttons or select dropdown
- [ ] Show preview icons/descriptions
- [ ] Handle selection change

**UI Component:**
```typescript
{currentSection?.supportsDetailLayout && (
  <div className="section-layout-editor__detail-layout">
    <label className="section-layout-editor__label">Detail Layout</label>
    <div className="section-layout-editor__layout-grid">
      {currentSection.availableDetailLayouts?.map((layout) => (
        <button
          key={layout}
          onClick={() => handleDetailLayoutChange(selectedSection, layout)}
          className={`section-layout-editor__layout-card ${
            currentConfig.detailLayout === layout 
              ? 'section-layout-editor__layout-card--selected' 
              : ''
          }`}
        >
          <div className="section-layout-editor__layout-name">
            {layout ? layout.replace('-', ' ') : 'None'}
          </div>
        </button>
      ))}
    </div>
  </div>
)}
```

---

### 3. Add Media Layout Selector

- [ ] Add media layout selector UI component
- [ ] Show only if `supportsMediaLayout` is true
- [ ] Use radio buttons or select dropdown
- [ ] Show preview icons/descriptions
- [ ] Handle selection change

**UI Component:**
```typescript
{currentSection?.supportsMediaLayout && (
  <div className="section-layout-editor__media-layout">
    <label className="section-layout-editor__label">Media Layout</label>
    <div className="section-layout-editor__layout-grid">
      {currentSection.availableMediaLayouts?.map((layout) => (
        <button
          key={layout}
          onClick={() => handleMediaLayoutChange(selectedSection, layout)}
          className={`section-layout-editor__layout-card ${
            currentConfig.mediaLayout === layout 
              ? 'section-layout-editor__layout-card--selected' 
              : ''
          }`}
        >
          <div className="section-layout-editor__layout-name">
            {layout ? layout.replace('-', ' ') : 'None'}
          </div>
        </button>
      ))}
    </div>
  </div>
)}
```

---

### 4. Add Column Inputs

- [ ] Add listColumns input field
- [ ] Add mediaColumns input field
- [ ] Show only when relevant (grid layouts)
- [ ] Add number validation
- [ ] Add min/max constraints

**Input Components:**
```typescript
{currentConfig.template === 'grid' && (
  <div className="section-layout-editor__columns">
    <label className="section-layout-editor__label">Columns</label>
    <input
      type="number"
      min="1"
      max="6"
      value={currentConfig.listColumns || 3}
      onChange={(e) => handleColumnsChange(selectedSection, 'listColumns', parseInt(e.target.value))}
    />
  </div>
)}

{currentConfig.mediaLayout === 'grid' && (
  <div className="section-layout-editor__media-columns">
    <label className="section-layout-editor__label">Media Columns</label>
    <input
      type="number"
      min="1"
      max="6"
      value={currentConfig.mediaColumns || 2}
      onChange={(e) => handleColumnsChange(selectedSection, 'mediaColumns', parseInt(e.target.value))}
    />
  </div>
)}
```

---

### 5. Add Handler Functions

- [ ] Create `handleDetailLayoutChange()` function
- [ ] Create `handleMediaLayoutChange()` function
- [ ] Create `handleColumnsChange()` function
- [ ] Update state correctly
- [ ] Mark as changed

**Handler Functions:**
```typescript
const handleDetailLayoutChange = (section: SectionType, layout: DetailLayoutType) => {
  setConfigs(prev => ({
    ...prev,
    [section]: {
      ...prev[section],
      detailLayout: layout
    }
  }))
  setHasChanges(true)
  setSuccess(null)
}

const handleMediaLayoutChange = (section: SectionType, layout: MediaLayoutType) => {
  setConfigs(prev => ({
    ...prev,
    [section]: {
      ...prev[section],
      mediaLayout: layout
    }
  }))
  setHasChanges(true)
  setSuccess(null)
}

const handleColumnsChange = (section: SectionType, field: 'listColumns' | 'mediaColumns', value: number) => {
  setConfigs(prev => ({
    ...prev,
    [section]: {
      ...prev[section],
      [field]: value
    }
  }))
  setHasChanges(true)
  setSuccess(null)
}
```

---

### 6. Add Preview Sections

- [ ] Add preview for detail layouts
- [ ] Add preview for media layouts
- [ ] Show visual representation
- [ ] Update on selection change

**Preview Components:**
```typescript
{currentConfig.detailLayout && (
  <div className="section-layout-editor__preview">
    <h4>Detail Layout Preview</h4>
    <div className={`preview-detail-layout preview-detail-layout--${currentConfig.detailLayout}`}>
      {/* Visual preview */}
    </div>
  </div>
)}

{currentConfig.mediaLayout && (
  <div className="section-layout-editor__preview">
    <h4>Media Layout Preview</h4>
    <div className={`preview-media-layout preview-media-layout--${currentConfig.mediaLayout}`}>
      {/* Visual preview */}
    </div>
  </div>
)}
```

---

### 7. Update Save/Load Functions

- [ ] Ensure new fields are saved
- [ ] Ensure new fields are loaded
- [ ] Apply migration on load
- [ ] Validate before save

**Updated Load:**
```typescript
const loadConfigs = async () => {
  try {
    setLoading(true)
    setError(null)
    const loadedConfigs = await getAllSectionLayouts()
    // Apply migration
    const migrated = migrateSectionLayouts(loadedConfigs)
    setConfigs(migrated)
    setHasChanges(false)
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to load section layouts')
  } finally {
    setLoading(false)
  }
}
```

---

### 8. Add CSS Styles

- [ ] Add styles for detail layout selector
- [ ] Add styles for media layout selector
- [ ] Add styles for column inputs
- [ ] Add styles for preview sections
- [ ] Ensure responsive design

**CSS Classes:**
- `.section-layout-editor__detail-layout`
- `.section-layout-editor__media-layout`
- `.section-layout-editor__layout-grid`
- `.section-layout-editor__layout-card`
- `.section-layout-editor__preview`

---

## Success Criteria

- [ ] Editor shows detail layout selector for projects/blog
- [ ] Editor shows media layout selector for projects/blog
- [ ] Column inputs work correctly
- [ ] Preview sections display
- [ ] Save/load functions handle new fields
- [ ] UI is responsive
- [ ] No console errors

---

## Files Modified

- `src/features/admin/components/LayoutEditor/SectionLayoutEditor.tsx`
- `src/features/admin/styles/layout-editor.css`

---

## Notes

- Only show options for sections that support them
- Use conditional rendering for better UX
- Preview helps users understand layout options
- Default values ensure backward compatibility

