'use client'

import { TerminalSection } from '@/features/terminal'
import { SkillCard, SkillsTimeline } from '@/features/portfolio'
import type { Skill } from '@/features/portfolio/types'

interface SkillsBlockProps {
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
  onYearClick?: (yearData: any) => void
}

export default function SkillsBlock({ skills, timeline, config, onYearClick }: SkillsBlockProps) {
  if (!config?.enabled) return null
  
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

