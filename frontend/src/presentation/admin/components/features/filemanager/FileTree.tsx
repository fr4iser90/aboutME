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
      className={`file-tree__node ${isDropTarget ? 'file-tree__node--drop-target' : ''}`}
    >
      <div
        className={`file-tree__node-content ${file.id === selectedId ? 'file-tree__node-content--selected' : ''}`}
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
          <span className="file-tree__icon-container">
            {isExpanded ? <ChevronDown className="file-tree__icon" /> : <ChevronRight className="file-tree__icon" />}
          </span>
        ) : (
          <span className="file-tree__spacer" />
        )}
        <span className="file-tree__icon-container">{file.is_folder ? (isExpanded ? '📂' : '📁') : '📄'}</span>
        <span className={file.is_folder ? 'file-tree__name--folder' : ''}>{file.name}</span>
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
  const { listFiles, createFile, createFiles, createFolder, deleteFile, moveFile } = useAdminFileManager();
  const { setSelectedFile } = useContext(FileManagerContext);
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
      const data = await listFiles(parentId || undefined);
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
  }, [parentId, listFiles]);

  // Fetch children for a folder
  const fetchChildren = useCallback(async (folderId: string) => {
    try {
      const data = await listFiles(folderId);
      setChildrenMap(prev => ({ ...prev, [folderId]: data }));
    } catch {
      setChildrenMap(prev => ({ ...prev, [folderId]: [] }));
    }
  }, [listFiles]);

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
      await createFolder(newFolderName, parentId || undefined);
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
    setSelectedFile?.(file);
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
      await moveFile(draggingFile.id, target.id);
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
      await moveFile(draggingFile.id, undefined);
      setDraggingFile(null);
      setDropTargetId(undefined);
      fetchFiles();
    } catch {
      // Fehlerbehandlung
    }
  };

  if (loading) return <div>Loading files...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="file-tree__container">
      {/* Root Drop Area */}
      <div
        className={`file-tree__drop-root ${dropTargetId === 'root' ? 'file-tree__drop-root--active' : ''}`}
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
      <div className="file-tree__actions">
        <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="file-tree__button"
            >
              <FolderPlus className="file-tree__button-icon" />
              New Folder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
            </DialogHeader>
            <div className="file-tree__dialog-content">
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
        <div className="file-tree__no-files">No files found.</div>
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
