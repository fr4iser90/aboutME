import type { File } from '@/infrastructure/api/admin/filemanager';

export function FileInformation({ file }: { file: File }) {
  return (
    <div className="file-information">
      <div>
        <span className="file-information__label">Name:</span> {file.name}
      </div>
      <div>
        <span className="file-information__label">Typ:</span> {file.mime_type || (file.is_folder ? 'Ordner' : 'Unbekannt')}
      </div>
      {!file.is_folder && (
        <div>
          <span className="file-information__label">Größe:</span> {file.size ? (file.size / 1024).toFixed(1) + ' KB' : 'Unbekannt'}
        </div>
      )}
      <div>
        <span className="file-information__label">Erstellt:</span> {file.created_at ? new Date(file.created_at).toLocaleString() : 'Unbekannt'}
      </div>
      {file.tags && file.tags.length > 0 && (
        <div>
          <span className="file-information__label">Tags:</span> {file.tags.join(', ')}
        </div>
      )}
      {file.used_in && Object.keys(file.used_in).length > 0 && (
        <div>
          <span className="file-information__label">Verwendet in:</span>
          <ul className="file-information__list">
            {Object.entries(file.used_in).map(([type, ids]) => (
              <li key={type}>{type}: {Array.isArray(ids) ? ids.length : 1}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
