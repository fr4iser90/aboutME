'use client'

interface CategoryTabsProps {
  activeCategory: string
  onCategoryChange: (category: string) => void
}

const categories = [
  { id: 'global', name: 'Global', icon: '🌐' },
  { id: 'projects', name: 'Projects', icon: '📁' },
  { id: 'skills', name: 'Skills', icon: '💼' },
  { id: 'timeline', name: 'Timeline', icon: '📅' },
  { id: 'blog', name: 'Blog', icon: '📝' },
  { id: 'aboutMe', name: 'About Me', icon: '👤' },
  { id: 'contact', name: 'Contact', icon: '📧' }
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

