import { useSkills } from '@/application/public/useSkills';
import { SkillCard } from '@/presentation/public/components/SkillCard';
import { useEffect, useState } from 'react';
import { Skill } from '@/domain/entities/Skill';

export const SkillsView = () => {
  const { getAllSkills } = useSkills();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const data = await getAllSkills();
        setSkills(data);
      } catch (err) {
        setError('Failed to load skills');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, [getAllSkills]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="skills-page-error">{error}</div>;
  }

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className="container mx-auto py-8">
      <h1 className="skills-page-title">My Skills</h1>
      {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
        <div key={category} className="mb-8">
          <h2 className="skills-page-category">{category}</h2>
          <div className="skills-page-grid">
            {categorySkills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
