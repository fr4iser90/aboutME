'use client'

import { useState } from 'react'
import type { BlockType } from '@/features/portfolio/types/blocks'

interface BlockSearchProps {
  onSearchChange: (query: string) => void
  onFilterChange: (filter: { type?: string }) => void
  availableTypes: BlockType[]
  searchQuery: string
  typeFilter: string
}

export default function BlockSearch({
  onSearchChange,
  onFilterChange,
  availableTypes,
  searchQuery,
  typeFilter
}: BlockSearchProps) {
  const handleClear = () => {
    onSearchChange('')
    onFilterChange({ type: 'all' })
  }

  const hasActiveFilters = searchQuery || typeFilter !== 'all'

  return (
    <div className="block-search">
      <div className="block-search__input-wrapper">
        <span className="block-search__icon">🔍</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search blocks by title or ID..."
          className="block-search__input"
        />
      </div>
      <select
        value={typeFilter}
        onChange={(e) => onFilterChange({ type: e.target.value })}
        className="block-search__filter"
      >
        <option value="all">All Types</option>
        {availableTypes.map((type) => (
          <option key={type} value={type}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </option>
        ))}
      </select>
      {hasActiveFilters && (
        <button
          onClick={handleClear}
          className="block-search__clear"
          title="Clear search and filters"
        >
          Clear
        </button>
      )}
    </div>
  )
}

