import type { ProjectFormData } from '../types';
import { parseCommaSeparatedValues, parseLinksString, formatLinksForInput } from '../utils/formUtils';

interface CustomFieldsProps {
  formData: ProjectFormData;
  onFormDataChange: (updates: Partial<ProjectFormData>) => void;
}

export function CustomFields({ formData, onFormDataChange }: CustomFieldsProps) {
  return (
    <>
      <div>
        <label htmlFor="custom_tags" className="project-editor__label text">Eigene Tags (kommagetrennt)</label>
        <input
          type="text"
          id="custom_tags"
          value={formData.custom_tags?.join(', ') || ''}
          onChange={e => onFormDataChange({ custom_tags: parseCommaSeparatedValues(e.target.value) })}
          className="project-editor__input card"
        />
      </div>
      <div>
        <label htmlFor="team" className="project-editor__label text">Team (kommagetrennt)</label>
        <input
          type="text"
          id="team"
          value={formData.team?.join(', ') || ''}
          onChange={e => onFormDataChange({ team: parseCommaSeparatedValues(e.target.value) })}
          className="project-editor__input card"
        />
      </div>
      <div>
        <label htmlFor="screenshots" className="project-editor__label text">Screenshots (Bild-URLs, kommagetrennt)</label>
        <input
          type="text"
          id="screenshots"
          value={formData.screenshots?.join(', ') || ''}
          onChange={e => onFormDataChange({ screenshots: parseCommaSeparatedValues(e.target.value) })}
          className="project-editor__input card"
        />
      </div>
      <div>
        <label htmlFor="links" className="project-editor__label text">Links (Format: label|url, kommagetrennt)</label>
        <input
          type="text"
          id="links"
          value={formatLinksForInput(formData.links || {})}
          onChange={e => onFormDataChange({ links: parseLinksString(e.target.value) })}
          className="project-editor__input card"
          placeholder="z.B. Demo|https://demo.com, Blog|https://blog.com"
        />
      </div>
    </>
  );
} 