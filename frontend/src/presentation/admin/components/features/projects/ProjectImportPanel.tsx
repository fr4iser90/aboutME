import { useState } from 'react';
import { ProjectCard } from '@/presentation/public/components/sections/ProjectCard';
import { useRouter } from 'next/navigation';
import { projectApi } from '@/domain/shared/utils/api';

const SOURCES = [
  { label: 'GitHub', value: 'github' },
  { label: 'GitLab', value: 'gitlab' },
  { label: 'Manuell', value: 'manual' },
];

export function ProjectImportPanel() {
  const [source, setSource] = useState('github');
  const [input, setInput] = useState('fr4iser90');
  const [token, setToken] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>(null);
  const [selectAll, setSelectAll] = useState(true);
  const router = useRouter();

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    setProjects([]);
    setSelected(new Set());
    try {
      let url = '';
      const headers: any = {};
      
      if (source === 'github') {
        let username = input.trim();
        if (username.startsWith('https://github.com/')) {
          username = username.replace('https://github.com/', '').replace(/\/$/, '');
        }
        url = `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`;
        if (token) headers['Authorization'] = `token ${token}`;
      } else if (source === 'gitlab') {
        let username = input.trim();
        if (username.startsWith('https://gitlab.com/')) {
          username = username.replace('https://gitlab.com/', '').replace(/\/$/, '');
        }
        url = `https://gitlab.com/api/v4/users/${username}/projects?per_page=100&order_by=last_activity_at`;
        if (token) headers['PRIVATE-TOKEN'] = token;
      } else if (source === 'manual') {
        setProjects([{
          name: 'Neues Projekt',
          description: '',
          source_url: '',
          live_url: '',
          thumbnail_url: '',
          language: '',
          topics: [],
          status: 'WIP',
          is_visible: true
        }]);
        setLoading(false);
        return;
      }
      
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const data = await res.json();
      setProjects(data);
      setSelected(new Set(data.map((_: any, idx: number) => idx)));
      setSelectAll(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (idx: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const handleEdit = (idx: number) => {
    setEditIndex(idx);
    setEditData({ ...projects[idx] });
  };

  const handleEditSave = () => {
    if (editIndex !== null) {
      setProjects(projects.map((p, i) => (i === editIndex ? editData : p)));
      setEditIndex(null);
      setEditData(null);
    }
  };

  const handleImport = async () => {
    const toImport = Array.from(selected).map(idx => projects[idx]);
    try {
      await projectApi.importProjects(source, toImport);
      alert('Import erfolgreich!');
      router.refresh();
    } catch (e: any) {
      alert('Import fehlgeschlagen: ' + e.message);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelected(new Set());
      setSelectAll(false);
    } else {
      setSelected(new Set(projects.map((_: any, idx: number) => idx)));
      setSelectAll(true);
    }
  };

  return (
    <div className="project-import-panel">
      <h2 className="project-import-panel__title">Projekte importieren</h2>
      <div className="project-import-panel__form">
        <select
          value={source}
          onChange={e => setSource(e.target.value)}
          className="project-import-panel__select"
        >
          {SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        {source !== 'manual' && (
          <>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Username oder URL"
              className="project-import-panel__input"
            />
            <input
              type="text"
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="Token (optional)"
              className="project-import-panel__input"
            />
          </>
        )}
        <button
          onClick={fetchProjects}
          disabled={loading || (source !== 'manual' && !input.trim())}
          className="project-import-panel__button"
        >
          {loading ? 'Lade...' : source === 'manual' ? 'Neues Projekt' : 'Projekte laden'}
        </button>
      </div>
      {source !== 'manual' && (
        <div className="project-import-panel__token-hint">
          Ohne Token werden nur öffentliche Projekte importiert und ggf. weniger Informationen angezeigt. Mit Token bekommst du alle Projekte und mehr Details (z.B. private Repos, Commit-Infos, höhere Rate-Limits).
        </div>
      )}
      {error && <div className="project-import-panel__error">{error}</div>}
      {projects.length > 0 && (
        <>
          <div className="project-import-panel__results-header">
            <span className="project-import-panel__results-count">Gefundene Projekte: {projects.length}</span>
            <div className="project-import-panel__select-all">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                id="selectAllCheckbox"
              />
              <label htmlFor="selectAllCheckbox" className="project-import-panel__select-all-label">Alle auswählen</label>
            </div>
            <button
              onClick={handleImport}
              className="project-import-panel__import-button"
              disabled={selected.size === 0}
            >
              Ausgewählte Projekte ins Backend übernehmen
            </button>
          </div>
          <div className="project-import-panel__grid">
            {projects.map((project, idx) => (
              <div key={project.id || idx} className="project-import-panel__grid-item">
                <div className="project-import-panel__grid-item-select">
                  <label className="project-import-panel__grid-item-select-label">
                    <input
                      type="checkbox"
                      checked={selected.has(idx)}
                      onChange={() => handleSelect(idx)}
                      className="project-import-panel__grid-item-checkbox"
                    />
                  </label>
                </div>
                <div className="project-import-panel__grid-item-edit">
                  <button
                    onClick={() => handleEdit(idx)}
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
                {editIndex === idx && (
                  <div className="project-import-panel__edit-modal">
                    <h3 className="project-import-panel__edit-modal-title">Projekt bearbeiten</h3>
                    <input
                      type="text"
                      value={editData.title || editData.name || ''}
                      onChange={e => setEditData({ ...editData, title: e.target.value, name: e.target.value })}
                      className="project-import-panel__edit-modal-input"
                      placeholder="Titel"
                    />
                    <textarea
                      value={editData.description || ''}
                      onChange={e => setEditData({ ...editData, description: e.target.value })}
                      className="project-import-panel__edit-modal-textarea"
                      placeholder="Beschreibung"
                    />
                    <input
                      type="text"
                      value={editData.thumbnail_url || ''}
                      onChange={e => setEditData({ ...editData, thumbnail_url: e.target.value })}
                      className="project-import-panel__edit-modal-input"
                      placeholder="Thumbnail URL"
                    />
                    <input
                      type="text"
                      value={editData.github_url || editData.web_url || editData.source_url || ''}
                      onChange={e => setEditData({ ...editData, github_url: e.target.value, web_url: e.target.value, source_url: e.target.value })}
                      className="project-import-panel__edit-modal-input"
                      placeholder="GitHub/GitLab URL"
                    />
                    <input
                      type="text"
                      value={editData.live_url || editData.homepage || ''}
                      onChange={e => setEditData({ ...editData, live_url: e.target.value, homepage: e.target.value })}
                      className="project-import-panel__edit-modal-input"
                      placeholder="Live URL"
                    />
                    <input
                      type="text"
                      value={editData.language || ''}
                      onChange={e => setEditData({ ...editData, language: e.target.value })}
                      className="project-import-panel__edit-modal-input"
                      placeholder="Sprache"
                    />
                    <input
                      type="text"
                      value={editData.topics?.join(', ') || ''}
                      onChange={e => setEditData({ ...editData, topics: e.target.value.split(',').map(t => t.trim()) })}
                      className="project-import-panel__edit-modal-input"
                      placeholder="Topics (kommagetrennt)"
                    />
                    <button
                      onClick={handleEditSave}
                      className="project-import-panel__edit-modal-save-button"
                    >
                      Speichern
                    </button>
                    <button
                      onClick={() => { setEditIndex(null); setEditData(null); }}
                      className="project-import-panel__edit-modal-cancel-button"
                    >
                      Abbrechen
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
