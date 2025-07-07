export interface ImportSource {
  label: string;
  value: string;
}

export interface ProjectData {
  id?: number;
  name?: string;
  title?: string;
  description?: string;
  source_url?: string;
  live_url?: string;
  homepage?: string;
  thumbnail_url?: string;
  github_url?: string;
  web_url?: string;
  language?: string;
  topics?: string[];
  technologies?: string[];
  status?: string;
  is_visible?: boolean;
  archived?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ImportFormData {
  source: string;
  input: string;
  token: string;
}

export interface ProjectImportState {
  projects: ProjectData[];
  selected: Set<number>;
  loading: boolean;
  error: string;
  editIndex: number | null;
  editData: ProjectData | null;
  selectAll: boolean;
}

export interface FetchProjectsParams {
  source: string;
  input: string;
  token: string;
}

export interface ProjectGridItemProps {
  project: ProjectData;
  index: number;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: (index: number) => void;
  onEdit: (index: number) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  editData: ProjectData | null;
  onEditDataChange: (data: ProjectData) => void;
} 