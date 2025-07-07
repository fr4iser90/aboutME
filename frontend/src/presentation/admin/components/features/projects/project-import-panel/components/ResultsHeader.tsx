interface ResultsHeaderProps {
  projectsCount: number;
  selectedCount: number;
  selectAll: boolean;
  onSelectAll: () => void;
  onImport: () => void;
}

export function ResultsHeader({ 
  projectsCount, 
  selectedCount, 
  selectAll, 
  onSelectAll, 
  onImport 
}: ResultsHeaderProps) {
  return (
    <div className="project-import-panel__results-header">
      <span className="project-import-panel__results-count">
        Gefundene Projekte: {projectsCount}
      </span>
      
      <div className="project-import-panel__select-all">
        <input
          type="checkbox"
          checked={selectAll}
          onChange={onSelectAll}
          id="selectAllCheckbox"
        />
        <label htmlFor="selectAllCheckbox" className="project-import-panel__select-all-label">
          Alle auswählen
        </label>
      </div>
      
      <button
        onClick={onImport}
        className="project-import-panel__import-button"
        disabled={selectedCount === 0}
      >
        Ausgewählte Projekte ins Backend übernehmen
      </button>
    </div>
  );
} 