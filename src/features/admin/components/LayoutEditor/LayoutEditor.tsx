'use client'

import { useState } from 'react'
import CategoryTabs from './CategoryTabs'
import MainPageLayoutEditor from './MainPageLayoutEditor'
import SectionLayoutEditor from './SectionLayoutEditor'
import DetailPageLayoutEditor from './DetailPageLayoutEditor'
import '@/features/admin/styles/layout-editor.css'

interface LayoutEditorProps {}

export default function LayoutEditor({}: LayoutEditorProps) {
  const [activeCategory, setActiveCategory] = useState<string>('global')
  const [hasChanges, setHasChanges] = useState(false)

  return (
    <div className="layout-editor">
      {/* Category Tabs */}
      <CategoryTabs 
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Main Page Layout Editor */}
      {activeCategory === 'global' && (
        <MainPageLayoutEditor onSave={() => setHasChanges(false)} />
      )}

      {/* Section Layout Editors */}
      {activeCategory !== 'global' && activeCategory !== 'projects' && activeCategory !== 'blog' && (
        <SectionLayoutEditor onSave={() => setHasChanges(false)} />
      )}

      {/* Detail Page Layout Editors */}
      {(activeCategory === 'projects' || activeCategory === 'blog') && (
        <DetailPageLayoutEditor 
          category={activeCategory} 
          onSave={() => setHasChanges(false)} 
        />
      )}
    </div>
  )
}

