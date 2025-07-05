import { useState, useEffect } from 'react';
import type { ProjectFormData, FieldVisibility, OverrideState } from '../types';
import type { Project as DomainProject } from '@/domain/entities/Project';
import { defaultVisibility, defaultOverrideState } from '../constants';
import { initializeFormData, initializeFieldVisibility } from '../utils/formUtils';

export const useProjectForm = (project: DomainProject | null | undefined) => {
  const [formData, setFormData] = useState<ProjectFormData>(() => 
    initializeFormData(project)
  );
  const [newTech, setNewTech] = useState('');
  const [fieldsVisibility, setFieldsVisibility] = useState<FieldVisibility>(() => 
    initializeFieldVisibility(project, defaultVisibility)
  );
  const [override, setOverride] = useState<OverrideState>(defaultOverrideState);

  useEffect(() => {
    setFormData(initializeFormData(project));
    setFieldsVisibility(initializeFieldVisibility(project, defaultVisibility));
  }, [project]);

  const handleAddTech = () => {
    if (newTech.trim() && !formData.technologies.includes(newTech.trim())) {
      setFormData({
        ...formData,
        technologies: [...formData.technologies, newTech.trim()],
      });
      setNewTech('');
    }
  };

  const handleRemoveTech = (tech: string) => {
    setFormData({
      ...formData,
      technologies: formData.technologies.filter((t) => t !== tech),
    });
  };

  const handleVisibilityChange = (field: string) => {
    setFieldsVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleOverrideChange = (field: keyof OverrideState) => {
    setOverride((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const updateFormData = (updates: Partial<ProjectFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return {
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
  };
}; 