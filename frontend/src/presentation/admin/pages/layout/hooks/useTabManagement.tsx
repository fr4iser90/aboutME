import React, { useState, useEffect, createElement } from 'react';
import { usePathname } from 'next/navigation';
import type { Tab } from '@/presentation/admin/contexts/TabContext';
import type { NavigationItem } from '../types';

export const useTabManagement = (
  navigation: NavigationItem[],
  children: React.ReactNode
) => {
  const pathname = usePathname();
  
  const getInitialActiveTab = () => {
    if (pathname.startsWith('/admin/projects')) return 'projects';
    if (pathname.startsWith('/admin/dashboard')) return 'dashboard';
    return 'projects';
  };

  const [activeTab, setActiveTab] = useState(getInitialActiveTab());

  const getInitialOpenTabs = (): Tab[] => {
    const tabs: Tab[] = [];
    if (pathname.startsWith('/admin/projects')) {
      const icon = navigation.find(nav => nav.id === 'projects')?.icon;
      tabs.push({
        id: 'projects', 
        title: 'Projects',
        icon: icon ? createElement('div', null, icon) : createElement('div'),
        content: createElement('div', null, children)
      });
    } else if (pathname.startsWith('/admin/dashboard')) {
      const icon = navigation.find(nav => nav.id === 'dashboard')?.icon;
      tabs.push({
        id: 'dashboard',
        title: 'Dashboard',
        icon: icon ? createElement('div', null, icon) : createElement('div'),
        content: createElement('div', null, children)
      });
    } else if (pathname.startsWith('/admin/skills')) {
      const icon = navigation.find(nav => nav.id === 'skills')?.icon;
      tabs.push({
        id: 'skills',
        title: 'Skills',
        icon: icon ? createElement('div', null, icon) : createElement('div'),
        content: createElement('div', null, children)
      });
    }
    return tabs;
  };

  const [openTabs, setOpenTabs] = useState<Tab[]>(getInitialOpenTabs());

  useEffect(() => {
    const currentPathTabId = pathname.split('/admin/')[1]?.split('/')[0] || 'dashboard';
    if (!openTabs.find(tab => tab.id === currentPathTabId) && navigation.find(nav => nav.id === currentPathTabId)) {
      const navItem = navigation.find(nav => nav.id === currentPathTabId);
      if (navItem) {
        setOpenTabs(prevTabs => {
          const newTabs = [...prevTabs];
          if (!newTabs.find(t => t.id === navItem.id)) {
            newTabs.push({
              id: navItem.id,
              title: navItem.title,
              icon: navItem.icon ? createElement('div', null, navItem.icon) : createElement('div'),
              content: createElement('div', null, children)
            });
          }
          return newTabs;
        });
      }
    }
    setActiveTab(currentPathTabId);
  }, [pathname, children, navigation, openTabs]);

  const handleTabClick = (tabId: string) => {
    if (openTabs.find(tab => tab.id === tabId)) {
      setActiveTab(tabId);
      return;
    }

    const newTabDef = navigation.find(nav => nav.id === tabId);
    if (newTabDef) {
      let contentForNewTab = createElement('div', null, children);
      if (pathname !== newTabDef.path) {
        contentForNewTab = createElement('div', null, `${newTabDef.title} Content Area (placeholder)`);
      }
      
      setOpenTabs([...openTabs, {
        id: newTabDef.id,
        title: newTabDef.title,
        icon: newTabDef.icon ? createElement('div', null, newTabDef.icon) : createElement('div'), 
        content: contentForNewTab
      }]);
      setActiveTab(tabId);
    }
  };

  const openTab = (tab: Tab) => {
    setOpenTabs((prev) => {
      if (prev.find((t) => t.id === tab.id)) {
        setActiveTab(tab.id);
        return prev;
      }
      setActiveTab(tab.id);
      return [...prev, tab];
    });
  };

  const closeTab = (tabId: string) => {
    setOpenTabs((prev) => {
      const idx = prev.findIndex((t) => t.id === tabId);
      if (idx === -1) return prev;
      const newTabs = prev.filter((t) => t.id !== tabId);
      if (activeTab === tabId) {
        if (newTabs.length > 0) {
          const newIdx = idx > 0 ? idx - 1 : 0;
          setActiveTab(newTabs[newIdx].id);
        } else {
          setActiveTab('dashboard');
        }
      }
      return newTabs;
    });
  };

  return {
    activeTab,
    setActiveTab,
    openTabs,
    setOpenTabs,
    handleTabClick,
    openTab,
    closeTab,
  };
}; 