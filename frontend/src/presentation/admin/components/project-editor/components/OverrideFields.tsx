import type { ProjectFormData, OverrideState, OverrideField } from '../types';
import type { Project as DomainProject } from '@/domain/entities/Project';
import { overrideFields } from '../types';

interface OverrideFieldsProps {
  formData: ProjectFormData;
  override: OverrideState;
  project: DomainProject | null | undefined;
  onOverrideChange: (field: keyof OverrideState) => void;
  onFormDataChange: (updates: Partial<ProjectFormData>) => void;
}

export function OverrideFields({ 
  formData, 
  override, 
  project, 
  onOverrideChange, 
  onFormDataChange 
}: OverrideFieldsProps) {
  const isTextAreaField = (field: string): boolean => {
    return ['description', 'own_description', 'learnings', 'challenges'].includes(field);
  };

  return (
    <>
      {overrideFields.map((field) => (
        <div key={field} className="mb-2">
          <label className="project-editor__checkbox-label text">
            <input
              type="checkbox"
              checked={override[field]}
              onChange={() => onOverrideChange(field)}
              className="project-editor__checkbox"
            />
            <span>Eigenen {field.replace(/_/g, ' ')} verwenden</span>
          </label>
          {override[field] ? (
            isTextAreaField(field) ? (
              <textarea
                className="project-editor__textarea card"
                value={formData[field as keyof ProjectFormData] as string || ''}
                onChange={e => onFormDataChange({ [field]: e.target.value })}
                rows={2}
                placeholder={`Eigener ${field.replace(/_/g, ' ')}`}
              />
            ) : (
              <input
                className="project-editor__input card"
                value={formData[field as keyof ProjectFormData] as string || ''}
                onChange={e => onFormDataChange({ [field]: e.target.value })}
                placeholder={`Eigener ${field.replace(/_/g, ' ')}`}
              />
            )
          ) : (
            <div className="project-editor__override-value">
              {project && (project as any)[field] ? (project as any)[field] : `Kein Wert aus GitHub/DB für ${field}`}
            </div>
          )}
        </div>
      ))}
    </>
  );
} 