import { useEffect, useState, useCallback, useContext, useRef } from 'react';
import { useAdminFileManager } from '@/application/admin/filemanager/useAdminFileManager';
import type { File } from '@/infrastructure/api/admin/filemanager';
import { Button } from '@/presentation/shared/ui/button';
import { FolderPlus, ChevronRight, ChevronDown } from 'lucide-react';
import { Input } from '@/presentation/shared/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/presentation/shared/ui/dialog';
import { FileManagerContext } from '@/presentation/admin/pages/layout';

interface FileTreeProps {
  onSelectFile?: (file: File) => void;
  parentId?: string | null;
  autoLoad?: boolean;
}

// Helper for recursive tree
function FileTreeNode({
  file,
  depth,
  expandedFolders,
  toggleFolder,
  fetchChildren,
  childrenMap,
  onSelectFile,
  selectedId,
  onDragStart,
  onDrop,
  onDragOver,
  draggingId,
  dropTargetId,
}: {
  file: File;
  depth: number;
  expandedFolders: Set<string>;
  toggleFolder: (id: string) => void;
  fetchChildren: (parentId: string) => void;
  childrenMap: Record<string, File[]>;
  onSelectFile?: (file: File) => void;
  selectedId?: string;
  onDragStart: (file: File) => void;
  onDrop: (target: File) => void;
  onDragOver: (target: File) => void;
  draggingId?: string;
  dropTargetId?: string;
}) {
  const isExpanded = expandedFolders.has(file.id);
  const children = childrenMap[file.id] || [];
  const isDropTarget = dropTargetId === file.id;
  return (
    <div
      style={{ paddingLeft: depth * 16 }}
      draggable
      onDragStart={e => {
        e.stopPropagation();
        onDragStart(file);
      }}
      onDragOver={e => {
        e.preventDefault();
        e.stopPropagation();
        if (file.is_folder && file.id !== draggingId) {
          onDragOver(file);
        }
      }}
      onDrop={e => {
        e.preventDefault();
        e.stopPropagation();
        if (file.is_folder && file.id !== draggingId) {
          onDrop(file);
        }
      }}
      onDragEnd={e => {
        e.stopPropagation();
        onDragOver({} as File); // Clear drop target
      }}
      className={`relative ${isDropTarget ? 'bg-purple-700/30' : ''}`}
    >
      <div
        className={`flex items-center cursor-pointer rounded px-1 py-0.5 hover:bg-purple-900/30 ${file.id === selectedId ? 'bg-purple-900/40' : ''}`}
        onClick={() => {
          if (file.is_folder) {
            toggleFolder(file.id);
            if (!isExpanded) fetchChildren(file.id);
          } else {
            onSelectFile?.(file);
          }
        }}
        title={file.name}
      >
        {file.is_folder ? (
          <span className="mr-1">
            {isExpanded ? <ChevronDown className="inline w-4 h-4" /> : <ChevronRight className="inline w-4 h-4" />}
          </span>
        ) : (
          <span className="inline-block w-5" />
        )}
        <span className="mr-1">{file.is_folder ? (isExpanded ? '📂' : '📁') : '📄'}</span>
        <span className={file.is_folder ? 'font-semibold' : ''}>{file.name}</span>
      </div>
      {isExpanded && file.is_folder && children.length > 0 && (
        <div>
          {children.map(child => (
            <FileTreeNode
              key={child.id}
              file={child}
              depth={depth + 1}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
              fetchChildren={fetchChildren}
              childrenMap={childrenMap}
              onSelectFile={onSelectFile}
              selectedId={selectedId}
              onDragStart={onDragStart}
              onDrop={onDrop}
              onDragOver={onDragOver}
              draggingId={draggingId}
              dropTargetId={dropTargetId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree({ onSelectFile, parentId = null, autoLoad = true }: FileTreeProps) {
  const fileManager = useAdminFileManager();
  const [files, setFiles] = useState<File[]>([]);
  const [childrenMap, setChildrenMap] = useState<Record<string, File[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [draggingFile, setDraggingFile] = useState<File | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | undefined>(undefined);
  const { refreshFiles, refreshTrigger } = useContext(FileManagerContext);
  const isMounted = useRef(true);
  const lastFetchTime = useRef(0);

  // Fetch root files
  const fetchFiles = useCallback(async () => {
    if (!isMounted.current) return;
    const now = Date.now();
    if (now - lastFetchTime.current < 1000) return;
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

  // Fetch children for a folder
  const fetchChildren = useCallback(async (folderId: string) => {
    try {
      const data = await fileManager.listFiles(folderId);
      setChildrenMap(prev => ({ ...prev, [folderId]: data }));
    } catch {
      setChildrenMap(prev => ({ ...prev, [folderId]: [] }));
    }
  }, [fileManager]);

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
      setChildrenMap({}); // Clear children cache on refresh
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

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectFile = (file: File) => {
    setSelectedId(file.id);
    onSelectFile?.(file);
  };

  // Drag & Drop handlers
  const handleDragStart = (file: File) => {
    setDraggingFile(file);
  };
  const handleDragOver = (target: File) => {
    setDropTargetId(target.id);
  };
  const handleDrop = async (target: File) => {
    if (!draggingFile || !target.is_folder || draggingFile.id === target.id) return;
    try {
      await fileManager.moveFile(draggingFile.id, target.id);
      setDraggingFile(null);
      setDropTargetId(undefined);
      fetchFiles();
      if (expandedFolders.has(target.id)) {
        fetchChildren(target.id);
      }
    } catch {
      // Optionally show error
    }
  };

  // Root drop handler
  const handleDropRoot = async () => {
    if (!draggingFile) return;
    try {
      await fileManager.moveFile(draggingFile.id, undefined);
      setDraggingFile(null);
      setDropTargetId(undefined);
      fetchFiles();
    } catch {
      // Fehlerbehandlung
    }
  };

  if (loading) return <div>Loading files...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      {/* Root Drop Area */}
      <div
        className={`p-2 mb-2 rounded border border-dashed border-purple-700 text-purple-300 text-center cursor-pointer ${dropTargetId === 'root' ? 'bg-purple-700/30' : ''}`}
        onDragOver={e => {
          e.preventDefault();
          setDropTargetId('root');
        }}
        onDrop={e => {
          e.preventDefault();
          if (draggingFile) {
            handleDropRoot();
          }
        }}
        onDragLeave={e => {
          if (dropTargetId === 'root') setDropTargetId(undefined);
        }}
      >
        Nach ganz oben (Root) verschieben
      </div>
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
      </div>

      {files.length === 0 ? (
        <div className="text-slate-400">No files found.</div>
      ) : (
        <div>
          {files.map(file => (
            <FileTreeNode
              key={file.id}
              file={file}
              depth={0}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
              fetchChildren={fetchChildren}
              childrenMap={childrenMap}
              onSelectFile={handleSelectFile}
              selectedId={selectedId}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              draggingId={draggingFile?.id}
              dropTargetId={dropTargetId}
            />
          ))}
        </div>
      )}
    </div>
  );
} 