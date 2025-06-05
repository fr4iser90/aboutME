import { Skill } from '@/domain/entities/Skill';
import { Card, CardContent, CardHeader } from '@/presentation/shared/ui/card';
import { Progress } from '@/presentation/shared/ui/progress';
import Image from 'next/image';

interface SkillCardProps {
  skill: Skill;
}

export const SkillCard = ({ skill }: SkillCardProps) => {
  return (
    <Card>
      <CardHeader className="skill-card__header">
        {skill.icon && (
          <div className="skill-card__icon-wrapper">
            <Image
              src={skill.icon}
              alt={skill.name}
              fill
              className="skill-card__icon"
            />
          </div>
        )}
        <div>
          <h3 className="skill-card__title">{skill.name}</h3>
          <p className="skill-card__category">
            {skill.category}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <Progress value={skill.level} max={100} className="skill-card__progress" />
        {skill.description && (
          <p className="skill-card__description">
            {skill.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
