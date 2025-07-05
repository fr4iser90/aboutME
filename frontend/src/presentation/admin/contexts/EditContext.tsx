'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface EditContextType {
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  resetEditState: () => void;
}

const EditContext = createContext<EditContextType | undefined>(undefined);

interface EditProviderProps {
  children: ReactNode;
}

export const EditProvider: React.FC<EditProviderProps> = ({ children }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const resetEditState = () => {
    setIsEditing(false);
    setHasUnsavedChanges(false);
  };

  const value: EditContextType = {
    isEditing,
    setIsEditing,
    currentPage,
    setCurrentPage,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    resetEditState,
  };

  return (
    <EditContext.Provider value={value}>
      {children}
    </EditContext.Provider>
  );
};

export const useEdit = (): EditContextType => {
  const context = useContext(EditContext);
  if (context === undefined) {
    throw new Error('useEdit must be used within an EditProvider');
  }
  return context;
}; 