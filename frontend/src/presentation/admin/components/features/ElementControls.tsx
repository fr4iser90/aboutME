'use client';

import React from 'react';
import { Button } from '@/presentation/shared/ui/button';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  TrashIcon, 
  Cog6ToothIcon,
  ArrowsPointingOutIcon 
} from '@heroicons/react/24/outline';

interface ElementControlsProps {
  elementId: string;
  visible: boolean;
  onToggleVisibility: (elementId: string) => void;
  onDelete: (elementId: string) => void;
  onSettings: (elementId: string) => void;
  onResize: (elementId: string) => void;
  className?: string;
}

export const ElementControls: React.FC<ElementControlsProps> = ({
  elementId,
  visible,
  onToggleVisibility,
  onDelete,
  onSettings,
  onResize,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-md p-1 shadow-sm border ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onToggleVisibility(elementId)}
        className="h-6 w-6 p-0 hover:bg-gray-100"
        title={visible ? 'Hide element' : 'Show element'}
      >
        {visible ? (
          <EyeIcon className="h-3 w-3 text-gray-600" />
        ) : (
          <EyeSlashIcon className="h-3 w-3 text-gray-400" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onResize(elementId)}
        className="h-6 w-6 p-0 hover:bg-gray-100"
        title="Resize element"
      >
        <ArrowsPointingOutIcon className="h-3 w-3 text-gray-600" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onSettings(elementId)}
        className="h-6 w-6 p-0 hover:bg-gray-100"
        title="Element settings"
      >
        <Cog6ToothIcon className="h-3 w-3 text-gray-600" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(elementId)}
        className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
        title="Delete element"
      >
        <TrashIcon className="h-3 w-3" />
      </Button>
    </div>
  );
}; 