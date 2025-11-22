/**
 * Build & Publish Step Component
 * 
 * Step 11: Build (Validate + Publish) - validates JSON files and publishes to public/data
 * JSON-only architecture - no MD→JSON conversion needed
 */

'use client';

import { useState } from 'react';

interface BuildPublishStepProps {
  onComplete: () => void;
}

export default function BuildPublishStep({ onComplete }: BuildPublishStepProps) {
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildResult, setBuildResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBuild = async () => {
    setIsBuilding(true);
    setError(null);
    try {
      // Step 1: Validate all JSON files
      console.log('🔍 Step 1: Validating JSON files...');
      const validateResponse = await fetch('/api/setup/validate-files', {
        method: 'GET',
      });

      if (!validateResponse.ok) {
        throw new Error('Validation failed');
      }

      const validationData = await validateResponse.json();
      
      if (validationData.invalid > 0) {
        setError(`Validation found ${validationData.invalid} invalid file(s). Please fix errors before building.`);
        setIsBuilding(false);
        return;
      }

      console.log(`✅ Validation passed: ${validationData.valid} valid files`);

      // Step 2: Publish (copy from private/data to public/data)
      console.log('📦 Step 2: Publishing to public/data...');
      const publishResponse = await fetch('/api/setup/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!publishResponse.ok) {
        throw new Error('Publish failed');
      }

      const publishData = await publishResponse.json();
      
      // Update progress status
      try {
        await fetch('/api/setup/config', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            progress: {
              validated: true,
              published: true,
              validatedAt: new Date().toISOString(),
              publishedAt: new Date().toISOString(),
            },
          }),
        });
      } catch (err) {
        console.warn('Failed to update progress:', err);
      }

      setBuildResult({
        validation: validationData,
        publish: publishData,
      });
      setIsBuilding(false);
      
      console.log('✅ Build & Publish completed successfully!');
    } catch (err) {
      console.error('Build error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsBuilding(false);
    }
  };

  const isComplete = buildResult;

  return (
    <div className="glass-card setup-page__form">
      <h3 className="setup-page__form-title">🚀 Build & Publish</h3>
      <p className="setup-page__form-description">
        Validate your JSON files and publish your portfolio to make it publicly available
      </p>

      <div className="setup-form">
        {/* Build Section */}
        <div className="setup-form__field">
          <h4>Build & Publish</h4>
          <p className="setup-form__field-description">
            Validates all JSON files and publishes them from private/data to public/data
          </p>
          {!buildResult && (
            <button
              type="button"
              className="setup-form__button setup-form__button--primary"
              onClick={handleBuild}
              disabled={isBuilding}
            >
              {isBuilding ? 'Building & Publishing...' : 'Build & Publish'}
            </button>
          )}
          {buildResult && (
            <div className="setup-form__success">
              <p>✅ Build & Publish complete</p>
              <p>Validated: {buildResult.validation?.valid || 0} files</p>
              <p>Published: {buildResult.publish?.copiedFiles?.length || 0} files</p>
            </div>
          )}
        </div>

        {error && (
          <div className="setup-form__field">
            <div className="setup-form__error">
              <p>Error: {error}</p>
            </div>
          </div>
        )}

        {isComplete && (
          <div className="setup-form__field">
            <div className="setup-form__success">
              <h4>🎉 Portfolio Published Successfully!</h4>
              <p>Your portfolio is now publicly available.</p>
            </div>
            <div className="setup-form__actions">
              <button
                type="button"
                className="setup-form__button setup-form__button--primary"
                onClick={onComplete}
              >
                Finish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

