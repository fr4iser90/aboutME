import { Skill } from '@/domain/entities/Skill';
import { SkillRepository } from '@/domain/repositories/SkillRepository';

export class PublicSkillApi implements SkillRepository {
  private readonly baseUrl = '/api/skills';

  async getAll(): Promise<Skill[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) throw new Error('Failed to fetch skills');
    return response.json();
  }

  async getById(id: string): Promise<Skill | null> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch skill');
    }
    return response.json();
  }

  async getByCategory(category: string): Promise<Skill[]> {
    const response = await fetch(`${this.baseUrl}/category/${category}`);
    if (!response.ok) throw new Error('Failed to fetch skills by category');
    return response.json();
  }

  // These methods are not available in the public API
  async create(): Promise<Skill> {
    throw new Error('Not available in public API');
  }

  async update(): Promise<Skill> {
    throw new Error('Not available in public API');
  }

  async delete(): Promise<void> {
    throw new Error('Not available in public API');
  }

  async reorder(): Promise<void> {
    throw new Error('Not available in public API');
  }
}
