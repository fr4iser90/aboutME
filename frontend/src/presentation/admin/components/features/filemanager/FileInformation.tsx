import type { File } from '@/infrastructure/api/admin/filemanager';

export function FileInformation({ file }: { file: File }) {
  return (
    <div className="space-y-2">
      <div>
        <span className="font-semibold">Name:</span> {file.name}
      </div>
      <div>
        <span className="font-semibold">Typ:</span> {file.mime_type || (file.is_folder ? 'Ordner' : 'Unbekannt')}
      </div>
      {!file.is_folder && (
        <div>
          <span className="font-semibold">Größe:</span> {file.size ? (file.size / 1024).toFixed(1) + ' KB' : 'Unbekannt'}
        </div>
      )}
      <div>
        <span className="font-semibold">Erstellt:</span> {file.created_at ? new Date(file.created_at).toLocaleString() : 'Unbekannt'}
      </div>
      {file.tags && file.tags.length > 0 && (
        <div>
          <span className="font-semibold">Tags:</span> {file.tags.join(', ')}
        </div>
      )}
      {file.used_in && Object.keys(file.used_in).length > 0 && (
        <div>
          <span className="font-semibold">Verwendet in:</span>
          <ul className="list-disc ml-6">
            {Object.entries(file.used_in).map(([type, ids]) => (
              <li key={type}>{type}: {Array.isArray(ids) ? ids.length : 1}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
