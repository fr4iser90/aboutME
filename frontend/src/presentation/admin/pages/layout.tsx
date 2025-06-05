'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/presentation/shared/ui/button';
import { ScrollArea } from '@/presentation/shared/ui/scroll-area';
import { 
  LayoutDashboard, 
  FolderGit2, 
  Settings, 
  Palette, 
  User, 
  MessageSquare,
  SplitSquareHorizontal,
  X,
  Upload,
  Folder,
  FileText,
  ArrowUp,
  FolderIcon,
  FileTextIcon
} from 'lucide-react';
import AdminContext from '@/presentation/admin/components/AdminContext';
import CopilotChat from '@/presentation/admin/components/CopilotChat';
import { ProjectList } from '@/presentation/admin/components/features/projects/ProjectList';
import { SectionList } from '@/presentation/admin/components/features/sections/SectionList';
import { FileTree } from '@/presentation/admin/components/features/filemanager/FileTree';
import type { Project as DomainProject } from '@/domain/entities/Project';
import { TabContext, type Tab } from '@/presentation/admin/contexts/TabContext';
import { Section } from '@/domain/entities/Section';
import { SectionEditor } from '@/presentation/admin/components/features/sections/SectionEditor';
import React, { createContext } from 'react';
import '@/domain/shared/styles/admin-layout.css';

// Create a context for file manager state
export const FileManagerContext = createContext<{
  refreshFiles: () => void;
  refreshTrigger: number;
  selectedFile: any;
  setSelectedFile: (file: any) => void;
}>({
  refreshFiles: () => {},
  refreshTrigger: 0,
  selectedFile: null,
  setSelectedFile: () => {},
});

