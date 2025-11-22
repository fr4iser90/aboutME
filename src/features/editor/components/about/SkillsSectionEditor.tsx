'use client'

import { type AboutSkillsSection } from '../../types/about'

interface SkillsSectionEditorProps {
  section: AboutSkillsSection
  onUpdate: (section: AboutSkillsSection) => void
}

export default function SkillsSectionEditor({ section, onUpdate }: SkillsSectionEditorProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...section,
      title: e.target.value
    })
  }

  const handleSkillChange = (index: number, value: string) => {
    const newSkills = [...section.skills]
    newSkills[index] = value
    onUpdate({
      ...section,
      skills: newSkills
    })
  }

  const handleAddSkill = () => {
    onUpdate({
      ...section,
      skills: [...section.skills, '']
    })
  }

  const handleRemoveSkill = (index: number) => {
    const newSkills = section.skills.filter((_, i) => i !== index)
    onUpdate({
      ...section,
      skills: newSkills.length > 0 ? newSkills : ['']
    })
  }

  return (
    <div className="about-skills-section-editor">
      <div className="about-skills-section-editor__field">
        <label className="about-skills-section-editor__label">
          Title
        </label>
        <input
          type="text"
          value={section.title}
          onChange={handleTitleChange}
          className="about-skills-section-editor__input"
          placeholder="Top Skills"
        />
      </div>

      <div className="about-skills-section-editor__skills">
        <label className="about-skills-section-editor__label">
          Skills
        </label>
        {section.skills.map((skill, index) => (
          <div key={index} className="about-skills-section-editor__skill">
            <input
              type="text"
              value={skill}
              onChange={(e) => handleSkillChange(index, e.target.value)}
              className="about-skills-section-editor__input"
              placeholder={`Skill ${index + 1}`}
            />
            <button
              type="button"
              onClick={() => handleRemoveSkill(index)}
              className="about-skills-section-editor__remove"
              disabled={section.skills.length === 1}
            >
              🗑️
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddSkill}
          className="about-skills-section-editor__add"
        >
          + Add Skill
        </button>
      </div>
    </div>
  )
}

