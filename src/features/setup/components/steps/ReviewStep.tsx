/**
 * Review Step Component
 * 
 * Step 4: Review complete configuration before data generation
 */

'use client';

import { SetupWizardConfig } from '@/features/setup/types/setup.types';

interface ReviewStepProps {
  config: SetupWizardConfig;
  repositories?: any[];
}

export default function ReviewStep({ config, repositories }: ReviewStepProps) {
  const enabledFeatures = Object.entries(config.features || {})
    .filter(([_, enabled]) => enabled)
    .map(([name]) => name);

  return (
    <div className="glass-card setup-page__form">
      <h3 className="setup-page__form-title">📋 Review</h3>
      <p className="setup-page__form-description">
        Review your configuration before generating data
      </p>

      <div className="setup-form">
        <div className="setup-form__field">
          <h4>Basic Information</h4>
          <ul className="setup-form__review-list">
            <li>GitHub Username: {config.githubUsername || 'Not set'}</li>
            <li>Portfolio Title: {config.portfolioTitle || 'Not set'}</li>
            <li>Portfolio Author: {config.portfolioAuthor || 'Not set'}</li>
            <li>Description: {config.portfolioDescription || 'Not set'}</li>
          </ul>
        </div>

        {config.githubFilter && (
          <div className="setup-form__field">
            <h4>GitHub Filter</h4>
            <ul className="setup-form__review-list">
              <li>Include Private: {config.githubFilter.includePrivate ? 'Yes' : 'No'}</li>
              <li>Include Forks: {config.githubFilter.includeForks ? 'Yes' : 'No'}</li>
              <li>Include Templates: {config.githubFilter.includeTemplates ? 'Yes' : 'No'}</li>
              <li>Min Stars: {config.githubFilter.minStars}</li>
              <li>Exclude Repos: {config.githubFilter.excludeRepos.length}</li>
              <li>Featured Projects: {config.githubFilter.featuredProjects.length}</li>
            </ul>
          </div>
        )}

        <div className="setup-form__field">
          <h4>Enabled Features</h4>
          <ul className="setup-form__review-list">
            {enabledFeatures.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>

        {repositories && repositories.length > 0 && (
          <div className="setup-form__field">
            <h4>Repositories ({repositories.length})</h4>
            <ul className="setup-form__review-list">
              {repositories.slice(0, 10).map((repo: any, index: number) => (
                <li key={index}>{repo.name}</li>
              ))}
              {repositories.length > 10 && <li>... and {repositories.length - 10} more</li>}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

