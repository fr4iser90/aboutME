/**
 * Code Block Component
 * Renders code blocks with syntax highlighting
 * 
 * Created: 2025-11-16
 */

'use client'

import React from 'react'
import type { CodeBlock as CodeBlockType, BlockContext } from '../../types/blocks'
import { getAnimationClasses, getResponsiveClasses, getSpacingStyles } from '../../utils/animationManager'

interface CodeBlockProps {
  block: CodeBlockType
  context?: BlockContext
}

/**
 * Code Block
 * Renders code with syntax highlighting
 */
export default function CodeBlock({ block, context = 'content' }: CodeBlockProps) {
  const animationClasses = getAnimationClasses(block.animation)
  const responsiveClasses = getResponsiveClasses(block.responsive)
  const spacingStyles = getSpacingStyles(block.spacing)

  const theme = block.theme || 'dark'
  const className = `block block-code block-code--${theme} ${animationClasses} ${responsiveClasses}`.trim()

  return (
    <div className={className} style={spacingStyles}>
      <pre className="code-block">
        <code className={`language-${block.language}`}>
          {block.code}
        </code>
      </pre>
    </div>
  )
}

