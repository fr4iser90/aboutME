'use client'

import DetailLayoutRenderer from '@/features/portfolio/components/layouts/DetailLayoutRenderer'
import BlockEditor from '@/features/editor/components/BlockEditor'
import type { DetailPageLayoutConfig, DetailLayoutConfig } from '@/features/portfolio/types/layouts'
import type { MarkdownSection } from '@/features/shared/services/markdownParser'

interface LayoutPreviewProps {
  config: DetailPageLayoutConfig | DetailLayoutConfig
  markdownSections?: MarkdownSection[]
}

export default function LayoutPreview({
  config,
  markdownSections = []
}: LayoutPreviewProps) {
  return (
    <div className="layout-preview">
      <div className="layout-preview__container">
        <BlockEditor
          config={config}
          markdownSections={markdownSections}
          isEditMode={false}
        />
      </div>
    </div>
  )
}

