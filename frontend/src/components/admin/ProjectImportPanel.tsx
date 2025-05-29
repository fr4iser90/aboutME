import { useState } from 'react';
import { ProjectCard } from '@/components/sections/ProjectCard';

const SOURCES = [
  { label: 'GitHub', value: 'github' },
  { label: 'GitLab', value: 'gitlab' },
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

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    setProjects([]);
    setSelected(new Set());
    try {
      let url = '';
      let headers: any = {};
      const token = localStorage.getItem('auth_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
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
    const API_URL = process.env.BACKEND_URL || 'http://localhost:8090';
    const toImport = Array.from(selected).map(idx => projects[idx]);
    try {
      const token = localStorage.getItem('token');
      const username = input.trim();
      const res = await fetch(`${API_URL}/api/admin/projects/github/sync?username=${encodeURIComponent(username)}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Import failed');
      alert('Import erfolgreich!');
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
    <div className="galaxy-card mb-8">
      <h2 className="text-2xl font-bold mb-4 galaxy-text">Projekte importieren</h2>
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <select
          value={source}
          onChange={e => setSource(e.target.value)}
          className="galaxy-card px-2 py-1"
        >
          {SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Username oder URL"
          className="galaxy-card px-2 py-1 flex-1"
        />
        <input
          type="text"
          value={token}
          onChange={e => setToken(e.target.value)}
          placeholder="Token (optional)"
          className="galaxy-card px-2 py-1 flex-1"
        />
        <button
          onClick={fetchProjects}
          disabled={loading || !input.trim()}
          className="galaxy-card galaxy-text px-4 py-2 hover:brightness-110 disabled:opacity-50"
        >
          {loading ? 'Lade...' : 'Projekte laden'}
        </button>
      </div>
      <div className="text-xs text-slate-400 mb-4">
        Ohne Token werden nur öffentliche Projekte importiert und ggf. weniger Informationen angezeigt. Mit Token bekommst du alle Projekte und mehr Details (z.B. private Repos, Commit-Infos, höhere Rate-Limits).
      </div>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {projects.length > 0 && (
        <>
          <div className="mb-4 flex justify-between items-center">
            <span className="font-semibold">Gefundene Projekte: {projects.length}</span>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                id="selectAllCheckbox"
              />
              <label htmlFor="selectAllCheckbox" className="text-sm">Alle auswählen</label>
            </div>
            <button
              onClick={handleImport}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              disabled={selected.size === 0}
            >
              Ausgewählte Projekte ins Backend übernehmen
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, idx) => (
              <div key={project.id || idx} className="relative">
                <div className="absolute top-2 left-2 z-20">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected.has(idx)}
                      onChange={() => handleSelect(idx)}
                      className="scale-125 accent-purple-400 mr-1"
                    />
                  </label>
                </div>
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => handleEdit(idx)}
                    className="text-xs px-2 py-1 bg-yellow-200 rounded hover:bg-yellow-300"
                  >
                    Bearbeiten
                  </button>
                </div>
                <ProjectCard project={project} />
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-11/12 flex justify-between items-center pointer-events-none">
                  <span className="font-bold text-base galaxy-text truncate max-w-[70%]">
                    {project.name || project.title}
                  </span>
                  {project.archived && (
                    <span className="ml-2 px-2 py-0.5 rounded bg-yellow-400 text-xs font-semibold text-slate-900 shadow">Archiviert</span>
                  )}
                </div>
                {editIndex === idx && (
                  <div className="absolute inset-0 bg-white bg-opacity-95 flex flex-col p-4 z-10 rounded-lg shadow-lg">
                    <h3 className="text-lg font-bold mb-2">Projekt bearbeiten</h3>
                    <input
                      type="text"
                      value={editData.title || editData.name || ''}
                      onChange={e => setEditData({ ...editData, title: e.target.value, name: e.target.value })}
                      className="border rounded px-2 py-1 mb-2"
                      placeholder="Titel"
                    />
                    <textarea
                      value={editData.description || ''}
                      onChange={e => setEditData({ ...editData, description: e.target.value })}
                      className="border rounded px-2 py-1 mb-2"
                      placeholder="Beschreibung"
                    />
                    <input
                      type="text"
                      value={editData.thumbnail_url || ''}
                      onChange={e => setEditData({ ...editData, thumbnail_url: e.target.value })}
                      className="border rounded px-2 py-1 mb-2"
                      placeholder="Thumbnail URL"
                    />
                    <input
                      type="text"
                      value={editData.github_url || editData.web_url || ''}
                      onChange={e => setEditData({ ...editData, github_url: e.target.value, web_url: e.target.value })}
                      className="border rounded px-2 py-1 mb-2"
                      placeholder="GitHub/GitLab URL"
                    />
                    <button
                      onClick={handleEditSave}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mb-2"
                    >
                      Speichern
                    </button>
                    <button
                      onClick={() => { setEditIndex(null); setEditData(null); }}
                      className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
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