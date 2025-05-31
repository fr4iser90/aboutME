'use client';

import { useState, useEffect, useMemo } from 'react'; // Added useMemo
import { usePathname } from 'next/navigation'; // To potentially make tab content more dynamic
import Link from 'next/link'; // Import Link for navigation
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutDashboard, 
  FolderGit2, 
  Settings, 
  Palette, 
  User, 
  MessageSquare,
  SplitSquareHorizontal,
  X
} from 'lucide-react';
// ProjectEditor import is removed from here as the editor will be shown by the page in the main content area.
import AdminContext from './AdminContext'; // Import the context
import CopilotChat from './components/CopilotChat';
import type { LLMContext } from '@/lib/llm-service';

// Components for Spalte 2 (List Sidebar) when projects are active
import { ProjectList } from '@/presentation/public/components/admin/ProjectList';


interface Tab {
  id: string;
  title: string;
  icon: React.ReactNode; // Reverted to React.ReactNode
  content: React.ReactNode;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("--- AdminLayout (Full UI with Tabs) RENDERING ---");
  const pathname = usePathname(); // Get current path

  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  // Default activeTab to 'projects' if on /admin/projects, otherwise to 'dashboard' or first nav item
  const initialActiveTab = pathname.startsWith('/admin/projects') ? 'projects' : 
                           pathname.startsWith('/admin/dashboard') ? 'dashboard' : 
                           'projects'; // Fallback to projects

  const [activeTab, setActiveTab] = useState(initialActiveTab); 
  const [selectedProject, setSelectedProjectInternal] = useState<any>(null); // Renamed internal setter

  // Function to handle setting selected project and ensuring sidebar is open
  const handleSetSelectedProject = (project: any | null) => {
    console.log('AdminLayout: handleSetSelectedProject called with project:', project); // DEBUG LOG
    setSelectedProjectInternal(project);
    if (project) {
      setIsRightSidebarOpen(true); // Ensure sidebar is open when a project is selected
    }
    // If project is null (deselecting), the sidebar will show Copilot if it's open.
    // User can manually close it if they wish.
  };

