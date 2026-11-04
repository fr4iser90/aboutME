'use client'

interface CategoryTabsProps {
  activeCategory: string
  onCategoryChange: (category: string) => void
}

const categories = [
  { id: 'global', name: 'Global', icon: 'G' },
  { id: 'projects', name: 'Projects', icon: 'P' },
  { id: 'skills', name: 'Skills', icon: 'S' },
  { id: 'timeline', name: 'Timeline', icon: 'T' },
  { id: 'blog', name: 'Blog', icon: 'B' },
  { id: 'aboutMe', name: 'About Me', icon: 'A' },
  { id: 'contact', name: 'Contact', icon: 'C' }
]

export default function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="category-tabs">
      <div className="category-tabs__list">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`category-tabs__tab ${
              activeCategory === category.id ? 'category-tabs__tab--active' : ''
            }`}
          >
            <span className="category-tabs__icon">{category.icon}</span>
            <span className="category-tabs__name">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

