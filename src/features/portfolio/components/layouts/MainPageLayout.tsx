'use client'

import React from 'react'
import type { MainPageLayoutType, PageLayoutType } from '@/features/shared/utils/layoutConfig'
import SidebarLeftLayout from './SidebarLeftLayout'
import SidebarRightLayout from './SidebarRightLayout'
import FullWidthLayout from './FullWidthLayout'
import TwoColumnLayout from './TwoColumnLayout'
import CenteredLayout from './CenteredLayout'
import MasonryLayout from './MasonryLayout'
import HeroContentLayout from './HeroContentLayout'
import CarouselLayout from './CarouselLayout'
import StickySidebarLayout from './StickySidebarLayout'

interface MainPageLayoutProps {
  layout: MainPageLayoutType
  blocks: {
    hero?: React.ReactNode
    projects?: React.ReactNode
    skills?: React.ReactNode
    timeline?: React.ReactNode
    blog?: React.ReactNode
    aboutMe?: React.ReactNode
    contact?: React.ReactNode
  }
}

/**
 * Main Page Layout
 * Renders layout templates for the main page using React components (blocks)
 * instead of Markdown sections
 */
export default function MainPageLayout({ layout, blocks }: MainPageLayoutProps) {
  // Map main page layout types to template layouts
  const layoutToTemplate: Record<MainPageLayoutType, PageLayoutType> = {
    'dashboard': 'two-column',
    'magazine': 'masonry',
    'minimal': 'centered',
    'grid': 'masonry',
    'split-screen': 'split-screen',
    'hero-content': 'hero-content',
    'carousel': 'carousel-layout',
    'sticky-sidebar': 'sticky-sidebar',
    'portfolio': 'sidebar-left' // default portfolio layout
  }
  
  const effectiveTemplate = layoutToTemplate[layout] || 'sidebar-left'

  // Create a simple block renderer for main page
  const renderBlocks = (blockList: (React.ReactNode | null)[]) => {
    return blockList.map((block, index) => (
      <React.Fragment key={index}>
        {block}
      </React.Fragment>
    ))
  }
  
  // Get layout class for styling
  const layoutClass = `main-page-layout--${layout}`

  switch (effectiveTemplate) {
    case 'sidebar-left':
      return (
        <div className={`main-page-layout main-page-layout--sidebar-left ${layoutClass}`}>
          <aside className="main-page-sidebar">
            {blocks.skills}
            {blocks.timeline}
          </aside>
          <main className="main-page-content">
            {renderBlocks([blocks.hero, blocks.aboutMe, blocks.projects, blocks.blog, blocks.contact].filter(Boolean))}
          </main>
        </div>
      )

    case 'sidebar-right':
      return (
        <div className={`main-page-layout main-page-layout--sidebar-right ${layoutClass}`}>
          <main className="main-page-content">
            {renderBlocks([blocks.hero, blocks.aboutMe, blocks.projects, blocks.blog, blocks.contact].filter(Boolean))}
          </main>
          <aside className="main-page-sidebar">
            {blocks.skills}
            {blocks.timeline}
          </aside>
        </div>
      )

    case 'full-width':
      return (
        <div className={`main-page-layout main-page-layout--full-width ${layoutClass}`}>
          {renderBlocks([blocks.hero, blocks.aboutMe, blocks.projects, blocks.skills, blocks.timeline, blocks.blog, blocks.contact].filter(Boolean))}
        </div>
      )

    case 'two-column':
      return (
        <div className={`main-page-layout main-page-layout--two-column ${layoutClass}`}>
          <div className="main-page-column-1">
            {renderBlocks([blocks.hero, blocks.projects].filter(Boolean))}
          </div>
          <div className="main-page-column-2">
            {renderBlocks([blocks.skills, blocks.blog].filter(Boolean))}
          </div>
        </div>
      )

    case 'centered':
      return (
        <div className={`main-page-layout main-page-layout--centered ${layoutClass}`}>
          <div className="main-page-centered-content">
            {renderBlocks([blocks.hero, blocks.aboutMe, blocks.projects, blocks.skills, blocks.timeline, blocks.blog, blocks.contact].filter(Boolean))}
          </div>
        </div>
      )

    case 'masonry':
      return (
        <div className={`main-page-layout main-page-layout--masonry ${layoutClass}`}>
          <div className="main-page-masonry-grid">
            {renderBlocks([blocks.hero, blocks.projects, blocks.skills, blocks.blog].filter(Boolean))}
          </div>
        </div>
      )

    case 'split-screen':
      return (
        <div className={`main-page-layout main-page-layout--split-screen ${layoutClass}`}>
          <div className="main-page-left">
            {renderBlocks([blocks.hero, blocks.skills].filter(Boolean))}
          </div>
          <div className="main-page-right">
            {renderBlocks([blocks.projects, blocks.blog].filter(Boolean))}
          </div>
        </div>
      )

    case 'hero-content':
      return (
        <div className={`main-page-layout main-page-layout--hero-content ${layoutClass}`}>
          <div className="main-page-hero">
            {blocks.hero}
          </div>
          <div className="main-page-content">
            {renderBlocks([blocks.aboutMe, blocks.projects, blocks.skills, blocks.timeline, blocks.blog, blocks.contact].filter(Boolean))}
          </div>
        </div>
      )

    case 'carousel-layout':
      return (
        <div className={`main-page-layout main-page-layout--carousel ${layoutClass}`}>
          {renderBlocks([blocks.hero, blocks.projects, blocks.skills, blocks.blog].filter(Boolean))}
        </div>
      )

    case 'sticky-sidebar':
      return (
        <div className={`main-page-layout main-page-layout--sticky-sidebar ${layoutClass}`}>
          <aside className="main-page-sidebar main-page-sidebar--sticky">
            {blocks.skills}
            {blocks.timeline}
          </aside>
          <main className="main-page-content">
            {renderBlocks([blocks.hero, blocks.aboutMe, blocks.projects, blocks.blog, blocks.contact].filter(Boolean))}
          </main>
        </div>
      )

    default:
      console.warn(`Unknown layout template: ${effectiveTemplate}, falling back to full-width`)
      return (
        <div className={`main-page-layout main-page-layout--full-width ${layoutClass}`}>
          {renderBlocks([blocks.hero, blocks.aboutMe, blocks.projects, blocks.skills, blocks.timeline, blocks.blog, blocks.contact].filter(Boolean))}
        </div>
      )
  }
}

