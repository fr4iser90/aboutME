'use client'

import { TerminalSection } from '@/features/terminal'
import { SkillCard, SkillsTimeline } from '@/features/portfolio'
import type { Skill } from '../../types'

interface SkillsSectionLayoutProps {
  skills: Skill[]
  timeline: Array<{
    year: number
    skills: string[]
    description?: string
    content?: string
  }>
  config?: {
    enabled?: boolean
    showTimeline?: boolean
  }
  layout?: {
    template?: 'grid' | 'list' | 'tags' | 'compact'
  }
  onYearClick?: (yearData: any) => void
}

export default function SkillsSectionLayout({ 
  skills, 
  timeline,
  config, 
  layout,
  onYearClick 
}: SkillsSectionLayoutProps) {
  const template = layout?.template || 'grid'
  
  if (!config?.enabled) return null
  
  // Grid Layout (default)
  if (template === 'grid') {
    return (
      <TerminalSection id="skills" title="Skills & Technologies">
        <div className="skills-grid mb-8">
          {skills.map((skill, index) => (
            <SkillCard key={index} skill={skill} />
          ))}
        </div>

        {config.showTimeline && timeline.length > 0 && (
          <SkillsTimeline 
            timeline={timeline} 
            skills={skills} 
            onYearClick={onYearClick}
          />
        )}
      </TerminalSection>
    )
  }
  
  // List Layout
  if (template === 'list') {
    return (
      <TerminalSection id="skills" title="Skills & Technologies">
        <div className="skills-list mb-8">
          {skills.map((skill, index) => (
            <SkillCard key={index} skill={skill} />
          ))}
        </div>

        {config.showTimeline && timeline.length > 0 && (
          <SkillsTimeline 
            timeline={timeline} 
            skills={skills} 
            onYearClick={onYearClick}
          />
        )}
      </TerminalSection>
    )
  }
  
  // Tags Layout
  if (template === 'tags') {
    return (
      <TerminalSection id="skills" title="Skills & Technologies">
        <div className="skills-tags mb-8">
          {skills.map((skill, index) => (
            <span key={index} className="skill-tag">
              {skill.name}
            </span>
          ))}
        </div>

        {config.showTimeline && timeline.length > 0 && (
          <SkillsTimeline 
            timeline={timeline} 
            skills={skills} 
            onYearClick={onYearClick}
          />
        )}
      </TerminalSection>
    )
  }
  
  // Compact Layout
  return (
    <TerminalSection id="skills" title="Skills & Technologies">
      <div className="skills-compact mb-8">
        {skills.map((skill, index) => (
          <div key={index} className="skill-compact-item">
            <span className="skill-compact-name">{skill.name}</span>
            <span className="skill-compact-level">{skill.level}</span>
          </div>
        ))}
      </div>

      {config.showTimeline && timeline.length > 0 && (
        <SkillsTimeline 
          timeline={timeline} 
          skills={skills} 
          onYearClick={onYearClick}
        />
      )}
    </TerminalSection>
  )
}

