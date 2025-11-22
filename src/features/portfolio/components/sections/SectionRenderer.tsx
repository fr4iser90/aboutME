'use client'

import React from 'react'
import { 
  type AboutSection,
  type AboutTextSection,
  type AboutSkillsSection,
  type AboutContactSection,
  type AboutLinksSection,
  type AboutImageSection
} from '@/features/editor/types/about'
import BlockRenderer from '../blocks/BlockRenderer'
import { convertSectionBlocksToBlocks } from '../../utils/blocksConverter'
import type { Block, LinkBlock, TextBlock, ListBlock, ImageBlock } from '../../types/blocks'

interface SectionRendererProps {
  section: AboutSection
}

export default function SectionRenderer({ section }: SectionRendererProps) {
  switch (section.type) {
    case 'text':
      const textSection = section as AboutTextSection
      const blocks = convertSectionBlocksToBlocks(textSection)
      return (
        <div id={section.id} className="section section--text">
          <h2 className="section__title">{section.title}</h2>
          <div className="section__content">
            {blocks.map((block) => (
              <BlockRenderer key={block.id} block={block} context="content" />
            ))}
          </div>
        </div>
      )

    case 'skills':
      const skillsSection = section as AboutSkillsSection
      // Convert skills to ListBlock
      const skillsBlock: ListBlock = {
        id: `${section.id}-skills-list`,
        type: 'list',
        style: 'bullet',
        items: skillsSection.skills
      }
      return (
        <div id={section.id} className="section section--skills">
          <h2 className="section__title">{section.title}</h2>
          <div className="section__content">
            <BlockRenderer block={skillsBlock as Block} context="content" />
          </div>
        </div>
      )

    case 'contact':
      const contactSection = section as AboutContactSection
      // Convert contact info to blocks
      const contactBlocks: Block[] = []
      
      if (contactSection.email) {
        const emailBlock: LinkBlock = {
          id: `${section.id}-email`,
          type: 'link',
          label: contactSection.email,
          url: `mailto:${contactSection.email}`,
          target: '_self'
        }
        contactBlocks.push(emailBlock as Block)
      }
      
      if (contactSection.location) {
        const locationBlock: TextBlock = {
          id: `${section.id}-location`,
          type: 'text',
          content: `Location: ${contactSection.location}`,
          style: 'default'
        }
        contactBlocks.push(locationBlock as Block)
      }
      
      if (contactSection.timezone) {
        const timezoneBlock: TextBlock = {
          id: `${section.id}-timezone`,
          type: 'text',
          content: `Timezone: ${contactSection.timezone}`,
          style: 'default'
        }
        contactBlocks.push(timezoneBlock as Block)
      }
      
      return (
        <div id={section.id} className="section section--contact">
          <h2 className="section__title">{section.title}</h2>
          <div className="section__content">
            {contactBlocks.map((block) => (
              <BlockRenderer key={block.id} block={block} context="content" />
            ))}
          </div>
        </div>
      )

    case 'links':
      const linksSection = section as AboutLinksSection
      // Convert links to LinkBlocks
      const linkBlocks: Block[] = linksSection.links.map((link, index) => ({
        id: `${section.id}-link-${index}`,
        type: 'link',
        label: link.label,
        url: link.url,
        target: '_blank',
        rel: 'noopener noreferrer'
      } as LinkBlock))
      
      return (
        <div id={section.id} className="section section--links">
          <h2 className="section__title">{section.title}</h2>
          <div className="section__content">
            {linkBlocks.map((block) => (
              <BlockRenderer key={block.id} block={block} context="content" />
            ))}
          </div>
        </div>
      )

    case 'image':
      const imageSection = section as AboutImageSection
      // Convert image to ImageBlock
      const imageBlock: ImageBlock = {
        id: `${section.id}-image`,
        type: 'image',
        imageUrl: imageSection.imageUrl,
        alt: imageSection.alt,
        caption: imageSection.caption
      }
      
      return (
        <div id={section.id} className="section section--image">
          <h2 className="section__title">{section.title}</h2>
          <div className="section__content">
            <BlockRenderer block={imageBlock as Block} context="content" />
          </div>
        </div>
      )

    default:
      return null
  }
}

