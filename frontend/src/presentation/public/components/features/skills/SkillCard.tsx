import { Skill } from '@/domain/entities/Skill';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';

interface SkillCardProps {
  skill: Skill;
}

export const SkillCard = ({ skill }: SkillCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        {skill.icon && (
          <div className="relative w-12 h-12">
            <Image
              src={skill.icon}
              alt={skill.name}
              fill
              className="object-contain"
            />
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold">{skill.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {skill.category}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <Progress value={skill.level} max={100} className="mb-2" />
        {skill.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {skill.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
