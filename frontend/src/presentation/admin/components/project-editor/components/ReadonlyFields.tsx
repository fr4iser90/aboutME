import type { ProjectFormData } from '../types';

interface ReadonlyFieldsProps {
  formData: ProjectFormData;
}

export function ReadonlyFields({ formData }: ReadonlyFieldsProps) {
  return (
    <div className="project-editor__readonly-section">
      <div>
        <label className="project-editor__label text">Stars</label>
        <input type="number" value={formData.starsCount} readOnly className="project-editor__readonly-input card" style={{ MozAppearance: 'textfield' }} />
      </div>
      <div>
        <label className="project-editor__label text">Forks</label>
        <input type="number" value={formData.forksCount} readOnly className="project-editor__readonly-input card" style={{ MozAppearance: 'textfield' }} />
      </div>
      <div>
        <label className="project-editor__label text">Watchers</label>
        <input type="number" value={formData.watchersCount} readOnly className="project-editor__readonly-input card" style={{ MozAppearance: 'textfield' }} />
      </div>
      <div>
        <label className="project-editor__label text">Status</label>
        <input type="text" value={formData.status} readOnly className="project-editor__readonly-input card" />
      </div>
      <div>
        <label className="project-editor__label text">Sprache</label>
        <input type="text" value={formData.language || ''} readOnly className="project-editor__readonly-input card" />
      </div>
      <div>
        <label className="project-editor__label text">Topics</label>
        <input type="text" value={formData.topics?.join(', ') || ''} readOnly className="project-editor__readonly-input card" />
      </div>
      <div>
        <label className="project-editor__label text">Homepage URL</label>
        <input type="text" value={formData.homepageUrl || ''} readOnly className="project-editor__readonly-input card" />
      </div>
    </div>
  );
} 