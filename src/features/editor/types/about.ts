/**
 * About.json Type Definitions
 * Blocks innerhalb Sections - KEIN MARKDOWN!
 */

export type AboutBlockType = 
  | 'heading'
  | 'text'
  | 'list'
  | 'quote'
  | 'link'
  | 'image'
  | 'divider'
  | 'code'

export interface AboutHeadingBlock {
  id: string
  type: 'heading'
  level: 1 | 2 | 3 | 4
  content: string
}

export interface AboutTextBlock {
  id: string
  type: 'text'
  content: string
}

export interface AboutListBlock {
  id: string
  type: 'list'
  style: 'bullet' | 'numbered'
  items: string[]
}

export interface AboutQuoteBlock {
  id: string
  type: 'quote'
  content: string
  author?: string
}

export interface AboutLinkBlock {
  id: string
  type: 'link'
  label: string
  url: string
}

export interface AboutImageBlock {
  id: string
  type: 'image'
  imageUrl: string
  alt: string
  caption?: string
}

export interface AboutDividerBlock {
  id: string
  type: 'divider'
}

export interface AboutCodeBlock {
  id: string
  type: 'code'
  language?: string
  content: string
}

export type AboutBlock = 
  | AboutHeadingBlock
  | AboutTextBlock
  | AboutListBlock
  | AboutQuoteBlock
  | AboutLinkBlock
  | AboutImageBlock
  | AboutDividerBlock
  | AboutCodeBlock

export type AboutSectionType = 
  | 'text'
  | 'skills'
  | 'contact'
  | 'links'
  | 'image'

export interface AboutTextSection {
  id: string
  type: 'text'
  title: string
  blocks: AboutBlock[]
}

export interface AboutSkillsSection {
  id: string
  type: 'skills'
  title: string
  skills: string[]
}

export interface AboutContactSection {
  id: string
  type: 'contact'
  title: string
  email?: string
  location?: string
  timezone?: string
}

export interface AboutLinksSection {
  id: string
  type: 'links'
  title: string
  links: Array<{
    label: string
    url: string
  }>
}

export interface AboutImageSection {
  id: string
  type: 'image'
  title: string
  imageUrl: string
  alt: string
  caption?: string
}

export type AboutSection = 
  | AboutTextSection
  | AboutSkillsSection
  | AboutContactSection
  | AboutLinksSection
  | AboutImageSection

export interface AboutHeader {
  title: string
  subtitle?: string
}

export interface AboutSocialLinks {
  github?: string | null
  twitter?: string | null
  linkedin?: string | null
  website?: string | null
  email?: string | null
}

export interface AboutContact {
  email?: string
  location?: string
  timezone?: string
}

export interface AboutMetadata {
  lastModified?: string
  generatedBy?: string
}

export interface AboutData {
  header: AboutHeader
  sections: AboutSection[]
  socialLinks?: AboutSocialLinks
  contact?: AboutContact
  metadata?: AboutMetadata
}

/**
 * Helper function to generate unique block ID
 */
export function generateBlockId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Helper function to generate unique section ID
 */
export function generateSectionId(): string {
  return `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Create default block by type
 */
export function createDefaultBlock(type: AboutBlockType): AboutBlock {
  const id = generateBlockId()
  
  switch (type) {
    case 'heading':
      return { id, type: 'heading', level: 2, content: '' }
    case 'text':
      return { id, type: 'text', content: '' }
    case 'list':
      return { id, type: 'list', style: 'bullet', items: [''] }
    case 'quote':
      return { id, type: 'quote', content: '' }
    case 'link':
      return { id, type: 'link', label: '', url: '' }
    case 'image':
      return { id, type: 'image', imageUrl: '', alt: '' }
    case 'divider':
      return { id, type: 'divider' }
    case 'code':
      return { id, type: 'code', content: '', language: 'javascript' }
    default:
      return { id, type: 'text', content: '' }
  }
}

/**
 * Create default section by type
 */
export function createDefaultSection(type: AboutSectionType): AboutSection {
  const id = generateSectionId()
  
  switch (type) {
    case 'text':
      return {
        id,
        type: 'text',
        title: 'New Section',
        blocks: []
      }
    case 'skills':
      return {
        id,
        type: 'skills',
        title: 'Top Skills',
        skills: []
      }
    case 'contact':
      return {
        id,
        type: 'contact',
        title: 'Contact',
        email: '',
        location: '',
        timezone: ''
      }
    case 'links':
      return {
        id,
        type: 'links',
        title: 'Links',
        links: []
      }
    case 'image':
      return {
        id,
        type: 'image',
        title: 'Image',
        imageUrl: '',
        alt: ''
      }
    default:
      return {
        id,
        type: 'text',
        title: 'New Section',
        blocks: []
      }
  }
}

