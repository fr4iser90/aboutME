'use client'

import { useState, useEffect, useRef } from 'react'

interface TimelineEntry {
  year: number
  projects: number
  languages: string[]
  frameworks: string[]
  totalStars: number
  totalCodeLines?: number
  codeLinesByLanguage?: { [language: string]: number }
  milestones: Array<{
    project: string
    stars: number
    language: string
  }>
}

interface SkillsTimelineProps {
  timeline: TimelineEntry[]
  skills?: Array<{
    name: string
    level: string
    category: string
    icon: string
    codeLines?: number
    percentage?: number
  }>
  onYearClick?: (yearData: TimelineEntry) => void
}

export default function SkillsTimeline({ timeline, skills = [], onYearClick }: SkillsTimelineProps) {
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set())
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const year = parseInt(entry.target.getAttribute('data-year') || '0')
            setVisibleCards(prev => new Set(Array.from(prev).concat(year)))
          }
        })
      },
      { threshold: 0.2 }
    )

    const cards = timelineRef.current?.querySelectorAll('.timeline-card')
    cards?.forEach(card => observer.observe(card))

    return () => observer.disconnect()
  }, [timeline])

  const getLanguageIcon = (language: string) => {
    const icons: { [key: string]: string } = {
      'JavaScript': '🟨',
      'TypeScript': '🔷',
      'Python': '🐍',
      'Java': '☕',
      'Shell': '🐚',
      'Vue': '💚',
      'GDScript': '🎮',
      'Nix': '❄️'
    }
    return icons[language] || '💻'
  }

  const getFrameworkIcon = (framework: string) => {
    const icons: { [key: string]: string } = {
      'fastapi': '⚡',
      'nextjs': '▲',
      'docker': '🐳'
    }
    return icons[framework] || '🔧'
  }

  const getSkillLevel = (skillName: string) => {
    if (!skillName || typeof skillName !== 'string') return 'beginner'
    const skill = skills.find(s => s.name.toLowerCase() === skillName.toLowerCase())
    return skill ? skill.level.toLowerCase() : 'beginner'
  }

  const handleCardClick = (entry: TimelineEntry) => {
    if (onYearClick) {
      onYearClick(entry)
    }
  }

  return (
    <div className="timeline">
      <h3 className="timeline__title">
        Skills Timeline
      </h3>

      <div ref={timelineRef} className="timeline__container">
        {/* Timeline Line */}
        <div className="timeline__line">
          <div 
            className="timeline__line-progress"
            style={{ 
              height: `${(visibleCards.size / timeline.length) * 100}%`
            }}
          ></div>
        </div>

        {/* Timeline Cards */}
        <div className="timeline__cards">
          {timeline.map((entry, index) => {
            const isVisible = visibleCards.has(entry.year)
            const isHovered = hoveredCard === entry.year
            
            return (
              <div
                key={entry.year}
                data-year={entry.year}
                className={`timeline-card ${isVisible ? 'timeline-card--visible' : ''} ${isHovered ? 'timeline-card--hovered' : ''}`}
                onMouseEnter={() => setHoveredCard(entry.year)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleCardClick(entry)}
              >
                {/* Timeline Dot */}
                <div className="timeline-card__dot">
                  <div className={`timeline-card__dot-inner ${isHovered ? 'timeline-card__dot-inner--active' : ''}`}></div>
                  {isHovered && <div className="timeline-card__dot-pulse"></div>}
                </div>

                {/* Card Content */}
                <div className="timeline-card__content">
                  {/* Header */}
                  <div className="timeline-card__header">
                    <h4 className="timeline-card__year">{entry.year}</h4>
                    <div className="timeline-card__stats">
                      <div className="timeline-card__stat timeline-card__stat--projects">
                        <span className="timeline-card__stat-number">{entry.projects}</span>
                        <span className="timeline-card__stat-label">Projects</span>
                      </div>
                      <div className="timeline-card__stat timeline-card__stat--stars">
                        <span className="timeline-card__stat-icon">⭐</span>
                        <span className="timeline-card__stat-number">{entry.totalStars}</span>
                      </div>
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="timeline-card__skills">
                    <h5 className="timeline-card__skills-title">Languages</h5>
                    <div className="timeline-card__skills-grid">
                      {entry.languages.map((lang, idx) => (
                        <div
                          key={lang}
                          className={`skill-tag skill-tag--${getSkillLevel(lang)}`}
                          style={{ 
                            animationDelay: `${idx * 100}ms`,
                            animation: isVisible ? 'slideInUp 0.6s ease-out forwards' : 'none'
                          }}
                        >
                          <span className="skill-tag__icon">{getLanguageIcon(lang)}</span>
                          <span className="skill-tag__name">{lang}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Frameworks Section */}
                  {entry.frameworks.length > 0 && (
                    <div className="timeline-card__frameworks">
                      <h5 className="timeline-card__frameworks-title">Frameworks</h5>
                      <div className="timeline-card__frameworks-grid">
                        {entry.frameworks.map((framework, idx) => (
                          <div
                            key={framework}
                            className="framework-tag"
                            style={{ 
                              animationDelay: `${(entry.languages.length + idx) * 100}ms`,
                              animation: isVisible ? 'slideInUp 0.6s ease-out forwards' : 'none'
                            }}
                          >
                            <span className="framework-tag__icon">{getFrameworkIcon(framework)}</span>
                            <span className="framework-tag__name">{framework}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Code Lines Display */}
                  <div className="timeline-card__code-lines">
                    <span className="timeline-card__code-lines-label">
                      {entry.totalCodeLines ? `${entry.totalCodeLines.toLocaleString()} Code Lines` : 'No Code Data'}
                    </span>
                  </div>

                  {/* Key Milestones */}
                  {entry.milestones.length > 0 && (
                    <div className="timeline-card__milestones">
                      <h5 className="timeline-card__milestones-title">Key Projects</h5>
                      <div className="timeline-card__milestones-list">
                        {entry.milestones.slice(0, 2).map((milestone, idx) => (
                          <div
                            key={idx}
                            className="milestone-item"
                            style={{ 
                              animationDelay: `${(entry.languages.length + entry.frameworks.length + idx) * 100}ms`,
                              animation: isVisible ? 'slideInUp 0.6s ease-out forwards' : 'none'
                            }}
                          >
                            <div className="milestone-item__dot"></div>
                            <div className="milestone-item__content">
                              <span className="milestone-item__name">{milestone.project}</span>
                              <div className="milestone-item__meta">
                                <span className="milestone-item__stars">⭐ {milestone.stars}</span>
                                {milestone.language && (
                                  <span className="milestone-item__language">{milestone.language}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {entry.milestones.length > 2 && (
                          <div className="timeline-card__more">
                            +{entry.milestones.length - 2} more projects
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="timeline__summary">
        <div className="timeline__summary-card">
          <div className="timeline__summary-number timeline__summary-number--blue">
            {timeline.reduce((sum, entry) => sum + entry.projects, 0)}
          </div>
          <div className="timeline__summary-label">Total Projects</div>
        </div>
        
        <div className="timeline__summary-card">
          <div className="timeline__summary-number timeline__summary-number--green">
            {new Set(timeline.flatMap(entry => entry.languages)).size}
          </div>
          <div className="timeline__summary-label">Languages</div>
        </div>
        
        <div className="timeline__summary-card">
          <div className="timeline__summary-number timeline__summary-number--yellow">
            {timeline.reduce((sum, entry) => sum + entry.totalStars, 0)}
          </div>
          <div className="timeline__summary-label">Total Stars</div>
        </div>
      </div>

      {/* Year Overview Modal */}
      {/* Modal wird außerhalb gerendert */}
    </div>
  )
}