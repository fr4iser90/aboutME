import { useState } from 'react';
import type { ProjectEditorProps } from './project-editor/types';
import type { Project as DomainProject } from '@/domain/entities/Project';
import { useProjectForm } from './project-editor/hooks/useProjectForm';
import { submitProject } from './project-editor/utils/submissionUtils';
import { VisibilityControls } from './project-editor/components/VisibilityControls';
import { OverrideFields } from './project-editor/components/OverrideFields';
import { CustomFields } from './project-editor/components/CustomFields';
import { ReadonlyFields } from './project-editor/components/ReadonlyFields';
import { ManualInputFields } from './project-editor/components/ManualInputFields';
import { ProjectPreview } from './project-editor/components/ProjectPreview';

export function ProjectEditor({ project, onSave, onCancel }: ProjectEditorProps) {
  console.log('ProjectEditor - project data:', project);
  console.log('ProjectEditor - project.sourceType:', project?.sourceType);

  const {
    formData,
    setFormData,
    newTech,
    setNewTech,
    fieldsVisibility,
    setFieldsVisibility,
    override,
    setOverride,
    handleAddTech,
    handleRemoveTech,
    handleVisibilityChange,
    handleOverrideChange,
    updateFormData,
  } = useProjectForm(project);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await submitProject(formData, fieldsVisibility, project);
      onSave();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project. Please try again.');
    }
  };

  return (
    <div className="project-editor">
      {/* Editor (links) */}
      <form onSubmit={handleSubmit} className="project-editor__form">
        <div>
          <label htmlFor="is_public" className="project-editor__label text">Auf Portfolio anzeigen</label>
          <input
            type="checkbox"
            id="is_public"
            checked={formData.is_public}
            onChange={e => updateFormData({ is_public: e.target.checked })}
            className="project-editor__checkbox"
          />
        </div>

        {formData.is_public && (
          <div className="project-editor__section">
            <div className="mb-2">
              <label className="project-editor__label text">Beschreibung (aus GitHub, nicht editierbar)</label>
              <div className="project-editor__description-preview">
                {project?.description || 'Keine GitHub-Beschreibung vorhanden.'}
              </div>
            </div>
            
            <VisibilityControls 
              fieldsVisibility={fieldsVisibility}
              onVisibilityChange={handleVisibilityChange}
            />
            
            <OverrideFields 
              formData={formData}
              override={override}
              project={project}
              onOverrideChange={handleOverrideChange}
              onFormDataChange={updateFormData}
            />
            
            <CustomFields 
              formData={formData}
              onFormDataChange={updateFormData}
            />
          </div>
        )}

        <ReadonlyFields formData={formData} />

        {project?.sourceType !== 'github' && (
          <ManualInputFields 
            formData={formData}
            newTech={newTech}
            onFormDataChange={updateFormData}
            onNewTechChange={setNewTech}
            onAddTech={handleAddTech}
            onRemoveTech={handleRemoveTech}
          />
        )}

        <div className="project-editor__actions">
          <button
            type="button"
            onClick={onCancel}
            className="project-editor__cancel-button"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="project-editor__save-button"
          >
            Save
          </button>
        </div>
      </form>
      
      {/* Live Preview (rechts) */}
      <ProjectPreview 
        formData={formData}
        fieldsVisibility={fieldsVisibility}
        project={project}
      />
    </div>
  );
}
