'use client';

import { useState, useContext, useCallback, useEffect } from 'react';
import { FileUpload } from '@/presentation/admin/components/features/filemanager/FileUpload';
import { FilePreview } from '@/presentation/admin/components/features/filemanager/FilePreview';
import { FileInformation } from '@/presentation/admin/components/features/filemanager/FileInformation';
import { FileManagerContext } from '@/presentation/admin/pages/layout';
import type { File } from '@/infrastructure/api/admin/filemanager';

export default function AdminFilesPageContent() {
  const { selectedFile, setSelectedFile } = useContext(FileManagerContext);
  const [currentFolder, setCurrentFolder] = useState<string | undefined>(undefined);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    if (!isMounted) return;
    setSelectedFile(file);
    if (file.is_folder) {
      setCurrentFolder(file.id);
    }
  }, [isMounted, setSelectedFile]);

  const handleUploadComplete = useCallback(() => {
    if (!isMounted) return;
    setSelectedFile(null);
  }, [isMounted, setSelectedFile]);

  if (!isMounted) return null;

  return (
    <div className="w-full h-full">
      <div className="flex-1 p-6 overflow-auto flex flex-col gap-8">
        <FileUpload 
          onUploadComplete={handleUploadComplete}
          parentId={currentFolder}
        />
        {selectedFile && (
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <FilePreview file={selectedFile} />
            </div>
            <div className="w-full md:w-96">
              <FileInformation file={selectedFile} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 