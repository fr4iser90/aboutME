import { Skill } from '@/domain/entities/Skill';

export interface SkillRepository {
  getAll(): Promise<Skill[]>;
  getById(id: string): Promise<Skill | null>;
  getByCategory(category: string): Promise<Skill[]>;
  create(skill: Omit<Skill, 'id'>): Promise<Skill>;
  update(id: string, skill: Partial<Skill>): Promise<Skill>;
  delete(id: string): Promise<void>;
  reorder(ids: string[]): Promise<void>;
}
