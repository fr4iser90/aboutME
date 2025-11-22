/**
 * Generate Step Component
 * 
 * Step 5: Fetch GitHub data and create markdown files with auto-validation
 */

'use client';

import { useState, useEffect } from 'react';

interface GenerateStepProps {
  config: {
    githubUsername: string;
    githubToken?: string;
    portfolioTitle: string;
    portfolioDescription: string;
    portfolioAuthor: string;
    includeBlogPosts?: boolean;
    includeSkills?: boolean;
    includeTerminal?: boolean;
    githubFilter?: {
      includeForks: boolean;
      includeTemplates: boolean;
      includePrivate: boolean;
      minStars: number;
      excludeRepos: string[];
      featuredProjects: string[];
    };
  };
  onComplete: (result: any) => void;
}

interface RepoProgress {
  name: string;
  status: 'scraping' | 'readme' | 'assets' | 'done' | 'error';
  readmeFound: boolean;
  readmeSize?: number;
  assetsCount: number;
  assetsTypes?: Record<string, number>;
  error?: string;
}

interface ScrapingSummary {
  totalProjects: number;
  totalReadmes: number;
  totalAssets: number;
  repos: RepoProgress[];
}

export default function GenerateStep({ config, onComplete }: GenerateStepProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState<any>(null);
  const [validation, setValidation] = useState<{
    total: number;
    valid: number;
    invalid: number;
    invalidFiles: string[];
  } | null>(null);
  const [repoProgress, setRepoProgress] = useState<Map<string, RepoProgress>>(new Map());
  const [scrapingSummary, setScrapingSummary] = useState<ScrapingSummary | null>(null);
  const [showRepoDetails, setShowRepoDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oldFilesInfo, setOldFilesInfo] = useState<{ hasOldFiles: boolean; count: number; files: string[] } | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  // Auto-start generation on mount
  useEffect(() => {
    if (config.githubUsername && !isGenerating && !result && !error) {
      handleGenerate();
    }
  }, []); // Only run on mount

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setProgress('Starting portfolio generation...');
    setResult(null);
    setValidation(null);
    setRepoProgress(new Map());
    setScrapingSummary(null);
    setShowRepoDetails(false);

    try {
      const response = await fetch('/api/setup/generate-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          githubUsername: config.githubUsername,
          portfolioTitle: config.portfolioTitle,
          portfolioDescription: config.portfolioDescription,
          portfolioAuthor: config.portfolioAuthor,
          includeBlogPosts: config.includeBlogPosts || false,
          includeSkills: config.includeSkills || false,
          includeTerminal: config.includeTerminal || false,
          githubFilter: config.githubFilter || {
            includeForks: false,
            includeTemplates: false,
            includePrivate: false,
            minStars: 0,
            excludeRepos: [],
            featuredProjects: [],
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body reader available');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'progress') {
                setProgress(data.message);
              } else if (data.type === 'repo-start') {
                setRepoProgress(prev => {
                  const next = new Map(prev);
                  next.set(data.repo.name, data.repo);
                  return next;
                });
              } else if (data.type === 'repo-progress') {
                setRepoProgress(prev => {
                  const next = new Map(prev);
                  next.set(data.repo.name, data.repo);
                  return next;
                });
              } else if (data.type === 'complete') {
                setResult(data);
                if (data.validation) {
                  setValidation(data.validation);
                }
                if (data.scrapingSummary) {
                  setScrapingSummary(data.scrapingSummary);
                }
                setIsGenerating(false);
                // Check for old files after generation
                checkOldFiles();
                // Notify parent that generation is complete
                onComplete(data);
              } else if (data.type === 'error') {
                throw new Error(data.message);
              }
            } catch (e) {
              // Ignore JSON parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      console.error('Generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      setProgress(`Error: ${errorMessage}`);
      setIsGenerating(false);
    }
  };

  const hasInvalidFiles = validation && validation.invalid > 0;

  const checkOldFiles = async () => {
    try {
      const response = await fetch('/api/setup/archive-old-files');
      if (response.ok) {
        const data = await response.json();
        setOldFilesInfo(data);
      }
    } catch (error) {
      console.warn('Could not check for old files:', error);
    }
  };

  const handleArchiveOldFiles = async () => {
    setIsArchiving(true);
    try {
      const response = await fetch('/api/setup/archive-old-files', {
        method: 'POST'
      });
      if (response.ok) {
        const data = await response.json();
        setOldFilesInfo({ hasOldFiles: false, count: 0, files: [] });
        alert(`✅ Successfully archived ${data.archived} old file(s) to ${data.archivePath}`);
      } else {
        const error = await response.json();
        alert(`❌ Error: ${error.error || 'Failed to archive files'}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Failed to archive files'}`);
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <div className="glass-card setup-page__form">
      <h3 className="setup-page__form-title">🚀 Generate & Fetch</h3>
      <p className="setup-page__form-description">
        Fetch GitHub data and create markdown files for your portfolio
      </p>

      <div className="setup-form">

        {isGenerating && (
          <div className="setup-form__field setup-form__field--flex">
            <div className="setup-form__progress">
              <p>{progress || 'Processing...'}</p>
            </div>
            
            {repoProgress.size > 0 && (
              <div className="setup-form__repo-list">
                <h4>📦 Scraping Repositories:</h4>
                <div className="setup-form__repo-items">
                  {Array.from(repoProgress.values()).map((repo) => (
                    <div key={repo.name} className={`setup-form__repo-item setup-form__repo-item--${repo.status}`}>
                      <div className="setup-form__repo-header">
                        <span className="setup-form__repo-name">{repo.name}</span>
                        <span className="setup-form__repo-status">
                          {repo.status === 'scraping' && '🔄'}
                          {repo.status === 'readme' && '📄'}
                          {repo.status === 'assets' && '🖼️'}
                          {repo.status === 'done' && '✅'}
                          {repo.status === 'error' && '❌'}
                        </span>
                      </div>
                      <div className="setup-form__repo-details">
                        {repo.readmeFound ? (
                          <span className="setup-form__repo-badge setup-form__repo-badge--success">
                            ✅ README ({repo.readmeSize ? `${(repo.readmeSize / 1024).toFixed(1)} KB` : 'found'})
                          </span>
                        ) : repo.status !== 'scraping' && repo.status !== 'readme' ? (
                          <span className="setup-form__repo-badge setup-form__repo-badge--warning">
                            ⚠️ No README
                          </span>
                        ) : null}
                        {repo.assetsCount > 0 && (
                          <span className="setup-form__repo-badge setup-form__repo-badge--success">
                            🖼️ {repo.assetsCount} {repo.assetsCount === 1 ? 'Asset' : 'Assets'}
                            {repo.assetsTypes && (
                              <span className="setup-form__repo-asset-types">
                                {' '}({Object.entries(repo.assetsTypes).map(([type, count]) => `${count} ${type}`).join(', ')})
                              </span>
                            )}
                          </span>
                        )}
                        {repo.status === 'done' && repo.assetsCount === 0 && repo.readmeFound && (
                          <span className="setup-form__repo-badge setup-form__repo-badge--info">
                            📦 No assets
                          </span>
                        )}
                        {repo.error && (
                          <span className="setup-form__repo-badge setup-form__repo-badge--error">
                            ❌ {repo.error}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {error && !isGenerating && (
          <div className="setup-form__field">
            <div className="setup-form__error">
              <h4>❌ Generation Failed</h4>
              <p>{error}</p>
              <button
                type="button"
                className="setup-form__button setup-form__button--primary"
                onClick={handleGenerate}
                style={{ marginTop: 'var(--space-md)' }}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {result && (
          <>
            <div className="setup-form__field">
              <div className="setup-form__success">
                <h4>✅ Generation Complete!</h4>
                <p>Execution time: {(result.executionTime / 1000).toFixed(1)}s</p>
                {result.projects && (
                  <p>Projects: {Array.isArray(result.projects) ? result.projects.length : 0} found</p>
                )}
              </div>
            </div>

            {scrapingSummary && (
              <div className="setup-form__field">
                <div className="setup-form__summary">
                  <h4>📊 Scraping Summary</h4>
                  <div className="setup-form__summary-stats">
                    <div className="setup-form__summary-stat">
                      <div className="setup-form__summary-number">{scrapingSummary.totalProjects}</div>
                      <div className="setup-form__summary-label">Projects</div>
                    </div>
                    <div className="setup-form__summary-stat">
                      <div className="setup-form__summary-number">{scrapingSummary.totalReadmes}</div>
                      <div className="setup-form__summary-label">READMEs</div>
                    </div>
                    <div className="setup-form__summary-stat">
                      <div className="setup-form__summary-number">{scrapingSummary.totalAssets}</div>
                      <div className="setup-form__summary-label">Assets</div>
                    </div>
                    {validation && (
                      <>
                        <div className="setup-form__summary-stat">
                          <div className="setup-form__summary-number">{validation.total}</div>
                          <div className="setup-form__summary-label">Total Files</div>
                        </div>
                        <div className={`setup-form__summary-stat ${
                          validation.invalid > 0 ? 'setup-form__summary-stat--warning' : 'setup-form__summary-stat--success'
                        }`}>
                          <div className="setup-form__summary-number">{validation.valid}</div>
                          <div className="setup-form__summary-label">Valid Files</div>
                        </div>
                        {validation.invalid > 0 && (
                          <div className="setup-form__summary-stat setup-form__summary-stat--error">
                            <div className="setup-form__summary-number">{validation.invalid}</div>
                            <div className="setup-form__summary-label">Invalid Files</div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  <button
                    type="button"
                    className="setup-form__toggle-details"
                    onClick={() => setShowRepoDetails(!showRepoDetails)}
                  >
                    {showRepoDetails ? '▼' : '▶'} Repository Details
                  </button>
                  
                  {showRepoDetails && (
                    <div className="setup-form__repo-list">
                      <div className="setup-form__repo-items">
                        {scrapingSummary.repos.map((repo) => (
                          <div key={repo.name} className={`setup-form__repo-item setup-form__repo-item--${repo.status}`}>
                            <div className="setup-form__repo-header">
                              <span className="setup-form__repo-name">{repo.name}</span>
                              <span className="setup-form__repo-status">
                                {repo.status === 'done' && '✅'}
                                {repo.status === 'error' && '❌'}
                              </span>
                            </div>
                            <div className="setup-form__repo-details">
                              {repo.readmeFound ? (
                                <span className="setup-form__repo-badge setup-form__repo-badge--success">
                                  ✅ README {repo.readmeSize ? `(${(repo.readmeSize / 1024).toFixed(1)} KB)` : ''}
                                </span>
                              ) : (
                                <span className="setup-form__repo-badge setup-form__repo-badge--warning">
                                  ⚠️ No README
                                </span>
                              )}
                              {repo.assetsCount > 0 ? (
                                <span className="setup-form__repo-badge setup-form__repo-badge--success">
                                  🖼️ {repo.assetsCount} {repo.assetsCount === 1 ? 'Asset' : 'Assets'}
                                  {repo.assetsTypes && (
                                    <span className="setup-form__repo-asset-types">
                                      {' '}({Object.entries(repo.assetsTypes).map(([type, count]) => `${count} ${type}`).join(', ')})
                                    </span>
                                  )}
                                </span>
                              ) : (
                                <span className="setup-form__repo-badge setup-form__repo-badge--info">
                                  📦 No assets
                                </span>
                              )}
                              {repo.error && (
                                <span className="setup-form__repo-badge setup-form__repo-badge--error">
                                  ❌ Error
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {validation && validation.invalidFiles.length > 0 && (
              <div className="setup-form__field">
                <div className={`setup-form__validation ${
                  validation.invalid > 0 ? 'setup-form__validation--warning' : 'setup-form__validation--success'
                }`}>
                  <h4>📋 Validation Details</h4>
                  <div className="setup-form__invalid-files">
                    <h5>Files with template text:</h5>
                    <ul>
                      {validation.invalidFiles.map((file, index) => (
                        <li key={index}>{file}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {oldFilesInfo && oldFilesInfo.hasOldFiles && (
              <div className="setup-form__field">
                <div className="setup-form__validation setup-form__validation--warning">
                  <h4>⚠️ Old Project Files Detected</h4>
                  <p>
                    Found <strong>{oldFilesInfo.count}</strong> project file(s) that are no longer in your selected repositories.
                    These files will not be displayed in your portfolio but are still taking up space.
                  </p>
                  <div style={{ marginTop: 'var(--space-md)' }}>
                    <button
                      type="button"
                      className="setup-form__button setup-form__button--secondary"
                      onClick={handleArchiveOldFiles}
                      disabled={isArchiving}
                    >
                      {isArchiving ? 'Archiving...' : `📦 Archive ${oldFilesInfo.count} Old File(s)`}
                    </button>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 'var(--space-sm)' }}>
                      Files will be moved to <code>private/data/archive/YYYY-MM-DD/</code> for safekeeping.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