export function FileManagerProvider({ children }: { children: React.ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const isRefreshing = useRef(false);

  const refreshFiles = useCallback(() => {
    if (isRefreshing.current) return;
    isRefreshing.current = true;
    setRefreshTrigger(prev => prev + 1);
    setTimeout(() => {
      isRefreshing.current = false;
    }, 1000);
  }, []);

  return (
    <FileManagerContext.Provider value={{ refreshFiles, refreshTrigger, selectedFile, setSelectedFile }}>
      {children}
    </FileManagerContext.Provider>
  );
}

export default function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("--- AdminLayout (Full UI with Tabs) RENDERING ---");
  const pathname = usePathname();

  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const initialActiveTab = pathname.startsWith('/admin/projects') ? 'projects' : 
                         pathname.startsWith('/admin/dashboard') ? 'dashboard' : 
                         'projects';

  const [activeTab, setActiveTab] = useState(initialActiveTab); 
  const [selectedProject, setSelectedProjectInternal] = useState<DomainProject | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);

  const handleSetSelectedProject = (project: DomainProject | null) => {
    console.log('AdminLayout: handleSetSelectedProject called with project:', project);
    setSelectedProjectInternal(project);
    if (project) {
      setIsRightSidebarOpen(true);
    }
  };

  const navigation = [
    { id: 'dashboard', title: 'Dashboard', icon: <LayoutDashboard className="admin-layout__nav-icon" />, path: '/admin' },
    { id: 'projects', title: 'Projects', icon: <FolderGit2 className="admin-layout__nav-icon" />, path: '/admin/projects' },
    { id: 'sections', title: 'Sections', icon: <SplitSquareHorizontal className="admin-layout__nav-icon" />, path: '/admin/sections' },
    { id: 'files', title: 'Files', icon: <Folder className="admin-layout__nav-icon" />, path: '/admin/files' },
    { id: 'themes', title: 'Themes', icon: <Palette className="admin-layout__nav-icon" />, path: '/admin/themes' },
    { id: 'about', title: 'About Me', icon: <User className="admin-layout__nav-icon" />, path: '/admin/about' },
    { id: 'settings', title: 'Settings', icon: <Settings className="admin-layout__nav-icon" />, path: '/admin/settings' },
  ];

  const getInitialOpenTabs = () => {
    const tabs: Tab[] = [];
    if (pathname.startsWith('/admin/projects')) {
      tabs.push({
        id: 'projects', 
        title: 'Projects',
        icon: <FolderGit2 className="admin-layout__tab-icon" />,
        content: <>{children}</>
      });
    } else if (pathname.startsWith('/admin/dashboard')) {
      tabs.push({
        id: 'dashboard',
        title: 'Dashboard',
        icon: <LayoutDashboard className="admin-layout__tab-icon" />,
        content: <>{children}</>
      });
    } else if (pathname.startsWith('/admin/skills')) {
      tabs.push({
        id: 'skills',
        title: 'Skills',
        icon: <Palette className="admin-layout__tab-icon" />,
        content: <>{children}</>
      });
    }
    if (!tabs.find(t => t.id === activeTab) && tabs.length > 0) {
      setActiveTab(tabs[0].id);
    } else if (tabs.length === 0 && navigation.length > 0) {
      if (activeTab === 'projects' && !tabs.find(t => t.id === 'projects')) {
        tabs.push({
          id: 'projects', 
          title: 'Projects',
          icon: <FolderGit2 className="admin-layout__tab-icon" />,
          content: <>{children}</>
        });
      }
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
              icon: navItem.icon,
              content: <>{children}</>
            });
          }
          return newTabs;
        });
      }
    }
    setActiveTab(currentPathTabId);
  }, [pathname, children, navigation]);

  const handleTabClick = (tabId: string) => {
    if (openTabs.find(tab => tab.id === tabId)) {
      setActiveTab(tabId);
      return;
    }

    const newTabDef = navigation.find(nav => nav.id === tabId);
    if (newTabDef) {
      let contentForNewTab = <>{children}</>;
      if (pathname !== newTabDef.path) {
        contentForNewTab = <div>{newTabDef.title} Content Area (placeholder)</div>;
      }
      
      setOpenTabs([...openTabs, {
        id: newTabDef.id,
        title: newTabDef.title,
        icon: newTabDef.icon, 
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

  const copilotContext = {
    currentTab: activeTab,
    selectedProject: selectedProject ? {
      title: selectedProject.title,
      description: selectedProject.description,
      technologies: selectedProject.technologies
    } : undefined
  };
  
  let activeContent = <div>Loading content...</div>;
  const currentActiveTabObject = openTabs.find(tab => tab.id === activeTab);

  if (currentActiveTabObject) {
    const currentPathMainSection = pathname.split('/admin/')[1]?.split('/')[0] || 'dashboard';
    if (activeTab === currentPathMainSection) {
      activeContent = <>{children}</>;
    } else {
      activeContent = currentActiveTabObject.content;
    }
  } else if (openTabs.length === 0 && navigation.find(n => n.id === activeTab)) {
    const currentPathMainSection = pathname.split('/admin/')[1]?.split('/')[0] || 'dashboard';
    if(activeTab === currentPathMainSection) {
      activeContent = <>{children}</>;
    }
  }

  const adminContextValue = useMemo(() => ({
    selectedProject,
    setSelectedProject: handleSetSelectedProject
  }), [selectedProject]);

  return (
    <AdminContext.Provider value={{ selectedProject, setSelectedProject: handleSetSelectedProject }}>
      <TabContext.Provider value={{ openTab, closeTab, setActiveTab, activeTab, openTabs }}>
        <div className="admin-layout">
          <aside className="admin-layout__sidebar">
            <ScrollArea className="admin-layout__scroll-area">
              <div className="admin-layout__sidebar-content">
                {navigation.map((item) => (
                  <Link key={item.id} href={item.path} passHref>
                    <Button
                      variant={activeTab === item.id ? "secondary" : "ghost"}
                      size="icon"
                      className="admin-layout__nav-button"
                      aria-label={item.title}
                    >
                      {item.icon}
                    </Button>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          </aside>
          <aside className="admin-layout__contextbar">
            {activeTab === 'projects' && (
              <>
                <div className="admin-layout__context-header">
                  <h2 className="admin-layout__context-title">Project Tools</h2>
                </div>
                <div className="admin-layout__context-body">
                  <h2 className="admin-layout__context-subtitle">Project List</h2>
                  <ScrollArea className="admin-layout__context-scroll-area">
                    <ProjectList 
                      onEditProject={(project: DomainProject) => handleSetSelectedProject(project)} 
                      viewMode="simple" 
                    />
                  </ScrollArea>
                </div>
              </>
            )}
            {activeTab === 'sections' && (
              <>
                <div className="admin-layout__context-header">
                  <h2 className="admin-layout__context-title">Section Tools</h2>
                </div>
                <div className="admin-layout__context-body">
                  <h2 className="admin-layout__context-subtitle">Section List</h2>
                  <ScrollArea className="admin-layout__context-scroll-area">
                    <SectionList onEditSection={setSelectedSection} />
                  </ScrollArea>
                </div>
              </>
            )}
            {activeTab === 'files' && (
              <>
                <div className="admin-layout__context-header">
                  <h2 className="admin-layout__context-title">File Manager</h2>
                </div>
                <div className="admin-layout__context-body">
                  <h2 className="admin-layout__context-subtitle">Files & Folders</h2>
                  <ScrollArea className="admin-layout__context-scroll-area">
                    <FileTree autoLoad={true} />
                  </ScrollArea>
                </div>
              </>
            )}
            {activeTab !== 'projects' && activeTab !== 'sections' && activeTab !== 'files' && (
              <>
                <h2 className="admin-layout__context-title">Context List</h2>
                <p className="admin-layout__context-text">Content for {activeTab} list...</p>
              </>
            )}
          </aside>
          <main className="admin-layout__main">
            <div className="admin-layout__tabs-container">
              <div className="admin-layout__tabs-header">
                {openTabs.map((tab) => (
                  <div
                    key={tab.id}
                    className={cn(
                      "admin-layout__tab-item",
                      activeTab === tab.id ? "admin-layout__tab-item--active" : ""
                    )}
                  >
                    <button
                      className="admin-layout__tab-button"
                      onClick={() => setActiveTab(tab.id)}
                    >
                      {tab.icon}
                      <span>{tab.title}</span>
                    </button>
                    {openTabs.length > 1 && (
                      <button
                        className="admin-layout__tab-close-button"
                        onClick={() => closeTab(tab.id)}
                      >
                        <X className="admin-layout__tab-close-icon" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-layout__content-area">
              {activeTab === 'sections' && selectedSection ? (
                <SectionEditor section={selectedSection} onSave={() => setSelectedSection(null)} onCancel={() => setSelectedSection(null)} />
              ) : (
                openTabs.find((tab) => tab.id === activeTab)?.content || null
              )}
            </div>
          </main>
          <aside className="admin-layout__copilotbar">
            {isRightSidebarOpen && (
              <div className="admin-layout__copilot-content">
                <div className="admin-layout__copilot-header">
                  <div className="admin-layout__copilot-title-group">
                    <MessageSquare className="admin-layout__copilot-icon" />
                    <span className="admin-layout__copilot-title">Copilot</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsRightSidebarOpen(false)}
                  >
                    <X className="admin-layout__copilot-icon" />
                  </Button>
                </div>
                <CopilotChat context={copilotContext} />
              </div>
            )}
          </aside>
        </div>
      </TabContext.Provider>
    </AdminContext.Provider>
  );
}
