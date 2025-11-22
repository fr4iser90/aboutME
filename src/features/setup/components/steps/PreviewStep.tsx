/**
 * Preview Step Component
 * 
 * Step 9: Preview portfolio with real data before publishing
 */

'use client';

import { useState, useEffect } from 'react';

interface PreviewStepProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function PreviewStep({ onComplete, onBack }: PreviewStepProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [previewData, setPreviewData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPreviewData();
  }, []);

  const loadPreviewData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/setup/preview-data');
      if (response.ok) {
        const data = await response.json();
        setPreviewData(data);
      } else {
        throw new Error('Failed to load preview data');
      }
    } catch (err) {
      console.error('Error loading preview data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card setup-page__form">
      <h3 className="setup-page__form-title">👁️ Preview</h3>
      <p className="setup-page__form-description">
        Preview your portfolio with real data before publishing
      </p>

      <div className="setup-form">
        {isLoading && (
          <div className="setup-form__field">
            <p>Loading preview data...</p>
          </div>
        )}

        {error && (
          <div className="setup-form__field">
            <div className="setup-form__error">
              <p>Error loading preview: {error}</p>
            </div>
          </div>
        )}

        {previewData && !isLoading && (
          <div className="setup-form__field">
            <div className="setup-form__preview-window">
              <h4>Portfolio Preview</h4>
              <div className="setup-form__preview-content">
                {previewData.projects && (
                  <div>
                    <h5>Projects ({previewData.projects.length})</h5>
                    <ul>
                      {previewData.projects.slice(0, 5).map((project: any, index: number) => (
                        <li key={index}>{project.name || project.title}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {previewData.about && (
                  <div>
                    <h5>About</h5>
                    <p>{previewData.about.content?.substring(0, 200)}...</p>
                  </div>
                )}
                <p className="setup-form__hint">
                  This is a preview of how your portfolio will look to visitors
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="setup-form__field">
          <div className="setup-form__actions">
            <button
              type="button"
              className="setup-form__button setup-form__button--secondary"
              onClick={onBack}
            >
              Back to Edit
            </button>
            <button
              type="button"
              className="setup-form__button setup-form__button--primary"
              onClick={onComplete}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

