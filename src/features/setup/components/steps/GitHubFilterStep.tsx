/**
 * GitHub Filter Step Component
 * 
 * Step 2: Filter GitHub repositories and mark featured projects
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { GitHubFilterConfig } from '@/features/setup/types/setup.types';
import { Repository, getDefaultFilterConfig } from '@/features/setup/services/githubFilter';

interface GitHubFilterStepProps {
  config: {
    githubUsername: string;
    githubToken?: string;
    githubFilter?: GitHubFilterConfig;
  };
  onUpdate: (filter: GitHubFilterConfig) => void;
  onReposUpdate?: (repos: Repository[]) => void;
}

export default function GitHubFilterStep({ config, onUpdate, onReposUpdate }: GitHubFilterStepProps) {
  const [filter, setFilter] = useState<GitHubFilterConfig>(
    config.githubFilter || getDefaultFilterConfig()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [allRepositories, setAllRepositories] = useState<Repository[]>([]);
  const [filteredRepositories, setFilteredRepositories] = useState<Repository[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fetchMetadata, setFetchMetadata] = useState<{
    fetchMethod: 'api' | 'playwright';
    privateReposExcluded: boolean;
  } | null>(null);

  // Track last sent filter to prevent infinite loop
  const lastSentFilterRef = useRef<string>(JSON.stringify(filter));

  // Update filter when config changes (e.g., when going back) - only if different
  useEffect(() => {
    if (config.githubFilter) {
      const configFilterStr = JSON.stringify(config.githubFilter);
      const currentFilterStr = JSON.stringify(filter);
      
      if (configFilterStr !== currentFilterStr) {
        setFilter(config.githubFilter);
        lastSentFilterRef.current = configFilterStr; // Update ref to match
      }
    }
  }, [config.githubFilter]); // Only depend on config.githubFilter

  // Auto-fetch repositories on mount
  useEffect(() => {
    if (config.githubUsername) {
      fetchAllRepositories();
    }
  }, [config.githubUsername]);

  // Apply filters when filter config or allRepositories change
  useEffect(() => {
    if (allRepositories.length > 0) {
      applyFilters();
    }
  }, [filter, allRepositories]);

  // Notify parent when filtered repos change
  useEffect(() => {
    if (filteredRepositories.length > 0 && onReposUpdate) {
      onReposUpdate(filteredRepositories);
    }
  }, [filteredRepositories, onReposUpdate]);

  // Update parent when filter changes - only if it's different from last sent
  useEffect(() => {
    const currentFilterStr = JSON.stringify(filter);
    
    // Only update if filter actually changed from what we last sent
    if (currentFilterStr !== lastSentFilterRef.current) {
      lastSentFilterRef.current = currentFilterStr;
      onUpdate(filter);
    }
  }, [filter]); // Only depend on filter, not onUpdate

  const fetchAllRepositories = async () => {
    if (!config.githubUsername) {
      setError('Please enter GitHub username in Step 1');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/setup/github-filter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          githubUsername: config.githubUsername,
          githubToken: config.githubToken,
          filterConfig: {
            ...getDefaultFilterConfig(),
            includeForks: true,
            includeTemplates: true,
            includePrivate: true, // Fetch all repos initially
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }

      const data = await response.json();
      setAllRepositories(data.result.repositories || []);
      setFetchMetadata(data.metadata || null);
    } catch (error) {
      console.error('Error fetching repositories:', error);
      setError('Failed to fetch repositories. Please check your GitHub username and token.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    // Show all repos but mark excluded ones (for UI display)
    // The actual filtering happens when saving to config
    setFilteredRepositories(allRepositories);
  };

  const isRepoExcluded = (repo: Repository): boolean => {
    // Excluded manually
    if (filter.excludeRepos.includes(repo.name)) {
      return true;
    }
    // Excluded by fork filter
    if (!filter.includeForks && repo.fork) {
      return true;
    }
    // Excluded by template filter
    if (!filter.includeTemplates && repo.is_template) {
      return true;
    }
    // Excluded by private filter
    if (!filter.includePrivate && repo.visibility === 'private') {
      return true;
    }
    // Excluded by min stars
    if (filter.minStars > 0 && (repo.stargazers_count || 0) < filter.minStars) {
      return true;
    }
    return false;
  };

  const handleExcludeToggle = (repoName: string) => {
    const newExcluded = filter.excludeRepos.includes(repoName)
      ? filter.excludeRepos.filter((r) => r !== repoName)
      : [...filter.excludeRepos, repoName];
    setFilter({ ...filter, excludeRepos: newExcluded });
  };

  const handleFeaturedToggle = (repoName: string) => {
    const newFeatured = filter.featuredProjects.includes(repoName)
      ? filter.featuredProjects.filter((r) => r !== repoName)
      : [...filter.featuredProjects, repoName];
    setFilter({ ...filter, featuredProjects: newFeatured });
  };

  const featuredCount = filter.featuredProjects.length;
  const privateCount = filteredRepositories.filter((r) => r.visibility === 'private').length;
  const excludedCount = allRepositories.filter((r) => isRepoExcluded(r)).length;
  const visibleCount = allRepositories.length - excludedCount;

  return (
    <>
      {/* Compact Info Banner */}
      {fetchMetadata && (
        <div className={`setup-page__info-box setup-page__info-box--compact ${fetchMetadata.fetchMethod === 'playwright' ? 'setup-page__info-box--muted' : ''}`}>
          <span className="setup-page__info-compact">
            {fetchMetadata.fetchMethod === 'api' ? (
              <>📡 GitHub API</>
            ) : (
              <>
                🎭 Data scrapped via Playwright
                {fetchMetadata.privateReposExcluded && (
                  <> - without API are Private repos excluded</>
                )}
              </>
            )}
          </span>
        </div>
      )}

      {/* Two-Column Layout */}
      <div className="setup-page__two-column">
        {/* Left Column: Filter + Summary */}
        <div className="setup-page__two-column-left">
          {/* Filter Options Card */}
          <div className="glass-card setup-page__form setup-page__form--compact">
            <h3 className="setup-page__form-title setup-page__form-title--compact">🔍 Filter</h3>

            {error && (
              <div className="setup-form__error" style={{ marginBottom: 'var(--space-md)' }}>
                {error}
              </div>
            )}

            <div className="setup-form setup-form--compact">
              {/* Include Private Repositories */}
              <div className="setup-form__field">
                <label className={`setup-form__toggle-label ${fetchMetadata?.privateReposExcluded ? 'setup-form__toggle-label--disabled' : ''}`}>
                  <div className="setup-form__toggle">
                    <input
                      type="checkbox"
                      checked={filter.includePrivate}
                      onChange={(e) => setFilter({ ...filter, includePrivate: e.target.checked })}
                      disabled={fetchMetadata?.privateReposExcluded || false}
                    />
                    <span className="setup-form__toggle-slider"></span>
                  </div>
                  <span>Include Private</span>
                </label>
              </div>

              {/* Include Forks */}
              <div className="setup-form__field">
                <label className="setup-form__toggle-label">
                  <div className="setup-form__toggle">
                    <input
                      type="checkbox"
                      checked={filter.includeForks}
                      onChange={(e) => setFilter({ ...filter, includeForks: e.target.checked })}
                    />
                    <span className="setup-form__toggle-slider"></span>
                  </div>
                  <span>Include Forks</span>
                </label>
              </div>

              {/* Include Templates */}
              <div className="setup-form__field">
                <label className="setup-form__toggle-label">
                  <div className="setup-form__toggle">
                    <input
                      type="checkbox"
                      checked={filter.includeTemplates}
                      onChange={(e) => setFilter({ ...filter, includeTemplates: e.target.checked })}
                    />
                    <span className="setup-form__toggle-slider"></span>
                  </div>
                  <span>Include Templates</span>
                </label>
              </div>

              {/* Min Stars */}
              <div className="setup-form__field">
                <label className="setup-form__label">Min Stars</label>
                <input
                  type="number"
                  className="setup-form__input"
                  value={filter.minStars || ''}
                  onChange={(e) => setFilter({ ...filter, minStars: parseInt(e.target.value) || 0 })}
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Summary Card */}
          {!isLoading && filteredRepositories.length > 0 && (
            <div className="glass-card setup-page__form setup-page__form--compact">
              <h3 className="setup-page__form-title setup-page__form-title--compact">📊 Summary</h3>
              <div className="setup-page__summary-grid">
                <div className="setup-page__summary-item">
                  <div className="setup-page__summary-label">Total</div>
                  <div className="setup-page__summary-value">{allRepositories.length}</div>
                </div>
                <div className="setup-page__summary-item">
                  <div className="setup-page__summary-label">Visible</div>
                  <div className="setup-page__summary-value">{visibleCount}</div>
                </div>
                <div className="setup-page__summary-item">
                  <div className="setup-page__summary-label">Excluded</div>
                  <div className="setup-page__summary-value">{excludedCount}</div>
                </div>
                <div className="setup-page__summary-item">
                  <div className="setup-page__summary-label">Featured</div>
                  <div className="setup-page__summary-value">{featuredCount}</div>
                </div>
                {privateCount > 0 && (
                  <div className="setup-page__summary-item">
                    <div className="setup-page__summary-label">Private</div>
                    <div className="setup-page__summary-value">{privateCount}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Repository List */}
        <div className="glass-card setup-page__form setup-page__form--compact">
          <h3 className="setup-page__form-title setup-page__form-title--compact">📦 Repositories</h3>
          
          {isLoading ? (
            <div className="setup-page__generation">
              <div className="setup-page__spinner"></div>
              <p className="setup-page__progress-text">Loading repositories...</p>
            </div>
          ) : filteredRepositories.length === 0 ? (
            <p className="setup-form__hint">
              {allRepositories.length === 0
                ? 'No repositories found. Please check your GitHub username.'
                : 'No repositories match the current filters.'}
            </p>
          ) : (
            <>
              {/* Repository List */}
              <div className="setup-form__field setup-form__field--flex">
              <div className="setup-form__repository-list">
                {filteredRepositories.map((repo) => {
                  const isFeatured = filter.featuredProjects.includes(repo.name);
                  const isPrivate = repo.visibility === 'private';
                  const isExcluded = isRepoExcluded(repo);
                  
                  return (
                    <div
                      key={repo.id}
                      className={`setup-form__repository-item setup-form__repository-item--compact ${isFeatured ? 'setup-form__repository-item--featured' : ''} ${isExcluded ? 'setup-form__repository-item--excluded' : ''}`}
                    >
                      <div className="setup-form__repository-header">
                        <div className="setup-form__repository-info">
                          <h4 className="setup-form__repository-name setup-form__repository-name--compact">
                            <a
                              href={repo.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="setup-form__repository-link"
                            >
                              📦 {repo.name}
                            </a>
                          </h4>
                          <div className="setup-form__repository-badges">
                            {repo.fork && <span className="setup-form__repository-badge">Fork</span>}
                            {repo.is_template && <span className="setup-form__repository-badge">Template</span>}
                            {isPrivate && <span className="setup-form__repository-badge setup-form__repository-badge--private">Private</span>}
                          </div>
                        </div>
                        <div className="setup-form__repository-stats">
                          <span className="setup-form__repository-stars">
                            ⭐ {repo.stargazers_count || 0}
                          </span>
                          <button
                            type="button"
                            className="setup-form__repository-exclude"
                            onClick={() => handleExcludeToggle(repo.name)}
                            title={isExcluded ? 'Include repository' : 'Exclude repository'}
                          >
                            {isExcluded ? '↩️' : '❌'}
                          </button>
                        </div>
                      </div>
                      
                      {repo.description && (
                        <p className="setup-form__repository-description setup-form__repository-description--compact">
                          {repo.description}
                        </p>
                      )}
                      
                      <div className="setup-form__repository-actions">
                        <button
                          type="button"
                          className={`setup-form__featured-toggle setup-form__featured-toggle--compact ${isFeatured ? 'setup-form__featured-toggle--active' : ''}`}
                          onClick={() => handleFeaturedToggle(repo.name)}
                          disabled={isExcluded}
                        >
                          {isFeatured ? '⭐ Featured' : '⭐ Featured'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
