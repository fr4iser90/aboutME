/**
 * Block Types & Interfaces
 * Foundation of the block-based layout system
 * 
 * Created: 2025-11-16
 */

/**
 * Block Type Union
 * All available block types in the system
 */
export type BlockType =
  | 'heading'
  | 'link'
  | 'image'
  | 'screenshot'
  | 'video'
  | 'text'
  | 'markdown'
  | 'section'
  | 'grid'
  | 'navigation'
  | 'code'
  | 'quote'
  | 'callout'
  | 'stats'
  | 'separator'
  | 'spacer'
  | 'embed'
  | 'table'
  | 'list'

/**
 * Animation Type Union
 * All available animation types
 */
export type AnimationType =
  | 'none'
  | 'fade-in'
  | 'fade-out'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'zoom-in'
  | 'zoom-out'
  | 'bounce-in'
  | 'bounce-out'
  | 'rotate-in'
  | 'stagger'
  | 'count-up'

/**
 * Animation Configuration
 */
export interface AnimationConfig {
  type: AnimationType
  delay?: number // milliseconds
  duration?: number // milliseconds
  easing?: string // CSS easing function
}

/**
 * Base Block Interface
 * All blocks extend this interface
 */
export interface BaseBlock {
  id: string
  type: BlockType
  animation?: AnimationConfig
  spacing?: {
    top?: string | number
    bottom?: string | number
    left?: string | number
    right?: string | number
  }
  responsive?: {
    hideOnMobile?: boolean
    hideOnDesktop?: boolean
  }
}

/**
 * Block Context
 * Where the block is being rendered
 */
export type BlockContext = 'sidebar' | 'content' | 'column1' | 'column2' | 'hero' | 'left' | 'right' | 'carousel'

/**
 * Screenshot Block
 */
export interface ScreenshotBlock extends BaseBlock {
  type: 'screenshot'
  layout: 'single' | 'grid' | 'gallery'
  images: string[]
  columns?: number
}

/**
 * Video Block
 */
export interface VideoBlock extends BaseBlock {
  type: 'video'
  source: 'youtube' | 'vimeo'
  videoId: string // Video ID (YouTube/Vimeo ID, not block ID - block ID comes from BaseBlock)
  autoplay?: boolean
}

/**
 * Heading Block
 */
export interface HeadingBlock extends BaseBlock {
  type: 'heading'
  level: 1 | 2 | 3 | 4 | 5 | 6
  content: string
}

/**
 * Link Block
 */
export interface LinkBlock extends BaseBlock {
  type: 'link'
  label: string
  url: string
  target?: '_blank' | '_self'
  rel?: string
}

/**
 * Image Block
 * For single images (screenshot is for multiple images)
 */
export interface ImageBlock extends BaseBlock {
  type: 'image'
  imageUrl: string
  alt: string
  caption?: string
  width?: string | number
  height?: string | number
}

/**
 * Text Block
 */
export interface TextBlock extends BaseBlock {
  type: 'text'
  content: string
  style?: 'default' | 'quote' | 'callout' | 'highlight'
}

/**
 * Markdown Block
 */
export interface MarkdownBlock extends BaseBlock {
  type: 'markdown'
  content: string
}

/**
 * Section Block
 * Renders markdown sections directly (like ProjectContent)
 */
export interface SectionBlock extends BaseBlock {
  type: 'section'
  sectionId: string
  title: string
  content: any[] // MarkdownElement[]
}

/**
 * Grid Block
 * Can contain nested blocks
 */
export interface GridBlock extends BaseBlock {
  type: 'grid'
  columns: number
  items: Block[]
}

/**
 * Navigation Block
 */
export interface NavigationBlock extends BaseBlock {
  type: 'navigation'
  sections: 'auto' | Array<{ id: string; title: string }>
  style?: 'numbered' | 'bullet' | 'minimal'
}

/**
 * Code Block
 */
export interface CodeBlock extends BaseBlock {
  type: 'code'
  language: string
  code: string
  theme?: 'dark' | 'light'
  showLineNumbers?: boolean
}

/**
 * Quote Block
 */
export interface QuoteBlock extends BaseBlock {
  type: 'quote'
  text: string
  author?: string
  style?: 'default' | 'large' | 'highlight'
}

/**
 * Callout Block
 */
export interface CalloutBlock extends BaseBlock {
  type: 'callout'
  variant: 'info' | 'warning' | 'success' | 'error'
  title?: string
  content: string
}

/**
 * Stats Block
 */
export interface StatsBlock extends BaseBlock {
  type: 'stats'
  items: Array<{
    label: string
    value: string | number
    icon?: string
  }>
  layout?: 'horizontal' | 'vertical' | 'grid'
}

/**
 * Separator Block
 */
export interface SeparatorBlock extends BaseBlock {
  type: 'separator'
  style?: 'line' | 'dots' | 'gradient'
  spacingSize?: 'small' | 'medium' | 'large' // Spacing size for separator, not block spacing
}

/**
 * Spacer Block
 */
export interface SpacerBlock extends BaseBlock {
  type: 'spacer'
  height: string | number | 'small' | 'medium' | 'large'
}

/**
 * Embed Block
 */
export interface EmbedBlock extends BaseBlock {
  type: 'embed'
  source: 'codepen' | 'jsfiddle' | 'codesandbox' | 'iframe'
  embedId?: string // Embed ID (CodePen/JSFiddle/CodeSandbox ID, not block ID - block ID comes from BaseBlock)
  url?: string
  height?: number
}

/**
 * Table Block
 */
export interface TableBlock extends BaseBlock {
  type: 'table'
  headers: string[]
  rows: string[][]
  style?: 'default' | 'striped' | 'bordered'
}

/**
 * List Block
 */
export interface ListBlock extends BaseBlock {
  type: 'list'
  style: 'bullet' | 'numbered' | 'check' | 'icon'
  items: string[]
  icon?: string
}

/**
 * Block Union Type
 * All possible block types
 */
export type Block =
  | HeadingBlock
  | LinkBlock
  | ImageBlock
  | ScreenshotBlock
  | VideoBlock
  | TextBlock
  | MarkdownBlock
  | SectionBlock
  | GridBlock
  | NavigationBlock
  | CodeBlock
  | QuoteBlock
  | CalloutBlock
  | StatsBlock
  | SeparatorBlock
  | SpacerBlock
  | EmbedBlock
  | TableBlock
  | ListBlock

