import type { File } from '@/infrastructure/api/admin/filemanager';
import { config } from '@/domain/shared/utils/config';

export function FilePreview({ file }: { file: File }) {
  const fileUrl = config.backendUrl + file.path;
  if (file.is_folder) {
    return <div className="text-slate-400">Ordner können nicht als Vorschau angezeigt werden.</div>;
  }
  if (file.mime_type?.startsWith('image/')) {
    return <img src={fileUrl} alt={file.name} className="max-w-full max-h-96 rounded shadow" />;
  }
  if (file.mime_type === 'application/pdf') {
    return <iframe src={fileUrl} title={file.name} className="w-full h-96 rounded shadow" />;
  }
  return <div className="text-slate-400">Keine Vorschau für diesen Dateityp verfügbar.</div>;
}
