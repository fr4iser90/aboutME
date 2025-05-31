import { Skill } from '@/domain/entities/Skill';
import { SkillRepository } from '@/domain/repositories/SkillRepository';

export class AdminSkillApi implements SkillRepository {
  private readonly baseUrl = '/api/admin/skills';

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

  async create(skill: Omit<Skill, 'id'>): Promise<Skill> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(skill),
    });
    if (!response.ok) throw new Error('Failed to create skill');
    return response.json();
  }

  async update(id: string, skill: Partial<Skill>): Promise<Skill> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(skill),
    });
    if (!response.ok) throw new Error('Failed to update skill');
    return response.json();
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete skill');
  }

  async reorder(ids: string[]): Promise<void> {
    const response = await fetch(`${this.baseUrl}/reorder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });
    if (!response.ok) throw new Error('Failed to reorder skills');
  }
}
