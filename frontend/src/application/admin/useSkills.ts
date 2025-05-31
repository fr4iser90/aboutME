import { Skill } from '@/domain/entities/Skill';
import { SkillRepository } from '@/domain/repositories/SkillRepository';
import { AdminSkillApi } from '@/infrastructure/api/admin/skills';

export class AdminSkillService {
  private repository: SkillRepository;

  constructor() {
    this.repository = new AdminSkillApi();
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

  async createSkill(skill: Omit<Skill, 'id'>): Promise<Skill> {
    return this.repository.create(skill);
  }

  async updateSkill(id: string, skill: Partial<Skill>): Promise<Skill> {
    return this.repository.update(id, skill);
  }

  async deleteSkill(id: string): Promise<void> {
    return this.repository.delete(id);
  }

  async reorderSkills(ids: string[]): Promise<void> {
    return this.repository.reorder(ids);
  }
}

export const useAdminSkills = () => {
  const service = new AdminSkillService();

  return {
    getAllSkills: service.getAllSkills.bind(service),
    getSkillById: service.getSkillById.bind(service),
    getSkillsByCategory: service.getSkillsByCategory.bind(service),
    createSkill: service.createSkill.bind(service),
    updateSkill: service.updateSkill.bind(service),
    deleteSkill: service.deleteSkill.bind(service),
    reorderSkills: service.reorderSkills.bind(service),
  };
};
