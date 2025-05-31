import { Skill } from '@/domain/entities/Skill';
import { Button } from '@/presentation/shared/ui/button';
import { Input } from '@/presentation/shared/ui/input';
import { Textarea } from '@/presentation/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/presentation/shared/ui/select';
import { useState } from 'react';

interface SkillFormProps {
  skill?: Skill;
  onSubmit: (skill: Omit<Skill, 'id'>) => Promise<void>;
  onCancel: () => void;
}

export const SkillForm = ({ skill, onSubmit, onCancel }: SkillFormProps) => {
  const [name, setName] = useState(skill?.name ?? '');
  const [category, setCategory] = useState(skill?.category ?? '');
  const [level, setLevel] = useState(skill?.level.toString() ?? '50');
  const [description, setDescription] = useState(skill?.description ?? '');
  const [icon, setIcon] = useState(skill?.icon ?? '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit({
        name,
        category,
        level: parseInt(level, 10),
        description: description || undefined,
        icon: icon || undefined,
        order: skill?.order ?? 0,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Name
        </label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-1">
          Category
        </label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Frontend">Frontend</SelectItem>
            <SelectItem value="Backend">Backend</SelectItem>
            <SelectItem value="DevOps">DevOps</SelectItem>
            <SelectItem value="Database">Database</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="level" className="block text-sm font-medium mb-1">
          Level (0-100)
        </label>
        <Input
          id="level"
          type="number"
          min="0"
          max="100"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="icon" className="block text-sm font-medium mb-1">
          Icon URL
        </label>
        <Input
          id="icon"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : skill ? 'Update Skill' : 'Create Skill'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
