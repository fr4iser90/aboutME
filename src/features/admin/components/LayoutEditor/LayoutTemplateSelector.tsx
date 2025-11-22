'use client'

import type { DetailPageLayoutTemplate, DetailLayoutTemplate } from '@/features/portfolio/types/layouts'

interface LayoutTemplateSelectorProps {
  selectedTemplate: DetailPageLayoutTemplate | DetailLayoutTemplate
  onTemplateChange: (template: string) => void
}

const layoutTemplates: Array<{
  id: DetailPageLayoutTemplate
  name: string
  icon: string
  description: string
}> = [
  { id: 'sidebar-left', name: 'Sidebar Left', icon: '📋', description: 'Sidebar on the left, content on the right' },
  { id: 'sidebar-right', name: 'Sidebar Right', icon: '📋', description: 'Content on the left, sidebar on the right' },
  { id: 'full-width', name: 'Full Width', icon: '📄', description: 'Full width content, no sidebar' },
  { id: 'two-column', name: 'Two Column', icon: '📊', description: 'Two equal columns' },
  { id: 'centered', name: 'Centered', icon: '🎯', description: 'Centered content with max width' },
  { id: 'masonry', name: 'Masonry', icon: '🧱', description: 'Pinterest-style masonry grid' },
  { id: 'split-screen', name: 'Split Screen', icon: '🖥️', description: '50/50 split screen layout' },
  { id: 'hero-content', name: 'Hero Content', icon: '🎬', description: 'Hero section with content below' },
  { id: 'carousel-layout', name: 'Carousel', icon: '🎠', description: 'Carousel-based layout' },
  { id: 'sticky-sidebar', name: 'Sticky Sidebar', icon: '📌', description: 'Sticky sidebar that stays visible' }
]

export default function LayoutTemplateSelector({
  selectedTemplate,
  onTemplateChange
}: LayoutTemplateSelectorProps) {
  return (
    <div className="layout-template-selector">
      <div className="layout-template-selector__grid">
        {layoutTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => onTemplateChange(template.id)}
            className={`layout-template-selector__card ${
              selectedTemplate === template.id ? 'layout-template-selector__card--selected' : ''
            }`}
          >
            <div className="layout-template-selector__icon">{template.icon}</div>
            <div className="layout-template-selector__name">{template.name}</div>
            <div className="layout-template-selector__description">{template.description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

