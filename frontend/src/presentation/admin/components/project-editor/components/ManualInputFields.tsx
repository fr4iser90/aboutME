import type { ProjectFormData } from '../types';

interface ManualInputFieldsProps {
  formData: ProjectFormData;
  newTech: string;
  onFormDataChange: (updates: Partial<ProjectFormData>) => void;
  onNewTechChange: (value: string) => void;
  onAddTech: () => void;
  onRemoveTech: (tech: string) => void;
}

export function ManualInputFields({ 
  formData, 
  newTech, 
  onFormDataChange, 
  onNewTechChange, 
  onAddTech, 
  onRemoveTech 
}: ManualInputFieldsProps) {
  return (
    <>
      <div>
        <label htmlFor="title" className="project-editor__label text">Title</label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => onFormDataChange({ title: e.target.value })}
          className="project-editor__input card"
          required
        />
      </div>
      <div>
        <label htmlFor="description" className="project-editor__label text">Description</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => onFormDataChange({ description: e.target.value })}
          rows={3}
          className="project-editor__textarea card"
          required
        />
      </div>
      <div>
        <label htmlFor="imageUrl" className="project-editor__label text">Image URL</label>
        <input
          type="url"
          id="imageUrl"
          value={formData.imageUrl}
          onChange={(e) => onFormDataChange({ imageUrl: e.target.value })}
          className="project-editor__input card"
        />
      </div>
      <div>
        <label htmlFor="githubUrl" className="project-editor__label text">GitHub URL</label>
        <input
          type="url"
          id="githubUrl"
          value={formData.githubUrl}
          onChange={(e) => onFormDataChange({ githubUrl: e.target.value })}
          className="project-editor__input card"
        />
      </div>
      <div>
        <label htmlFor="liveUrl" className="project-editor__label text">Demo URL</label>
        <input
          type="url"
          id="liveUrl"
          value={formData.liveUrl}
          onChange={(e) => onFormDataChange({ liveUrl: e.target.value })}
          className="project-editor__input card"
        />
      </div>
      <div>
        <label className="project-editor__label text">Technologies</label>
        <div className="project-editor__tech-input-group">
          <input
            type="text"
            value={newTech}
            onChange={(e) => onNewTechChange(e.target.value)}
            className="project-editor__input card"
            placeholder="Add technology"
          />
          <button
            type="button"
            onClick={onAddTech}
            className="project-editor__add-button"
          >
            Add
          </button>
        </div>
        <div className="project-editor__tech-tags">
          {formData.technologies.map((tech) => (
            <span
              key={tech}
              className="project-editor__tech-tag"
            >
              {tech}
              <button
                type="button"
                onClick={() => onRemoveTech(tech)}
                className="project-editor__remove-tag-button"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    </>
  );
} 