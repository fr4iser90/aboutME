/**
 * Stats Block Component
 * Renders statistics with count-up animation
 * 
 * Created: 2025-11-16
 */

'use client'

import React from 'react'
import type { StatsBlock as StatsBlockType, BlockContext } from '../../types/blocks'
import { getAnimationClasses, getResponsiveClasses, getSpacingStyles } from '../../utils/animationManager'

interface StatsBlockProps {
  block: StatsBlockType
  context?: BlockContext
}

/**
 * Stats Block
 * Renders statistics
 */
export default function StatsBlock({ block, context = 'content' }: StatsBlockProps) {
  const animationClasses = getAnimationClasses(block.animation)
  const responsiveClasses = getResponsiveClasses(block.responsive)
  const spacingStyles = getSpacingStyles(block.spacing)

  const layout = block.layout || 'horizontal'
  const className = `block block-stats block-stats--${layout} ${animationClasses} ${responsiveClasses}`.trim()

  return (
    <div className={className} style={spacingStyles}>
      <div className="stats-block">
        {block.items.map((item, index) => (
          <div key={index} className="stat-item">
            {item.icon && <span className="stat-icon">{item.icon}</span>}
            <div className="stat-value">{item.value}</div>
            <div className="stat-label">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

