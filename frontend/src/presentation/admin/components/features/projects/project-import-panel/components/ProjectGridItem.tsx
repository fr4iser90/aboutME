import { ProjectCard } from '@/presentation/public/components/sections/ProjectCard';
import type { ProjectGridItemProps } from '../types';

export function ProjectGridItem({ 
  project, 
  index, 
  isSelected, 
  isEditing, 
  onSelect, 
  onEdit, 
  onEditSave, 
  onEditCancel, 
  editData, 
  onEditDataChange 
}: ProjectGridItemProps) {
  const handleEditDataChange = (field: string, value: string | string[]) => {
    if (!editData) return;
    onEditDataChange({ ...editData, [field]: value });
  };

  return (
    <div className="project-import-panel__grid-item">
      <div className="project-import-panel__grid-item-select">
        <label className="project-import-panel__grid-item-select-label">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(index)}
            className="project-import-panel__grid-item-checkbox"
          />
        </label>
      </div>
      
      <div className="project-import-panel__grid-item-edit">
        <button
          onClick={() => onEdit(index)}
          className="project-import-panel__grid-item-edit-button"
        >
          Bearbeiten
        </button>
      </div>
      
      <ProjectCard project={project} />
      
      <div className="project-import-panel__grid-item-overlay">
        <span className="project-import-panel__grid-item-title">
          {project.name || project.title}
        </span>
        {project.archived && (
          <span className="project-import-panel__grid-item-archived">Archiviert</span>
        )}
      </div>
      
      {isEditing && editData && (
        <div className="project-import-panel__edit-modal">
          <h3 className="project-import-panel__edit-modal-title">Projekt bearbeiten</h3>
          
          <input
            type="text"
            value={editData.title || editData.name || ''}
            onChange={e => {
              const value = e.target.value;
              handleEditDataChange('title', value);
              handleEditDataChange('name', value);
            }}
            className="project-import-panel__edit-modal-input"
            placeholder="Titel"
          />
          
          <textarea
            value={editData.description || ''}
            onChange={e => handleEditDataChange('description', e.target.value)}
            className="project-import-panel__edit-modal-textarea"
            placeholder="Beschreibung"
          />
          
          <input
            type="text"
            value={editData.thumbnail_url || ''}
            onChange={e => handleEditDataChange('thumbnail_url', e.target.value)}
            className="project-import-panel__edit-modal-input"
            placeholder="Thumbnail URL"
          />
          
          <input
            type="text"
            value={editData.github_url || editData.web_url || editData.source_url || ''}
            onChange={e => {
              const value = e.target.value;
              handleEditDataChange('github_url', value);
              handleEditDataChange('web_url', value);
              handleEditDataChange('source_url', value);
            }}
            className="project-import-panel__edit-modal-input"
            placeholder="GitHub/GitLab URL"
          />
          
          <input
            type="text"
            value={editData.live_url || editData.homepage || ''}
            onChange={e => {
              const value = e.target.value;
              handleEditDataChange('live_url', value);
              handleEditDataChange('homepage', value);
            }}
            className="project-import-panel__edit-modal-input"
            placeholder="Live URL"
          />
          
          <input
            type="text"
            value={editData.language || ''}
            onChange={e => handleEditDataChange('language', e.target.value)}
            className="project-import-panel__edit-modal-input"
            placeholder="Sprache"
          />
          
          <input
            type="text"
            value={editData.topics?.join(', ') || ''}
            onChange={e => handleEditDataChange('topics', e.target.value.split(',').map(t => t.trim()))}
            className="project-import-panel__edit-modal-input"
            placeholder="Topics (kommagetrennt)"
          />
          
          <button
            onClick={onEditSave}
            className="project-import-panel__edit-modal-save-button"
          >
            Speichern
          </button>
          
          <button
            onClick={onEditCancel}
            className="project-import-panel__edit-modal-cancel-button"
          >
            Abbrechen
          </button>
        </div>
      )}
    </div>
  );
} 