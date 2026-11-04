/**
 * Shared type re-exports used across features
 */

export interface UserData {
  username?: string
  name: string
  bio: string
  avatar?: string
  avatar_url?: string
  location?: string
  followers?: number
  publicRepos?: number
  public_repos?: number
  email?: string
  github?: string
  aboutMe?: {
    content: string
    frontmatter: Record<string, unknown>
    lastModified: string
  }
  socialLinks?: {
    github: string
    twitter?: string
    website?: string
    linkedin?: string
    email?: string
  }
}

export type { DesignType, DesignConfig, DesignEffects, DesignSystemConfig } from './design'
export type { SectionDetailLayoutType, SectionMediaLayoutType } from './sectionLayouts'
