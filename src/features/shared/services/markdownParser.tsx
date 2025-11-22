import React from 'react'

export interface MarkdownElement {
  type: string
  content?: string
  children?: MarkdownElement[]
  props?: Record<string, any>
}

export interface MarkdownSection {
  id: string
  title: string
  level: number
  content: MarkdownElement[]
  element?: React.ReactNode
}

export interface ParsedMarkdown {
  sections: MarkdownSection[]
  metadata?: {
    title?: string
    description?: string
    tags?: string[]
    status?: string
    difficulty?: string
    technologies?: string[]
    category?: string
  }
}

export class MarkdownParser {
  private lines: string[]
  private currentIndex: number = 0
  private githubUrl: string | null = null
  private projectName: string | null = null

  constructor(markdown: string, githubUrl?: string, projectName?: string) {
    this.lines = markdown.split('\n')
    // Ensure githubUrl is set correctly (handle empty strings)
    this.githubUrl = (githubUrl && githubUrl.trim() !== '') ? githubUrl : null
    this.projectName = projectName || null
    console.log('🔍 MarkdownParser constructor - githubUrl:', this.githubUrl, 'projectName:', this.projectName)
  }

  parse(): ParsedMarkdown {
    // Reset parser state
    this.currentIndex = 0
    
    const sections: MarkdownSection[] = []
    const metadata: ParsedMarkdown['metadata'] = {}
    
    let currentSection: MarkdownSection | null = null
    let sectionCounter = 0
    // Track used IDs to ensure uniqueness
    const usedIds = new Set<string>()

    while (this.currentIndex < this.lines.length) {
      const line = this.lines[this.currentIndex]
      
      // Check for code block start/end
      if (line.trim().startsWith('```')) {
        // Parse code block (this will handle the entire block including closing ```)
        if (currentSection) {
          const element = this.parseCodeBlock()
          if (element) {
            currentSection.content.push(element)
          }
        } else {
          // No section yet, just skip the code block
          const startIndex = this.currentIndex
          this.currentIndex++
          while (this.currentIndex < this.lines.length && !this.lines[this.currentIndex].trim().startsWith('```')) {
            this.currentIndex++
          }
          if (this.currentIndex < this.lines.length) {
            this.currentIndex++ // Skip closing ```
          }
        }
        // parseCodeBlock() stops at the closing ```, so we need to advance past it
        if (this.currentIndex < this.lines.length && this.lines[this.currentIndex].trim().startsWith('```')) {
          this.currentIndex++
        }
        continue
      }
      
      // Extract metadata from frontmatter or special sections
      if (this.isMetadataLine(line)) {
        this.extractMetadata(line, metadata)
        this.currentIndex++
        continue
      }

      // Detect headers (#, ##, and ###) - only outside code blocks
      if (line.startsWith('# ')) {
        // H1 - Main title, add as content (don't create section for sidebar)
        // If no section exists yet, create a temporary one to hold content until first H2
        if (!currentSection) {
          const title = line.substring(2).trim()
          const id = this.generateUniqueId(title, usedIds)
          
          currentSection = {
            id,
            title,
            level: 1,
            content: []
          }
        }
        // Add H1 as content element
        const element = this.parseElement(line)
        if (element) {
          currentSection.content.push(element)
        }
      } else if (line.startsWith('## ')) {
        // Save previous section (only if it's H2 level, not H1)
        if (currentSection && currentSection.level === 2) {
          sections.push(currentSection)
        }
        
        // Create new H2 section (these appear in sidebar)
        const title = line.substring(3).trim()
        const id = this.generateUniqueId(title, usedIds)
        
        // If there was an H1 section, merge its content into the new H2 section
        const previousContent: MarkdownElement[] = (currentSection && currentSection.level === 1) ? currentSection.content : []
        
        currentSection = {
          id,
          title,
          level: 2,
          content: previousContent  // Include H1 content in first H2 section
        }
        sectionCounter++
      } else if (line.startsWith('### ')) {
        // Sub-section - add to current section content
        if (currentSection) {
          const title = line.substring(4).trim()
          const element = this.parseElement(line)
          if (element) {
            currentSection.content.push(element)
          }
        }
      } else if (currentSection) {
        // Add content to current section
        const element = this.parseElement(line)
        if (element) {
          currentSection.content.push(element)
        }
      }
      
      this.currentIndex++
    }
    
    // Add the last section (only if it's H2 level, not H1)
    if (currentSection && currentSection.level === 2) {
      sections.push(currentSection)
    }
    
    return { sections, metadata }
  }

