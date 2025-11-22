'use client'

import { useState } from 'react'

interface Skill {
  name: string
  count: number
  level: string
  category: string
  icon: string
}

interface SkillCardProps {
  skill: Skill
}

export default function SkillCard({ skill }: SkillCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div 
      className={`skill-card ${isHovered ? 'skill-card--hover' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="skill-card__icon">{skill.icon}</div>
      <h3 className="skill-card__name">
        {skill.name}
      </h3>
      <p className="skill-card__level">{skill.level}</p>
      <div className="skill-card__progress">
        <div 
          className="skill-card__progress-bar"
          style={{ width: `${Math.min(skill.count * 10, 100)}%` }}
        ></div>
      </div>
      <div className="skill-card__glow"></div>
    </div>
  )
}
