# Phase 3: Modal and Component Integration

## Overview

Update ProjectModal, BlogModal, and ProjectLayout to use section layout configurations instead of separate systems.

**Estimated Time**: 4 hours
**Status**: Completed
**Progress**: 100%
**Completed**: 2025-11-21T17:26:56.000Z

---

## Tasks

### 1. Create DetailLayoutRenderer Component

- [ ] Create `src/features/portfolio/components/layouts/DetailLayoutRenderer.tsx`
- [ ] Accept `layout` prop (DetailLayoutType)
- [ ] Accept `content` prop (ReactNode)
- [ ] Render appropriate layout based on type
- [ ] Handle null layout (no detail layout)
- [ ] Add JSDoc comments

**Component Structure:**
```typescript
interface DetailLayoutRendererProps {
  layout: DetailLayoutType
  content: React.ReactNode
  sidebar?: React.ReactNode
}

export default function DetailLayoutRenderer({ 
  layout, 
  content, 
  sidebar 
}: DetailLayoutRendererProps) {
  if (!layout) {
    return <div className="detail-layout detail-layout--default">{content}</div>
  }

  switch (layout) {
    case 'sidebar-left':
      return (
        <div className="detail-layout detail-layout--sidebar-left">
          <aside className="detail-sidebar">{sidebar}</aside>
          <main className="detail-content">{content}</main>
        </div>
      )
    case 'two-column':
      return (
        <div className="detail-layout detail-layout--two-column">
          <div className="detail-column-1">{content}</div>
          <div className="detail-column-2">{sidebar}</div>
        </div>
      )
    // ... other layouts
    default:
      return <div className="detail-layout detail-layout--default">{content}</div>
  }
}
```

---

### 2. Create MediaLayoutRenderer Component

- [ ] Create `src/features/portfolio/components/layouts/MediaLayoutRenderer.tsx`
- [ ] Accept `layout` prop (MediaLayoutType)
- [ ] Accept `images` prop (string[])
- [ ] Accept `video` prop (optional)
- [ ] Render appropriate layout based on type
- [ ] Reuse existing layout components where possible
- [ ] Add JSDoc comments

**Component Structure:**
```typescript
interface MediaLayoutRendererProps {
  layout: MediaLayoutType
  images: string[]
  video?: VideoConfig
  alt?: string
}

export default function MediaLayoutRenderer({ 
  layout, 
  images, 
  video,
  alt 
}: MediaLayoutRendererProps) {
  if (!layout) {
    return images.length > 0 ? <SingleImageLayout images={images} alt={alt} /> : null
  }

  switch (layout) {
    case 'single':
      return <SingleImageLayout images={images} alt={alt} />
    case 'grid':
      return <GridLayout images={images} alt={alt} />
    case 'gallery':
      return <GalleryLayout images={images} alt={alt} />
    case 'carousel':
      return <CarouselLayout images={images} alt={alt} />
    case 'video':
      return video ? <VideoLayout video={video} /> : null
    case 'mixed':
      return <MixedLayout images={images} video={video} />
    default:
      return images.length > 0 ? <SingleImageLayout images={images} alt={alt} /> : null
  }
}
```

---

### 3. Update ProjectModal

- [ ] Import `getAllSectionLayouts` from layoutConfig
- [ ] Import `DetailLayoutRenderer`
- [ ] Load section layouts on mount
- [ ] Get `projects.detailLayout` from config
- [ ] Replace `PageLayout` with `DetailLayoutRenderer`
- [ ] Pass content and sidebar to renderer
- [ ] Add fallback to default layout

**Updated Code:**
```typescript
const [sectionLayouts, setSectionLayouts] = useState<SectionLayoutsConfig>({})

useEffect(() => {
  if (isOpen) {
    loadSectionLayouts()
  }
}, [isOpen])

const loadSectionLayouts = async () => {
  try {
    const layouts = await getAllSectionLayouts()
    setSectionLayouts(layouts)
  } catch (error) {
    console.error('Error loading section layouts:', error)
  }
}

// In render:
const detailLayout = sectionLayouts.projects?.detailLayout || 'sidebar-left'

return (
  <DetailLayoutRenderer
    layout={detailLayout}
    content={/* parsed markdown content */}
    sidebar={/* navigation sidebar */}
  />
)
```

---

### 4. Update BlogModal