  private parseElement(line: string): MarkdownElement | null {
    const trimmedLine = line.trim()
    
    if (!trimmedLine) {
      return { type: 'br' }
    }

    // Headers
    if (trimmedLine.startsWith('# ')) {
      return {
        type: 'h1',
        content: trimmedLine.substring(2),
        props: { className: 'markdown-h1' }
      }
    }

    if (trimmedLine.startsWith('## ')) {
      return {
        type: 'h2',
        content: trimmedLine.substring(3),
        props: { className: 'markdown-h2' }
      }
    }

    if (trimmedLine.startsWith('### ')) {
      return {
        type: 'h3',
        content: trimmedLine.substring(4),
        props: { className: 'markdown-h3' }
      }
    }

    if (trimmedLine.startsWith('#### ')) {
      return {
        type: 'h4',
        content: trimmedLine.substring(5),
        props: { className: 'markdown-h4' }
      }
    }

    // Code blocks
    if (trimmedLine.startsWith('```')) {
      return this.parseCodeBlock()
    }

    // Inline code
    if (trimmedLine.includes('`') && !trimmedLine.startsWith('`')) {
      return this.parseInlineCode(trimmedLine)
    }

    // Lists
    if (trimmedLine.startsWith('- ')) {
      return {
        type: 'li',
        content: trimmedLine.substring(2),
        props: { className: 'text-gray-300 mb-1 ml-4' }
      }
    }

    if (trimmedLine.match(/^\d+\.\s/)) {
      return {
        type: 'li',
        content: trimmedLine.replace(/^\d+\.\s/, ''),
        props: { className: 'text-gray-300 mb-1 ml-4 list-decimal' }
      }
    }

    // Blockquotes
    if (trimmedLine.startsWith('> ')) {
      return {
        type: 'blockquote',
        content: trimmedLine.substring(2),
        props: { className: 'border-l-4 border-neon-blue pl-4 italic text-gray-400 my-4' }
      }
    }

    // Horizontal rules
    if (trimmedLine === '---' || trimmedLine === '***') {
      return {
        type: 'hr',
        props: { className: 'border-neon-blue my-6' }
      }
    }

    // Images (check before links to handle nested images in links)
    // First check for nested image links: [![alt](img)](link)
    const nestedImageLinkRegex = /\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)/
    const nestedMatch = trimmedLine.match(nestedImageLinkRegex)
    if (nestedMatch) {
      return this.parseNestedImageLink(trimmedLine, nestedMatch)
    }
    
    // Regular images
    if (trimmedLine.includes('![') && trimmedLine.includes('](')) {
      if (trimmedLine.startsWith('![')) {
        return this.parseImage(trimmedLine)
      }
    }

    // Links (check after images to avoid matching nested images)
    if (trimmedLine.includes('[') && trimmedLine.includes('](') && !trimmedLine.includes('![')) {
      return this.parseLink(trimmedLine)
    }

    // Bold and italic text
    if (trimmedLine.includes('**') || trimmedLine.includes('*')) {
      return this.parseFormattedText(trimmedLine)
    }

