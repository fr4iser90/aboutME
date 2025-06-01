import { useMemo } from 'react';
import { AdminFileManagerApi } from '@/infrastructure/api/admin/assets';
import { AdminFileManagerService } from './AdminFileManagerService';

export function useAdminFileManager() {
  const service = useMemo(() => new AdminFileManagerService(new AdminFileManagerApi()), []);
  return service;
} 