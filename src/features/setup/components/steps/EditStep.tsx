/**
 * Edit Step Component
 * 
 * Step 6: Edit JSON files with full Editor Component (Content, Appearance, Preview)
 */

'use client';

import EditorComponent from '@/features/editor/components/EditorComponent';

interface FileItem {
  name: string;
  path: string;
  category: string;
  size: number;
  lastModified: string;
  source: 'public' | 'private';
}

interface EditStepProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function EditStep({ onComplete, onBack }: EditStepProps) {
  return (
    <div className="setup-page__editor-container">
      {/* Full Editor Component with Tabs */}
      <div className="setup-page__editor-wrapper">
        <EditorComponent />
      </div>

      {/* Actions */}
      <div className="glass-card setup-page__actions">
        <div className="setup-page__actions-left">
          <button
            className="setup-page__button setup-page__button--reset"
            onClick={onBack}
          >
            ← Previous
          </button>
        </div>
        <div className="setup-page__actions-right">
          <button
            className="setup-page__button setup-page__button--primary"
            onClick={onComplete}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