    // Regular paragraphs
    return {
      type: 'p',
      content: trimmedLine,
      props: { className: 'text-gray-300 mb-2' }
    }
  }

  private parseCodeBlock(): MarkdownElement {
    const startLine = this.currentIndex
    const language = this.lines[this.currentIndex].substring(3).trim() || 'text'
    let content = ''
    this.currentIndex++
    
    while (this.currentIndex < this.lines.length && !this.lines[this.currentIndex].trim().startsWith('```')) {
      content += this.lines[this.currentIndex] + '\n'
      this.currentIndex++
    }
    
    // Note: currentIndex now points to the closing ``` line
    // The caller will advance past it
    
    return {
      type: 'code',
      content: content.trim(),
      props: { 
        language,
        className: 'code-block'
      }
    }
  }

  private parseInlineCode(line: string): MarkdownElement {
    const codeRegex = /`([^`]+)`/g
    let content = line
    let match
    
    while ((match = codeRegex.exec(line)) !== null) {
      const codeContent = match[1]
      const replacement = `<code style="background: var(--bg-primary); color: var(--neon-blue); padding: 0.125rem 0.25rem; border-radius: 3px; font-size: 0.875rem; font-family: monospace;">${codeContent}</code>`
      content = content.replace(match[0], replacement)
    }
    
    return {
      type: 'p',
      content,
      props: { className: 'text-gray-300 mb-2' }
    }
  }

  private parseLink(line: string): MarkdownElement {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
    let content = line
    let match
    
    while ((match = linkRegex.exec(line)) !== null) {
      const linkText = match[1]
      let linkUrl = match[2]
      
      // Convert relative links to absolute GitHub URLs
      linkUrl = this.resolveLinkUrl(linkUrl)
      
      const replacement = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`
      content = content.replace(match[0], replacement)
    }
    
    return {
      type: 'p',
      content,
      props: { className: 'text-gray-300 mb-2' }
    }
  }

  private parseNestedImageLink(line: string, match: RegExpMatchArray): MarkdownElement {
    const altText = match[1] || ''
    const originalImageUrl = match[2]
    const originalLinkUrl = match[3]
    
    // Convert relative image paths to absolute GitHub URLs
    let imageUrl = this.resolveImageUrl(originalImageUrl)
    
    // Convert relative links to absolute GitHub URLs
    let linkUrl = this.resolveLinkUrl(originalLinkUrl)
    
    // Debug logging
    if (!this.githubUrl && originalLinkUrl && !originalLinkUrl.startsWith('http')) {
      console.warn('⚠️ No GitHub URL available for link resolution:', originalLinkUrl, 'Parser githubUrl:', this.githubUrl)
    }
    
    // Replace the entire nested image link pattern in the line
    // Use the original match[0] which contains the full matched string
    const replacement = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer"><img src="${imageUrl}" alt="${altText}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 0.5rem 0; border: 1px solid var(--glass-border); display: inline-block;" /></a>`
    
    let content = line.replace(match[0], replacement)
    
    return {
      type: 'p',
      content,
      props: { className: 'text-gray-300 mb-2' }
    }
  }

  private parseImage(line: string): MarkdownElement {
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/
    const match = line.match(imageRegex)
    
    if (match) {
      const altText = match[1]
      let imageUrl = match[2]
      
      // Convert relative image paths to absolute GitHub URLs
      imageUrl = this.resolveImageUrl(imageUrl)
      
      return {
        type: 'img',
        content: imageUrl,
        props: { 
          alt: altText,
          className: 'max-w-full h-auto rounded-lg my-4'
        }
      }
    }
    
    return {
      type: 'p',
      content: line,
      props: { className: 'text-gray-300 mb-2' }
    }
  }

  private parseFormattedText(line: string): MarkdownElement {
    let content = line
    
    // Bold text **text**
    content = content.replace(/\*\*([^*]+)\*\*/g, '<strong style="font-weight: 600; color: var(--text-primary);">$1</strong>')
    
    // Italic text *text* (but not if it's part of **bold**)
    content = content.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em style="font-style: italic; color: var(--text-secondary);">$1</em>')
    
    // Strikethrough ~~text~~
    content = content.replace(/~~([^~]+)~~/g, '<del style="text-decoration: line-through; color: var(--text-muted);">$1</del>')
    
    return {
      type: 'p',
      content,
      props: { className: 'text-gray-300 mb-2' }
    }
  }

  private isMetadataLine(line: string): boolean {
    return line.includes('**Status:**') ||
           line.includes('**Difficulty:**') ||
           line.includes('**Technologies:**') ||
           line.includes('**Category:**') ||
           line.includes('**Actual State:**') ||
           line.includes('**Current State:**') ||
           !!line.match(/^(WIP|DEPRECATED|COMPLETED|ACTIVE|INACTIVE|BETA|ALPHA|STABLE)$/i) ||
           line.includes('aktuell WIP') ||
           line.includes('currently WIP') ||
           line.includes('deprecated') ||
           line.includes('veraltet') ||
           line.includes('completed') ||
           line.includes('fertig') ||
           line.includes('stable') ||
           line.includes('stabil') ||
           line.includes('beta') ||
           line.includes('alpha')
  }

  private extractMetadata(line: string, metadata: ParsedMarkdown['metadata']): void {
    if (!metadata) return
    
    // Status extraction
    if (line.includes('**Status:**')) {
      const statusMatch = line.match(/\*\*Status:\*\*\s*(.+)/i)
      if (statusMatch) {
        metadata.status = statusMatch[1].trim()
      }
    }
    
    if (line.includes('**Difficulty:**')) {
      const difficultyMatch = line.match(/\*\*Difficulty:\*\*\s*(.+)/i)
      if (difficultyMatch) {
        metadata.difficulty = difficultyMatch[1].trim()
      }
    }
    
    if (line.includes('**Actual State:**') || line.includes('**Current State:**')) {
      const stateMatch = line.match(/\*\*(?:Actual|Current)\s+State:\*\*\s*(.+)/i)
      if (stateMatch) {
        metadata.status = stateMatch[1].trim()
      }
    }
    
    if (line.match(/^(WIP|DEPRECATED|COMPLETED|ACTIVE|INACTIVE|BETA|ALPHA|STABLE)$/i)) {
      metadata.status = line.trim().toUpperCase()
    }
    
    if (line.includes('aktuell WIP') || line.includes('currently WIP')) {
      metadata.status = 'WIP'
    } else if (line.includes('deprecated') || line.includes('veraltet')) {
      metadata.status = 'DEPRECATED'
    } else if (line.includes('completed') || line.includes('fertig')) {
      metadata.status = 'COMPLETED'
    } else if (line.includes('stable') || line.includes('stabil')) {
      metadata.status = 'STABLE'
    } else if (line.includes('beta')) {
      metadata.status = 'BETA'
    } else if (line.includes('alpha')) {
      metadata.status = 'ALPHA'
    }
  }

  private generateId(title: string): string {
    return title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  /**
   * Generates a unique ID for a section title
   * If the ID already exists, appends a counter to make it unique
   */
  private generateUniqueId(title: string, usedIds: Set<string>): string {
    let baseId = this.generateId(title)
    let uniqueId = baseId
    let counter = 1
    
    // If ID already exists, append counter until we find a unique one
    while (usedIds.has(uniqueId)) {
      uniqueId = `${baseId}-${counter}`
      counter++
    }
    
    // Mark this ID as used
    usedIds.add(uniqueId)
    
    return uniqueId
  }

  /**
   * Resolves relative links to absolute GitHub URLs
   */
  private resolveLinkUrl(url: string): string {
    // If already absolute URL (http/https), return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    
    // If no GitHub URL available, return as is (might be local path)
    if (!this.githubUrl) {
      return url
    }
    
    // Convert relative paths to GitHub blob URLs
    // Examples:
    // LICENSE -> https://github.com/user/repo/blob/main/LICENSE
    // CHANGELOG.md -> https://github.com/user/repo/blob/main/CHANGELOG.md
    // docs/README.md -> https://github.com/user/repo/blob/main/docs/README.md
    // ./docs/README.md -> https://github.com/user/repo/blob/main/docs/README.md
    
    // Remove leading ./ if present
    let cleanPath = url.replace(/^\.\//, '')
    
    // If it's a file (has extension) or looks like a file path
    if (cleanPath.includes('.') || !cleanPath.includes('/')) {
      // Convert to GitHub blob URL
      const repoPath = this.githubUrl.replace(/\/$/, '') // Remove trailing slash
      return `${repoPath}/blob/main/${cleanPath}`
    }
    
    // For directories or other paths, try blob/main
    const repoPath = this.githubUrl.replace(/\/$/, '')
    return `${repoPath}/blob/main/${cleanPath}`
  }

  /**
   * Resolves relative image paths to absolute GitHub URLs
   */
  private resolveImageUrl(url: string): string {
    // If already absolute URL (http/https), return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    
    // If starts with /private/data/, convert to API route
    if (url.startsWith('/private/data/')) {
      // Convert /private/data/projects/pidea/assets/image.svg
      // to /api/editor/file/projects/pidea/assets/image.svg
      const pathWithoutPrefix = url.replace('/private/data/', '')
      return `/api/editor/file/${pathWithoutPrefix}`
    }
    
    // If starts with /, it might be a local asset path - check if it exists
    if (url.startsWith('/')) {
      // Local asset path - return as is (will be served from public/)
      return url
    }
    
    // Check if this might be a local asset that exists in private/data
    // If we have a project name, try to resolve relative paths to local assets first
    if (this.projectName && !url.startsWith('/') && !url.startsWith('http')) {
      // Try common asset locations: docs/assets/icons/, assets/, etc.
      // Extract filename from path
      const filename = url.split('/').pop() || url
      // Try to find it in private/data/projects/{projectName}/assets/
      const localAssetPath = `/private/data/projects/${this.projectName}/assets/${filename}`
      // Return API route for local asset
      const pathWithoutPrefix = localAssetPath.replace('/private/data/', '')
      const cleanedPath = pathWithoutPrefix.replace(/-(\d+)\.(svg|png|jpg|jpeg|gif|webp)$/i, '.$2')
      return `/api/editor/file/${cleanedPath}`
    }
    
    // If no GitHub URL available, return as is
    if (!this.githubUrl) {
      return url
    }
    
    // Convert relative paths to GitHub raw URLs for images
    // Examples:
    // docs/assets/icons/big.png -> https://github.com/user/repo/raw/main/docs/assets/icons/big.png
    // ./docs/assets/icons/big.png -> https://github.com/user/repo/raw/main/docs/assets/icons/big.png
    
    // Remove leading ./ if present
    let cleanPath = url.replace(/^\.\//, '')
    
    // Default to 'main' branch (most common)
    const branch = 'main'
    
    // Convert to GitHub raw URL (for images, use raw instead of blob)
    const repoPath = this.githubUrl.replace(/\/$/, '')
    return `${repoPath}/raw/${branch}/${cleanPath}`
  }
}

// React component renderer
export const renderMarkdownElement = (element: MarkdownElement, key: number): React.ReactNode => {
  switch (element.type) {
    case 'h1':
      return <h1 key={key} className={element.props?.className}>{element.content}</h1>
    case 'h2':
      return <h2 key={key} className={element.props?.className}>{element.content}</h2>
    case 'h3':
      return <h3 key={key} className={element.props?.className}>{element.content}</h3>
    case 'h4':
      return <h4 key={key} className={element.props?.className}>{element.content}</h4>
    case 'p':
      return <p key={key} className={element.props?.className} dangerouslySetInnerHTML={{ __html: element.content || '' }} />
    case 'li':
      return <li key={key} className={element.props?.className}>{element.content}</li>
    case 'code':
      return (
        <pre key={key} className={element.props?.className}>
          <code>{element.content}</code>
        </pre>
      )
    case 'blockquote':
      return <blockquote key={key} className={element.props?.className}>{element.content}</blockquote>
    case 'hr':
      return <hr key={key} className={element.props?.className} />
    case 'img':
      return <img key={key} src={element.content} alt={element.props?.alt} className={element.props?.className} />
    case 'br':
      return <br key={key} />
    default:
      return null
  }
}
