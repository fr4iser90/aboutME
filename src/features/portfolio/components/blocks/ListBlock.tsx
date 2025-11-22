/**
 * List Block Component
 * Renders lists (bullet, numbered, check, icon)
 * 
 * Created: 2025-11-16
 */

'use client'

import React from 'react'
import type { ListBlock as ListBlockType, BlockContext } from '../../types/blocks'
import { getAnimationClasses, getResponsiveClasses, getSpacingStyles } from '../../utils/animationManager'

interface ListBlockProps {
  block: ListBlockType
  context?: BlockContext
}

/**
 * List Block
 * Renders list
 */
export default function ListBlock({ block, context = 'content' }: ListBlockProps) {
  const animationClasses = getAnimationClasses(block.animation)
  const responsiveClasses = getResponsiveClasses(block.responsive)
  const spacingStyles = getSpacingStyles(block.spacing)

  const className = `block block-list block-list--${block.style} ${animationClasses} ${responsiveClasses}`.trim()

  if (block.style === 'numbered') {
    return (
      <div className={className} style={spacingStyles}>
        <ol className="list-block">
          {block.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ol>
      </div>
    )
  }

  if (block.style === 'check' || block.style === 'icon') {
    const icon = block.icon || (block.style === 'check' ? '✓' : '•')
    return (
      <div className={className} style={spacingStyles}>
        <ul className="list-block">
          {block.items.map((item, index) => (
            <li key={index}>
              <span className="list-icon">{icon}</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  // bullet (default)
  return (
    <div className={className} style={spacingStyles}>
      <ul className="list-block">
        {block.items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

