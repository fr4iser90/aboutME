'use client';

import React from 'react';
import { useEdit } from '@/presentation/admin/contexts/EditContext';
import { Button } from '@/presentation/shared/ui/button';
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface EditButtonProps {
  className?: string;
  onSave?: () => void;
  onCancel?: () => void;
  disabled?: boolean;
}

export const EditButton: React.FC<EditButtonProps> = ({
  className = '',
  onSave,
  onCancel,
  disabled = false,
}) => {
  const { isEditing, setIsEditing, hasUnsavedChanges } = useEdit();

  const handleToggleEdit = () => {
    if (isEditing) {
      // If we're in edit mode, this becomes a save action
      if (onSave) {
        onSave();
      } else {
        setIsEditing(false);
      }
    } else {
      // Enter edit mode
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className={`flex gap-2 ${className}`}>
        <Button
          onClick={handleToggleEdit}
          disabled={disabled || !hasUnsavedChanges}
          variant="default"
          size="sm"
          className="flex items-center gap-2"
        >
          <CheckIcon className="h-4 w-4" />
          Save
        </Button>
        <Button
          onClick={handleCancel}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <XMarkIcon className="h-4 w-4" />
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleToggleEdit}
      variant="outline"
      size="sm"
      className={`flex items-center gap-2 ${className}`}
    >
      <PencilIcon className="h-4 w-4" />
      Edit Layout
    </Button>
  );
}; 