- [ ] Import `getAllSectionLayouts` from layoutConfig
- [ ] Import `DetailLayoutRenderer`
- [ ] Load section layouts on mount
- [ ] Get `blog.detailLayout` from config
- [ ] Replace fixed layout with `DetailLayoutRenderer`
- [ ] Pass content and sidebar to renderer
- [ ] Add fallback to default layout

**Updated Code:**
```typescript
const [sectionLayouts, setSectionLayouts] = useState<SectionLayoutsConfig>({})

useEffect(() => {
  if (isOpen) {
    loadSectionLayouts()
  }
}, [isOpen])

const loadSectionLayouts = async () => {
  try {
    const layouts = await getAllSectionLayouts()
    setSectionLayouts(layouts)
  } catch (error) {
    console.error('Error loading section layouts:', error)
  }
}

// In render:
const detailLayout = sectionLayouts.blog?.detailLayout || 'sidebar-left'

return (
  <DetailLayoutRenderer
    layout={detailLayout}
    content={/* parsed markdown content */}
    sidebar={/* navigation sidebar */}
  />
)
```

---

### 5. Update ProjectLayout

- [ ] Import `getAllSectionLayouts` from layoutConfig
- [ ] Import `MediaLayoutRenderer`
- [ ] Load section layouts (or pass as prop)
- [ ] Get `projects.mediaLayout` from config
- [ ] Replace switch statement with `MediaLayoutRenderer`
- [ ] Pass images and video to renderer
- [ ] Add fallback to project.layout or 'grid'

**Updated Code:**
```typescript
interface ProjectLayoutProps {
  project: Project
  layout?: Project['layout']
  sectionLayouts?: SectionLayoutsConfig
}

export default function ProjectLayout({ 
  project, 
  layout,
  sectionLayouts 
}: ProjectLayoutProps) {
  const images = project.screenshots || []
  const mediaLayout = sectionLayouts?.projects?.mediaLayout || layout || 'grid'

  if (images.length === 0 && !project.video) {
    return null
  }

  return (
    <MediaLayoutRenderer
      layout={mediaLayout}
      images={images}
      video={project.video}
      alt={project.name}
    />
  )
}
```

---

### 6. Update Component Usage

- [ ] Find all places where ProjectLayout is used
- [ ] Pass sectionLayouts prop
- [ ] Update ProjectModal to pass sectionLayouts
- [ ] Update any other components using ProjectLayout

**Usage Update:**
```typescript
// In component using ProjectLayout
const sectionLayouts = await getAllSectionLayouts()

<ProjectLayout
  project={project}
  sectionLayouts={sectionLayouts}
/>
```

---

### 7. Add CSS Styles

- [ ] Add styles for DetailLayoutRenderer
- [ ] Add styles for MediaLayoutRenderer
- [ ] Ensure layouts match existing styles
- [ ] Add responsive styles
- [ ] Test all layout variants

**CSS Classes:**
- `.detail-layout`
- `.detail-layout--sidebar-left`
- `.detail-layout--two-column`
- `.detail-layout--masonry`
- `.detail-layout--centered`
- `.detail-layout--full-width`
- `.detail-sidebar`
- `.detail-content`
- `.detail-column-1`
- `.detail-column-2`

---

### 8. Test Integration

- [ ] Test ProjectModal with different detail layouts
- [ ] Test BlogModal with different detail layouts
- [ ] Test ProjectLayout with different media layouts
- [ ] Test fallback to defaults
- [ ] Test with missing configs
- [ ] Test with null layouts

---

## Success Criteria

- [ ] DetailLayoutRenderer works for all layout types
- [ ] MediaLayoutRenderer works for all layout types
- [ ] ProjectModal uses section config
- [ ] BlogModal uses section config
- [ ] ProjectLayout uses section config
- [ ] All modals render correctly
- [ ] Fallbacks work
- [ ] No console errors

---

## Files Modified

- `src/features/portfolio/components/ProjectModal.tsx`
- `src/features/blog/components/BlogModal.tsx`
- `src/features/portfolio/components/ProjectLayout.tsx`

## Files Created

- `src/features/portfolio/components/layouts/DetailLayoutRenderer.tsx`
- `src/features/portfolio/components/layouts/MediaLayoutRenderer.tsx`
- `src/features/admin/styles/detail-layout.css` (if needed)

---

## Notes

- Reuse existing layout components where possible
- Keep backward compatibility with project.layout
- Fallback to defaults ensures old configs work
- Test all layout combinations

