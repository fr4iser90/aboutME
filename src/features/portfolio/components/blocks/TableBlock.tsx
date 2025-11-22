/**
 * Table Block Component
 * Renders tables
 * 
 * Created: 2025-11-16
 */

'use client'

import React from 'react'
import type { TableBlock as TableBlockType, BlockContext } from '../../types/blocks'
import { getAnimationClasses, getResponsiveClasses, getSpacingStyles } from '../../utils/animationManager'

interface TableBlockProps {
  block: TableBlockType
  context?: BlockContext
}

/**
 * Table Block
 * Renders table
 */
export default function TableBlock({ block, context = 'content' }: TableBlockProps) {
  const animationClasses = getAnimationClasses(block.animation)
  const responsiveClasses = getResponsiveClasses(block.responsive)
  const spacingStyles = getSpacingStyles(block.spacing)

  const style = block.style || 'default'
  const className = `block block-table block-table--${style} ${animationClasses} ${responsiveClasses}`.trim()

  return (
    <div className={className} style={spacingStyles}>
      <div className="table-block-wrapper">
        <table className="table-block">
          <thead>
            <tr>
              {block.headers.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

