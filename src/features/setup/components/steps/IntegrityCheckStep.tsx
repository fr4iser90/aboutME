/**
 * Integrity Check Step Component
 * 
 * Step 10: Final verification before publish - checks both files and data integrity
 */

'use client';

import { useState, useEffect } from 'react';

interface IntegrityCheckStepProps {
  onComplete: () => void;
  onCancel: () => void;
  onBack: () => void;
}

export default function IntegrityCheckStep({
  onComplete,
  onCancel,
  onBack,
}: IntegrityCheckStepProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [fileValidation, setFileValidation] = useState<{
    total: number;
    valid: number;
    invalid: number;
  } | null>(null);
  const [dataIntegrity, setDataIntegrity] = useState<{
    valid: boolean;
    missingFiles: string[];
  } | null>(null);

  useEffect(() => {
    runIntegrityCheck();
  }, []);

  const runIntegrityCheck = async () => {
    setIsChecking(true);
    try {
      // Check file validation
      const validationResponse = await fetch('/api/setup/validate-files');
      if (validationResponse.ok) {
        const validationData = await validationResponse.json();
        setFileValidation({
          total: validationData.total,
          valid: validationData.valid,
          invalid: validationData.invalid,
        });
      }

      // Check data integrity (required JSON files exist)
      const integrityResponse = await fetch('/api/setup/preview-data');
      if (integrityResponse.ok) {
        const integrityData = await integrityResponse.json();
        const missingFiles: string[] = [];
        
        if (!integrityData.user) missingFiles.push('user/user.json');
        if (!integrityData.projects) missingFiles.push('projects/projects.json');
        
        setDataIntegrity({
          valid: missingFiles.length === 0,
          missingFiles,
        });
      }
    } catch (error) {
      console.error('Error running integrity check:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const allChecksPass =
    fileValidation &&
    fileValidation.invalid === 0 &&
    dataIntegrity &&
    dataIntegrity.valid;

  return (
    <div className="glass-card setup-page__form">
      <h3 className="setup-page__form-title">🔒 Integrity Check</h3>
      <p className="setup-page__form-description">
        Final verification before publish - checks both files and data integrity
      </p>

      <div className="setup-form">
        {isChecking && (
          <div className="setup-form__field">
            <p>Running integrity check...</p>
          </div>
        )}

        {fileValidation && dataIntegrity && !isChecking && (
          <>
            <div className="setup-form__field">
              <div className="setup-form__validation">
                <h4>File Validation</h4>
                <p>Total: {fileValidation.total}</p>
                <p>Valid: {fileValidation.valid}</p>
                <p>Invalid: {fileValidation.invalid}</p>
                <p>{fileValidation.invalid === 0 ? '✅ All files valid' : '⚠️ Some files invalid'}</p>
              </div>
            </div>

            <div className="setup-form__field">
              <div className="setup-form__validation">
                <h4>Data Integrity</h4>
                {dataIntegrity.missingFiles.length > 0 ? (
                  <>
                    <p>⚠️ Missing files:</p>
                    <ul>
                      {dataIntegrity.missingFiles.map((file, index) => (
                        <li key={index}>{file}</li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p>✅ All required files exist</p>
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
                  className="setup-form__button setup-form__button--secondary"
                  onClick={onCancel}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="setup-form__button setup-form__button--primary"
                  onClick={onComplete}
                  disabled={!allChecksPass}
                >
                  Continue to Publish
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

