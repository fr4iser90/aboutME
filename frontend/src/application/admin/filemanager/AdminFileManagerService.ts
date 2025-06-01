import { AdminFileManagerApi, File } from '@/infrastructure/api/admin/filemanager';

export class AdminFileManagerService {
  constructor(private readonly api: AdminFileManagerApi) {}

  listFiles(parent_id?: string) {
    return this.api.listFiles(parent_id);
  }

  createFile(formData: FormData, parent_id?: string) {
    return this.api.createFile(formData, parent_id);
  }

  createFiles(formData: FormData, parent_id?: string) {
    return this.api.createFiles(formData, parent_id);
  }

  createFolder(name: string, parent_id?: string) {
    return this.api.createFolder(name, parent_id);
  }

  deleteFile(id: string) {
    return this.api.deleteFile(id);
  }

  moveFile(id: string, new_parent_id?: string) {
    return this.api.moveFile(id, new_parent_id);
  }
} 