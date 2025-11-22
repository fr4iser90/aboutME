/**
 * Quality Check Step Component
 * 
 * Step 8: Verify all markdown files are complete after editing
 */

'use client';

import { useState, useEffect } from 'react';

interface QualityCheckStepProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function QualityCheckStep({ onComplete, onBack }: QualityCheckStepProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validation, setValidation] = useState<{
    total: number;
    valid: number;
    invalid: number;
    invalidFiles: string[];
  } | null>(null);

  useEffect(() => {
    runValidation();
  }, []);

  const runValidation = async () => {
    setIsValidating(true);
    try {
      const response = await fetch('/api/setup/validate-files');
      if (response.ok) {
        const data = await response.json();
        setValidation({
          total: data.total,
          valid: data.valid,
          invalid: data.invalid,
          invalidFiles: Object.entries(data.results)
            .filter(([_, result]: [string, any]) => !result.isValid)
            .map(([path]) => path),
        });
      }
    } catch (error) {
      console.error('Error validating files:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const allValid = validation && validation.invalid === 0;

  return (
    <div className="glass-card setup-page__form">
      <h3 className="setup-page__form-title">✅ Quality Check</h3>
      <p className="setup-page__form-description">
        Verify all markdown files are complete after editing
      </p>

      <div className="setup-form">
        {isValidating && (
          <div className="setup-form__field">
            <p>Validating all files...</p>
          </div>
        )}

        {validation && !isValidating && (
          <>
            <div className="setup-form__field">
              <div
                className={`setup-form__validation ${
                  validation.invalid > 0
                    ? 'setup-form__validation--warning'
                    : 'setup-form__validation--success'
                }`}
              >
                <h4>Validation Results</h4>
                <p>Total files: {validation.total}</p>
                <p>Valid files: {validation.valid}</p>
                <p>Invalid files: {validation.invalid}</p>

                {validation.invalidFiles.length > 0 && (
                  <div className="setup-form__invalid-files">
                    <h5>Files with issues:</h5>
                    <ul>
                      {validation.invalidFiles.map((file, index) => (
                        <li key={index}>{file}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

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
                  disabled={!allValid}
                >
                  Continue
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

