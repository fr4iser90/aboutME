import { useEffect, useState, useCallback, useContext, useRef } from 'react';
import { useAdminFileManager } from '@/application/admin/filemanager/useAdminFileManager';
import type { File } from '@/infrastructure/api/admin/filemanager';
import { Button } from '@/presentation/shared/ui/button';
import { FolderPlus, FilePlus } from 'lucide-react';
import { Input } from '@/presentation/shared/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/presentation/shared/ui/dialog';
import { FileManagerContext } from '@/presentation/admin/pages/layout';

interface FileTreeProps {
  onSelectFile?: (file: File) => void;
  parentId?: string | null;
  autoLoad?: boolean;
}

export function FileTree({ onSelectFile, parentId = null, autoLoad = true }: FileTreeProps) {
  const fileManager = useAdminFileManager();
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const { refreshFiles, refreshTrigger } = useContext(FileManagerContext);
  const isMounted = useRef(true);
  const lastFetchTime = useRef(0);

  const fetchFiles = useCallback(async () => {
    if (!isMounted.current) return;
    
    const now = Date.now();
    if (now - lastFetchTime.current < 1000) return; // Prevent fetching more often than once per second
    
    try {
      setLoading(true);
      setError(null);
      const data = await fileManager.listFiles(parentId || undefined);
      if (isMounted.current) {
        if (Array.isArray(data)) {
          setFiles(data);
          lastFetchTime.current = now;
        } else {
          setFiles([]);
          setError('Invalid response from server: expected an array.');
        }
      }
    } catch (err) {
      if (isMounted.current) {
        setFiles([]);
        setError('Failed to load files');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [parentId, fileManager]);

  useEffect(() => {
    isMounted.current = true;
    if (autoLoad) {
      fetchFiles();
    }
    return () => {
      isMounted.current = false;
    };
  }, [autoLoad, fetchFiles]);

  useEffect(() => {
    if (refreshTrigger > 0 && isMounted.current) {
      fetchFiles();
    }
  }, [refreshTrigger, fetchFiles]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !isMounted.current) return;

    try {
      setIsCreatingFolder(true);
      await fileManager.createFolder(newFolderName, parentId || undefined);
      if (isMounted.current) {
        setNewFolderName('');
        setIsFolderDialogOpen(false);
        fetchFiles();
      }
    } catch (err) {
      if (isMounted.current) {
        setError('Failed to create folder');
      }
    } finally {
      if (isMounted.current) {
        setIsCreatingFolder(false);
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !isMounted.current) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      await fileManager.createFile(formData, parentId || undefined);
      if (isMounted.current) {
        fetchFiles();
      }
    } catch (err) {
      if (isMounted.current) {
        setError('Failed to upload file');
      }
    }
  };

  if (loading) return <div>Loading files...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <FolderPlus className="w-4 h-4" />
              New Folder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
              <Button
                onClick={handleCreateFolder}
                disabled={isCreatingFolder || !newFolderName.trim()}
              >
                {isCreatingFolder ? 'Creating...' : 'Create Folder'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="relative">
          <input
            type="file"
            className="hidden"
            id="file-upload"
            onChange={handleFileUpload}
          />
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <FilePlus className="w-4 h-4" />
            Upload File
          </Button>
        </div>
      </div>

      {files.length === 0 ? (
        <div className="text-slate-400">No files found.</div>
      ) : (
        <ul className="space-y-1">
          {files.map(file => (
            <li
              key={file.id}
              className={`p-2 cursor-pointer rounded hover:bg-purple-900/30 ${
                file.is_folder ? 'font-semibold' : ''
              }`}
              onClick={() => onSelectFile?.(file)}
              title={file.name}
            >
              {file.is_folder ? '📁' : '📄'} {file.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 