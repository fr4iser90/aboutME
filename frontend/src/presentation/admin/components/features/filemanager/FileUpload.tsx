import { useState, useCallback, useContext } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/presentation/shared/ui/button';
import { useAdminFileManager } from '@/application/admin/filemanager/useAdminFileManager';
import type { File as ApiFile } from '@/infrastructure/api/admin/filemanager';
import { FileManagerContext } from '@/presentation/admin/pages/layout';

interface FileUploadProps {
  onUploadComplete: () => void;
  parentId?: string;
  acceptedFileTypes?: string[];
  maxSize?: number;
}

export function FileUpload({ 
  onUploadComplete, 
  parentId,
  acceptedFileTypes, 
  maxSize = 10 * 1024 * 1024 
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileManager = useAdminFileManager();
  const { refreshFiles } = useContext(FileManagerContext);

  const onDrop = useCallback(async (acceptedFiles: globalThis.File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append('file', file);
      if (parentId) {
        formData.append('parent_id', parentId);
      }
      
      await fileManager.createFile(formData as any, parentId);
      refreshFiles();
      onUploadComplete();
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [fileManager, parentId, onUploadComplete, refreshFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes ? {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.ogg'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    } : undefined,
    maxSize,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="text-gray-600">Uploading...</div>
        ) : isDragActive ? (
          <div className="text-blue-500">Drop the file here...</div>
        ) : (
          <div>
            <div className="text-gray-600 mb-2">
              Drag & drop a file here, or click to select
            </div>
            <div className="text-sm text-gray-500">
              Supported formats: Images, Videos, PDF, Word
            </div>
          </div>
        )}
      </div>
      {error && (
        <div className="mt-2 text-red-500 text-sm">{error}</div>
      )}
    </div>
  );
} 