import { Theme } from '../entities/Theme';

export interface ThemeRepository {
  getAll(): Promise<Theme[]>;
  getById(id: string): Promise<Theme | null>;
  update(id: string, theme: Partial<Theme>): Promise<Theme>;
  delete(id: string): Promise<void>;
}
