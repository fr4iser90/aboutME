import { config } from '@/domain/shared/utils/config';

export interface File {
  id: string;
  name: string;
  path: string;
  parent_id?: string;
  is_folder: boolean;
  size?: number;
  mime_type?: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  used_in: Record<string, string>;
}

export class AdminFileManagerApi {
  private baseUrl = `${config.backendUrl}/api/admin/filemanager`;

  async listFiles(parent_id?: string): Promise<File[]> {
    const url = new URL(`${this.baseUrl}/files`, window.location.origin);
    if (parent_id) {
      url.searchParams.append('parent_id', parent_id);
    }
    
    const res = await fetch(url.toString(), {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch files');
    return res.json();
  }

  async createFile(formData: FormData, parent_id?: string): Promise<File> {
    if (parent_id) {
      formData.append('parent_id', parent_id);
    }
    
    const res = await fetch(`${this.baseUrl}/files`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });
    if (!res.ok) throw new Error('Failed to create file');
    return res.json();
  }

  async createFolder(name: string, parent_id?: string): Promise<File> {
    const res = await fetch(`${this.baseUrl}/folders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, parent_id })
    });
    if (!res.ok) throw new Error('Failed to create folder');
    return res.json();
  }

  async deleteFile(file_id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/files/${file_id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to delete file');
  }

  async moveFile(file_id: string, new_parent_id?: string): Promise<File> {
    let url = `${this.baseUrl}/files/${file_id}/move`;
    if (typeof new_parent_id === 'string' && new_parent_id.length > 0) {
      url += `?new_parent_id=${encodeURIComponent(new_parent_id)}`;
    }
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to move file');
    return res.json();
  }
} 