import { Skill } from '@/domain/entities/Skill';
import { SkillRepository } from '@/domain/repositories/SkillRepository';
import { PublicSkillApi } from '@/infrastructure/api/public/skills';

export class SkillService {
  private repository: SkillRepository;

  constructor() {
    this.repository = new PublicSkillApi();
  }

  async getAllSkills(): Promise<Skill[]> {
    return this.repository.getAll();
  }

  async getSkillById(id: string): Promise<Skill | null> {
    return this.repository.getById(id);
  }

  async getSkillsByCategory(category: string): Promise<Skill[]> {
    return this.repository.getByCategory(category);
  }
}

export const useSkills = () => {
  const service = new SkillService();

  return {
    getAllSkills: service.getAllSkills.bind(service),
    getSkillById: service.getSkillById.bind(service),
    getSkillsByCategory: service.getSkillsByCategory.bind(service),
  };
};
