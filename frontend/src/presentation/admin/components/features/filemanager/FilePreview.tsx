import type { File } from '@/infrastructure/api/admin/filemanager';
import { config } from '@/domain/shared/utils/config';
import './FilePreview.css';

export function FilePreview({ file }: { file: File }) {
  const fileUrl = config.backendUrl + file.path;
  if (file.is_folder) {
    return <div className="file-preview__message">Ordner können nicht als Vorschau angezeigt werden.</div>;
  }
  if (file.mime_type?.startsWith('image/')) {
    return <img src={fileUrl} alt={file.name} className="file-preview__image" />;
  }
  if (file.mime_type === 'application/pdf') {
    return <iframe src={fileUrl} title={file.name} className="file-preview__iframe" />;
  }
  return <div className="file-preview__message">Keine Vorschau für diesen Dateityp verfügbar.</div>;
}
