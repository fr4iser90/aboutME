import { AdminFileManagerApi, File } from '@/infrastructure/api/admin/assets';

export class AdminFileManagerService {
  constructor(private readonly api: AdminFileManagerApi) {}

  getFile(id: string) {
    return this.api.getFile(id);
  }

  listFiles(parent_id?: string) {
    return this.api.listFiles(parent_id);
  }

  createFile(data: Partial<File>) {
    return this.api.createFile(data);
  }

  updateFile(id: string, data: Partial<File>) {
    return this.api.updateFile(id, data);
  }

  deleteFile(id: string) {
    return this.api.deleteFile(id);
  }

  moveFile(id: string, new_parent_id?: string) {
    return this.api.moveFile(id, new_parent_id);
  }
} 