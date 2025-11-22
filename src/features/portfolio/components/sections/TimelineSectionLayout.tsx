'use client'

import { TerminalSection } from '@/features/terminal'
import { SkillsTimeline } from '../SkillsTimeline'
import type { Skill } from '../../types'

interface TimelineSectionLayoutProps {
  timeline: Array<{
    year: number
    skills: string[]
    description?: string
    content?: string
  }>
  skills: Skill[]
  config?: {
    enabled?: boolean
  }
  layout?: {
    template?: 'vertical' | 'horizontal' | 'compact' | 'cards'
  }
  onYearClick?: (yearData: any) => void
}

export default function TimelineSectionLayout({ 
  timeline,
  skills,
  config, 
  layout,
  onYearClick 
}: TimelineSectionLayoutProps) {
  const template = layout?.template || 'vertical'
  
  if (!config?.enabled || timeline.length === 0) return null
  
  // Vertical Layout (default)
  if (template === 'vertical') {
    return (
      <TerminalSection id="timeline" title="Timeline">
        <div className="timeline-section timeline-section--vertical">
          <SkillsTimeline 
            timeline={timeline}
            skills={skills}
            onYearClick={onYearClick}
          />
        </div>
      </TerminalSection>
    )
  }
  
  // Horizontal Layout
  if (template === 'horizontal') {
    return (
      <TerminalSection id="timeline" title="Timeline">
        <div className="timeline-section timeline-section--horizontal">
          <div className="timeline-horizontal">
            {timeline.map((entry, index) => (
              <div 
                key={index} 
                className="timeline-item timeline-item--horizontal"
                onClick={() => onYearClick?.(entry)}
              >
                <div className="timeline-year">{entry.year}</div>
                <div className="timeline-skills">
                  {entry.skills.slice(0, 3).map((skill, i) => (
                    <span key={i} className="timeline-skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </TerminalSection>
    )
  }
  
  // Compact Layout
  if (template === 'compact') {
    return (
      <TerminalSection id="timeline" title="Timeline">
        <div className="timeline-section timeline-section--compact">
          <div className="timeline-compact">
            {timeline.map((entry, index) => (
              <div 
                key={index} 
                className="timeline-item timeline-item--compact"
                onClick={() => onYearClick?.(entry)}
              >
                <span className="timeline-year">{entry.year}</span>
                <span className="timeline-separator">→</span>
                <span className="timeline-skills-count">{entry.skills.length} skills</span>
              </div>
            ))}
          </div>
        </div>
      </TerminalSection>
    )
  }
  
  // Cards Layout
  return (
    <TerminalSection id="timeline" title="Timeline">
      <div className="timeline-section timeline-section--cards">
        <div className="timeline-cards">
          {timeline.map((entry, index) => (
            <div 
              key={index} 
              className="timeline-card"
              onClick={() => onYearClick?.(entry)}
            >
              <div className="timeline-card__year">{entry.year}</div>
              <div className="timeline-card__skills">
                {entry.skills.slice(0, 5).map((skill, i) => (
                  <span key={i} className="timeline-card__skill">{skill}</span>
                ))}
              </div>
              {entry.description && (
                <p className="timeline-card__description">{entry.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </TerminalSection>
  )
}

