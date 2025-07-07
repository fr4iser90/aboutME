import type { ImportFormData } from '../types';
import { SOURCES } from '../constants';

interface ImportFormProps {
  formData: ImportFormData;
  loading: boolean;
  onFormDataChange: (updates: Partial<ImportFormData>) => void;
  onFetchProjects: () => void;
}

export function ImportForm({ 
  formData, 
  loading, 
  onFormDataChange, 
  onFetchProjects 
}: ImportFormProps) {
  const isManualSource = formData.source === 'manual';
  const isFormValid = isManualSource || formData.input.trim();

  return (
    <div className="project-import-panel__form">
      <select
        value={formData.source}
        onChange={e => onFormDataChange({ source: e.target.value })}
        className="project-import-panel__select"
      >
        {SOURCES.map(s => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      
      {!isManualSource && (
        <>
          <input
            type="text"
            value={formData.input}
            onChange={e => onFormDataChange({ input: e.target.value })}
            placeholder="Username oder URL"
            className="project-import-panel__input"
          />
          <input
            type="text"
            value={formData.token}
            onChange={e => onFormDataChange({ token: e.target.value })}
            placeholder="Token (optional)"
            className="project-import-panel__input"
          />
        </>
      )}
      
      <button
        onClick={onFetchProjects}
        disabled={loading || !isFormValid}
        className="project-import-panel__button"
      >
        {loading ? 'Lade...' : isManualSource ? 'Neues Projekt' : 'Projekte laden'}
      </button>
    </div>
  );
} 