  // Define navigation before it's used in getInitialOpenTabs
  const navigation = [
    { id: 'dashboard', title: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/admin' },
    { id: 'projects', title: 'Projects', icon: <FolderGit2 className="w-5 h-5" />, path: '/admin/projects' },
    { id: 'sections', title: 'Sections', icon: <SplitSquareHorizontal className="w-5 h-5" />, path: '/admin/sections' },
    { id: 'skills', title: 'Skills', icon: <Palette className="w-5 h-5" />, path: '/admin/skills' },
    { id: 'about', title: 'About Me', icon: <User className="w-5 h-5" />, path: '/admin/about' },
    { id: 'settings', title: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/admin/settings' },
  ];

  // Initialize openTabs: always have a tab for the current page's main content
  const getInitialOpenTabs = () => {
    const tabs: Tab[] = [];
    if (pathname.startsWith('/admin/projects')) {
      tabs.push({
        id: 'projects', 
        title: 'Projects',
        icon: <FolderGit2 className="w-4 h-4" />,
        content: children // Page content for /admin/projects
      });
    } else if (pathname.startsWith('/admin/dashboard')) {
      tabs.push({
        id: 'dashboard',
        title: 'Dashboard',
        icon: <LayoutDashboard className="w-4 h-4" />,
        content: children // Page content for /admin/dashboard
      });
    } else if (pathname.startsWith('/admin/skills')) {
       tabs.push({
        id: 'skills',
        title: 'Skills',
        icon: <Palette className="w-4 h-4" />,
        content: children 
      });
    }
    // Add other initial tabs based on path if needed, or handle them via handleTabClick
    // Ensure the activeTab corresponds to an open tab
    if (!tabs.find(t => t.id === activeTab) && tabs.length > 0) {
      setActiveTab(tabs[0].id);
    } else if (tabs.length === 0 && navigation.length > 0) {
      // If no specific tab matches path, open a default one (e.g. dashboard or projects)
      // This case should ideally not be hit if matcher in middleware is /admin/:path*
      // and we have corresponding pages.
      // For now, if 'projects' is the activeTab, ensure it's in openTabs.
      if (activeTab === 'projects' && !tabs.find(t => t.id === 'projects')) {
         tabs.push({
            id: 'projects', 
            title: 'Projects',
            icon: <FolderGit2 className="w-4 h-4" />,
            content: children 
          });
      }
    }
    return tabs;
  };

  const [openTabs, setOpenTabs] = useState<Tab[]>(getInitialOpenTabs());

  useEffect(() => {
    // Adjust open tabs and active tab when path changes
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
                        content: children // Assume children is the content for this newly navigated-to page
                    });
                }
                return newTabs;
             });
        }
    }
    setActiveTab(currentPathTabId);
  }, [pathname, children, navigation]); // Add navigation to dependency array if it's used inside useEffect indirectly or directly

  // navigation is now defined above

  const handleTabClick = (tabId: string) => {
    // If tab already open, just set it active
    if (openTabs.find(tab => tab.id === tabId)) {
      setActiveTab(tabId);
      // Potentially navigate if tab click should also change URL
      // const navItem = navigation.find(n => n.id === tabId);
      // if (navItem && navItem.path && pathname !== navItem.path) router.push(navItem.path);
      return;
    }

    // If tab not open, find its definition and add it
    const newTabDef = navigation.find(nav => nav.id === tabId);
    if (newTabDef) {
      // For a tab opened via direct click, its content should be `children` if it matches the current page,
      // otherwise it's a generic placeholder or specific component.
      // This logic assumes that clicking a nav item that corresponds to the current page's
      // main content section should show those children.
      let contentForNewTab = children; // Default to children for the primary tab of a page
      if (pathname !== newTabDef.path) { // If we are opening a tab for a *different* section
        contentForNewTab = <div>{newTabDef.title} Content Area (placeholder)</div>;
      }
      
      setOpenTabs([...openTabs, {
        id: newTabDef.id,
        title: newTabDef.title,
        icon: newTabDef.icon, 
        content: contentForNewTab
      }]);
      setActiveTab(tabId);
      // if (newTabDef.path && pathname !== newTabDef.path) router.push(newTabDef.path);
    }
  };

  const closeTab = (tabId: string) => {
    // Prevent closing the tab that displays the main page content if it's the only one matching the page
    if (tabId === activeTab && (pathname.startsWith(`/admin/${tabId}`) || (tabId === 'dashboard' && pathname === '/admin'))) {
        if (openTabs.length === 1) return; // Don't close the last tab if it's the page content
    }

    const remainingTabs = openTabs.filter(tab => tab.id !== tabId);
    setOpenTabs(remainingTabs);

    if (activeTab === tabId) {
      if (remainingTabs.length > 0) {
        setActiveTab(remainingTabs[0].id);
        // const newActiveNav = navigation.find(n => n.id === remainingTabs[0].id);
        // if (newActiveNav?.path) router.push(newActiveNav.path);
      } else {
        // Fallback if all tabs are closed - this state should ideally be avoided
        // by not allowing the last "page content" tab to be closed.
        // router.push('/admin'); // Go to dashboard
        setActiveTab('dashboard'); // Or whatever default
      }
    }
  };

  const copilotContext: LLMContext = {
    currentTab: activeTab,
    selectedProject,
  };
  
  // Determine current tab content
  let activeContent = <div>Loading content...</div>; // Default placeholder
  const currentActiveTabObject = openTabs.find(tab => tab.id === activeTab);

  if (currentActiveTabObject) {
    // If the active tab's ID matches the current page's primary section, render children.
    // Example: if URL is /admin/projects, and activeTab is 'projects', render children.
    const currentPathMainSection = pathname.split('/admin/')[1]?.split('/')[0] || 'dashboard';
    if (activeTab === currentPathMainSection) {
      activeContent = children;
    } else {
      activeContent = currentActiveTabObject.content;
    }
  } else if (openTabs.length === 0 && navigation.find(n => n.id === activeTab)) {
    // If no tabs are technically "open" but an activeTab is set (e.g. from URL)
    // and it matches a navigation item, render children.
     const currentPathMainSection = pathname.split('/admin/')[1]?.split('/')[0] || 'dashboard';
     if(activeTab === currentPathMainSection) {
        activeContent = children;
     }
  }


  const adminContextValue = useMemo(() => ({
    selectedProject,
    setSelectedProject: handleSetSelectedProject
  }), [selectedProject]); // handleSetSelectedProject is stable

  return (
    <AdminContext.Provider value={adminContextValue}>
      {/* Removed one redundant wrapping div here */}
      <div className="flex h-screen bg-background">
        {/* Column 1: Icon Sidebar */}
        <div className="w-16 border-r bg-muted/40">
          <ScrollArea className="h-full py-4">
            <div className="flex flex-col items-center gap-4">
            {navigation.map((item) => (
              <Link key={item.id} href={item.path} passHref>
                <Button
                  variant={activeTab === item.id ? "secondary" : "ghost"}
                  size="icon"
                  className="w-10 h-10"
                  aria-label={item.title} // Added for accessibility
                  // onClick is removed; Link handles navigation, useEffect handles tab state
                >
                  {item.icon}
                </Button>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Column 2: List Sidebar (Dynamic Content) */}
      <div className="w-72 border-r bg-muted/50 p-4 hidden md:flex md:flex-col space-y-4 overflow-y-auto"> {/* Increased width, flex-col */}
        {activeTab === 'projects' && (
          <>
            <div>
              <h2 className="text-lg font-semibold mb-2">Project Tools</h2>
            </div>
            <div className="flex-grow overflow-hidden"> {/* Allow ProjectList to scroll if content overflows */}
              <h2 className="text-lg font-semibold my-2">Project List</h2>
              <ScrollArea className="h-full"> {/* Ensure ScrollArea takes available height */}
                <ProjectList onEditProject={(project) => handleSetSelectedProject(project as DomainProject)} viewMode="simple" />
              </ScrollArea>
            </div>
          </>
        )}
        {activeTab !== 'projects' && (
          <>
            <h2 className="text-lg font-semibold mb-4">Context List</h2>
            <p className="text-sm text-gray-500">Content for {activeTab} list...</p>
          </>
        )}
      </div>

      {/* Column 3: Main Content Area (for page children, which will show editor) */}
      <div className="flex-1 flex flex-col overflow-hidden"> {/* Added overflow-hidden */}
        {/* Tabs */}
        <div className="border-b">
          <div className="flex items-center px-4 h-10 overflow-x-auto"> {/* Added overflow-x-auto for tabs */}
            {openTabs.map((tab) => {
              const navItem = navigation.find(n => n.id === tab.id);
              const iconToDisplay = navItem ? navItem.icon : <FolderGit2 className="w-4 h-4" />;

              return (
                <div
                  key={tab.id}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 text-sm border-r whitespace-nowrap", // Added whitespace-nowrap
                    activeTab === tab.id ? "bg-muted" : "hover:bg-muted/50"
                  )}
                >
                  <button
                    className="flex items-center gap-2"
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <>
                      {iconToDisplay ? iconToDisplay : <></>}
                      {iconToDisplay && <span style={{ marginLeft: '0.25rem' }}>{tab.title}</span>}
                      {!iconToDisplay && <span>{tab.title}</span>}
                    </>
                  </button>
                  {(openTabs.length > 1 || !((pathname.startsWith(`/admin/${tab.id}`) || (tab.id === 'dashboard' && pathname === '/admin')))) && (
                    <button
                      className="p-1 hover:bg-muted rounded-sm"
                      onClick={() => closeTab(tab.id)}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tab Content Area (Page Children) */}
        <div className="flex-1 overflow-auto p-6">
          {activeContent}
        </div>
      </div>

      {/* Column 4: Right Sidebar (Copilot) */}
      {isRightSidebarOpen && (
        <div className="w-80 border-l bg-muted/40 flex flex-col">
          {/* Copilot is now always shown if sidebar is open, ProjectEditor is in main content */}
          <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span className="font-medium">Copilot</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsRightSidebarOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <CopilotChat context={copilotContext} />
            {/* Extraneous tags removed below */}
        </div>
      )}
      </div>
    </AdminContext.Provider>
  );
}
