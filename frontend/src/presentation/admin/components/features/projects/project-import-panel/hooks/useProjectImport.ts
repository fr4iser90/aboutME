import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { projectApi } from '@/domain/shared/utils/api';
import type { ImportFormData, ProjectImportState, ProjectData } from '../types';
import { DEFAULT_FORM_DATA } from '../constants';
import { fetchProjectsFromApi, normalizeProjectData } from '../utils/projectUtils';

export const useProjectImport = () => {
  const router = useRouter();
  
  const [formData, setFormData] = useState<ImportFormData>(DEFAULT_FORM_DATA);
  const [state, setState] = useState<ProjectImportState>({
    projects: [],
    selected: new Set(),
    loading: false,
    error: '',
    editIndex: null,
    editData: null,
    selectAll: true,
  });

  const updateFormData = (updates: Partial<ImportFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const fetchProjects = async () => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: '',
      projects: [],
      selected: new Set(),
    }));

    try {
      const rawProjects = await fetchProjectsFromApi(formData);
      const normalizedProjects = rawProjects.map(project => 
        normalizeProjectData(project, formData.source)
      );
      
      setState(prev => ({
        ...prev,
        projects: normalizedProjects,
        selected: new Set(normalizedProjects.map((_, idx) => idx)),
        selectAll: true,
        loading: false,
      }));
    } catch (e: any) {
      setState(prev => ({
        ...prev,
        error: e.message,
        loading: false,
      }));
    }
  };

  const handleSelect = (idx: number) => {
    setState(prev => {
      const next = new Set(prev.selected);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return {
        ...prev,
        selected: next,
        selectAll: next.size === prev.projects.length,
      };
    });
  };

  const handleSelectAll = () => {
    setState(prev => {
      const newSelectAll = !prev.selectAll;
      return {
        ...prev,
        selectAll: newSelectAll,
        selected: newSelectAll 
          ? new Set(prev.projects.map((_, idx) => idx))
          : new Set(),
      };
    });
  };

  const handleEdit = (idx: number) => {
    setState(prev => ({
      ...prev,
      editIndex: idx,
      editData: { ...prev.projects[idx] },
    }));
  };

  const handleEditSave = () => {
    setState(prev => {
      if (prev.editIndex === null || prev.editData === null) return prev;
      
      const updatedProjects = prev.projects.map((p, i) => 
        i === prev.editIndex ? prev.editData! : p
      );
      
      return {
        ...prev,
        projects: updatedProjects,
        editIndex: null,
        editData: null,
      };
    });
  };

  const handleEditCancel = () => {
    setState(prev => ({
      ...prev,
      editIndex: null,
      editData: null,
    }));
  };

  const handleEditDataChange = (data: ProjectData) => {
    setState(prev => ({
      ...prev,
      editData: data,
    }));
  };

  const handleImport = async () => {
    const toImport = Array.from(state.selected).map(idx => state.projects[idx]);
    try {
      await projectApi.importProjects(formData.source, toImport);
      alert('Import erfolgreich!');
      router.refresh();
    } catch (e: any) {
      alert('Import fehlgeschlagen: ' + e.message);
    }
  };

  return {
    formData,
    state,
    updateFormData,
    fetchProjects,
    handleSelect,
    handleSelectAll,
    handleEdit,
    handleEditSave,
    handleEditCancel,
    handleEditDataChange,
    handleImport,
  };
}; 