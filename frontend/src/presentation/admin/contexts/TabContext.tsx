import { createContext, useContext, ReactElement } from 'react';

interface Tab {
  id: string;
  title: string;
  icon: ReactElement;
  content: ReactElement;
}

interface TabContextType {
  openTab: (tab: Tab) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  activeTab: string;
  openTabs: Tab[];
}

export const TabContext = createContext<TabContextType | undefined>(undefined);

export function useTabContext() {
  const context = useContext(TabContext);
  if (context === undefined) {
    throw new Error('useTabContext must be used within a TabContext.Provider');
  }
  return context;
}

export type { Tab, TabContextType }; 