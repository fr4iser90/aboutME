import type { FieldVisibility } from '../types';

interface VisibilityControlsProps {
  fieldsVisibility: FieldVisibility;
  onVisibilityChange: (field: string) => void;
}

export function VisibilityControls({ fieldsVisibility, onVisibilityChange }: VisibilityControlsProps) {
  return (
    <div className="project-editor__visibility-grid">
      {Object.entries(fieldsVisibility).map(([field, visible]) => (
        <label key={field} className="project-editor__checkbox-label text">
          <input
            type="checkbox"
            checked={visible}
            onChange={() => onVisibilityChange(field)}
            className="project-editor__checkbox"
          />
          <span>{field.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())} sichtbar</span>
        </label>
      ))}
    </div>
  );
} 