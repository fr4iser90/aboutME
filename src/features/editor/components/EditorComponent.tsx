'use client'

import { useState, useEffect, useRef } from 'react'
import { MarkdownParser, renderMarkdownElement, type ParsedMarkdown, type MarkdownSection } from '@/features/shared/services/markdownParser'
import { BaseModal } from '@/features/shared'
import Editor from '@monaco-editor/react'
import { type ValidationResult } from '../services/jsonValidator'
import ValidationModal from './ValidationModal'
import FrontmatterEditor from './FrontmatterEditor'
import NewFileModal from './NewFileModal'
import AboutEditor from './AboutEditor'
import { type AboutData } from '../types/about'
import { parseFrontmatter as parseFrontmatterUtil } from '@/features/portfolio/utils/frontmatterParser'
import ProjectContent from '@/features/portfolio/components/ProjectContent'
import DetailLayoutRenderer from '@/features/portfolio/components/layouts/DetailLayoutRenderer'
import BlockEditor from './BlockEditor'
import { frontmatterToBlocks } from '@/features/portfolio/utils/frontmatterToBlocks'
import { reorderSectionsInMarkdown } from '../utils/sidebarSectionsReorder'
import { moveBlockBetweenSlots } from '../utils/blockMoveHandler'
import type { DetailPageLayoutConfig, DetailLayoutConfig } from '@/features/portfolio/types/layouts'
import EditorTabs from './EditorTabs'
import dynamic from 'next/dynamic'
import SectionRenderer from '@/features/portfolio/components/sections/SectionRenderer'
import { getAllSectionLayouts } from '@/features/shared/utils/layoutConfig'
import type { SectionLayoutsConfig } from '@/features/shared/utils/layoutConfig'

// Lazy load AppearanceEditor
const AppearanceEditor = dynamic(
  () => import('@/features/admin/components/AppearanceEditor/AppearanceEditor'),
  { 
    ssr: false,
    loading: () => (
      <div className="editor-component__loading">
        <p>Loading appearance editor...</p>
      </div>
    )
  }
)

interface FileItem {
  name: string
  path: string
  type: 'file' | 'folder'
  content?: string
  category?: string
  filename?: string
}

interface UserData {
  username: string
  name: string
  bio: string
  avatar: string
}

interface Project {
  id: number
  name: string
  description: string
  html_url: string
}

export default function EditorComponent() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [content, setContent] = useState('')
  const [previewMode, setPreviewMode] = useState<'html' | 'portfolio'>('portfolio')
  const [viewMode, setViewMode] = useState<'editor-only' | 'inline-preview' | 'modal-preview' | 'split-view'>('editor-only')
  const [activeEditorTab, setActiveEditorTab] = useState<'content' | 'appearance' | 'preview'>('content')
  const [splitView, setSplitView] = useState(false)
  const [splitPosition, setSplitPosition] = useState(50) // 50% = 50/50, 60% = 60/40, etc.
  const [isResizing, setIsResizing] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [isFormattingGuideOpen, setIsFormattingGuideOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Preview Data
  const [userData, setUserData] = useState<UserData | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  
  // Markdown parsing
  const [parsedMarkdown, setParsedMarkdown] = useState<ParsedMarkdown | null>(null)
  const [activeSection, setActiveSection] = useState<string>('')
  const contentRef = useRef<HTMLDivElement>(null)
  
  // Monaco Editor instance
  const editorRef = useRef<any>(null)
  const hoverProviderRef = useRef<any>(null)
  const decorationRef = useRef<any[]>([])
  
  // Markdown syntax patterns for hover tooltips
  const markdownPatterns = {
    header: /^(#{1,6})\s+(.+)$/,
    bold: /\*\*(.+?)\*\*/,
    italic: /\*(.+?)\*/,
    code: /`(.+?)`/,
    link: /\[([^\]]+)\]\(([^)]+)\)/,
    listItem: /^(\s*)([-*+]|\d+\.)\s+(.+)$/,
    codeBlock: /^```(\w+)?$/,
    blockquote: /^>\s+(.+)$/
  }
  
  // Collapsible categories
  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({
    about: true,
    blog: true,
    projects: true
  })

  // Validation states
  const [validationResults, setValidationResults] = useState<Map<string, ValidationResult>>(new Map())
  const [isValidating, setIsValidating] = useState(false)

  // Modal states
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false)
  
  // Project filter state
  const [projectFilter, setProjectFilter] = useState<'all' | 'active' | 'hidden' | 'draft' | 'featured'>('all')
  
  // Project metadata state for filtering
  const [projectMetadata, setProjectMetadata] = useState<Map<string, any>>(new Map())
  
  // Show inactive (old) projects
  const [showInactiveProjects, setShowInactiveProjects] = useState(false)
  
  // Selected repos from config (to determine which projects are active)
  const [selectedRepos, setSelectedRepos] = useState<string[]>([])
  
  // Auto-save state
  const [autoSave, setAutoSave] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  
  // Frontmatter state
  const [frontmatter, setFrontmatter] = useState<any>(null)
  
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false)
  
  // Layout config state (for block moves)
  const [layoutConfig, setLayoutConfig] = useState<DetailPageLayoutConfig | DetailLayoutConfig | null>(null)
  
  // Layout selection state (for preview)
  const [selectedLayout, setSelectedLayout] = useState<string>('sidebar-left')
  
  // New File Modal state
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false)

  // About Editor state
  const [aboutData, setAboutData] = useState<AboutData | null>(null)
  
  // Section layouts for preview
  const [sectionLayouts, setSectionLayouts] = useState<SectionLayoutsConfig>({})

  useEffect(() => {
    loadFiles()
    loadPreviewData()
    loadSelectedRepos()
    loadSectionLayouts()
    // Load saved split position
    const savedPosition = localStorage.getItem('editor-split-position')
    if (savedPosition) {
      setSplitPosition(parseFloat(savedPosition))
    }
  }, [])
  
  // Handle split resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      
      const container = document.querySelector('.editor-component__split-view-layout') as HTMLElement
      if (!container) return
      
      const containerRect = container.getBoundingClientRect()
      const newPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100
      
      // Limit between 20% and 80%
      const clampedPosition = Math.max(20, Math.min(80, newPosition))
      setSplitPosition(clampedPosition)
    }
    
    const handleMouseUp = () => {
      setIsResizing(false)
      // Save position to localStorage
      localStorage.setItem('editor-split-position', splitPosition.toString())
    }
    
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, splitPosition])
  
  const loadSelectedRepos = async () => {
    try {
      const response = await fetch('/api/setup/config')
      if (response.ok) {
        const data = await response.json()
        const repos = data.config?.githubFilter?.selectedRepos || []
        setSelectedRepos(repos)
      }
    } catch (error) {
      console.warn('Could not load selected repos:', error)
    }
  }
  
  const loadSectionLayouts = async () => {
    try {
      const layouts = await getAllSectionLayouts()
      setSectionLayouts(layouts)
    } catch (error) {
      console.error('Error loading section layouts:', error)
    }
  }

  // Load project metadata when files change
  useEffect(() => {
    if (files.length > 0) {
      loadProjectMetadata()
    }
  }, [files])

  // Auto-save für Content (alle 30 Sekunden)
  useEffect(() => {
    if (autoSave && content && selectedFile) {
      const timer = setTimeout(() => {
        console.log('🔄 Auto-saving content...')
        handleSave()
      }, 30000) // 30 Sekunden
      
      return () => clearTimeout(timer)
    }
  }, [content, autoSave, selectedFile])

  // Update highlighting when content changes
  useEffect(() => {
    if (editorRef.current && content) {
      // Monaco ist global verfügbar nach dem Mount
      const monaco = (window as any).monaco
      if (monaco) {
        highlightTemplateText(editorRef.current, monaco)
      }
    }
  }, [content])

  // Validation functions - now using JSON validation API
  const validateFile = async (filePath: string, content: string) => {
    try {
      // Use JSON validation API
      const response = await fetch('/api/editor/validate-json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: typeof content === 'string' ? JSON.parse(content) : content,
          schemaPath: filePath
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        setValidationResults(prev => new Map(prev.set(filePath, result)))
      }
    } catch (error) {
      console.error('Validation error:', error)
    }
  }

  const validateAllFiles = async () => {
    setIsValidating(true)
    try {
      // Use validate-files API
      const response = await fetch('/api/setup/validate-files')
      if (response.ok) {
        const data = await response.json()
        const results = new Map<string, ValidationResult>()
        
        if (data.results) {
          Object.entries(data.results).forEach(([filePath, result]: [string, any]) => {
            results.set(filePath, result as ValidationResult)
          })
        }
        
        setValidationResults(results)
      }
    } catch (error) {
      console.error('Validation error:', error)
    } finally {
      setIsValidating(false)
    }
  }

  const getValidationIcon = (file: FileItem) => {
    // Erstelle die richtige URL für die Validierung
    let filePath;
    if (file.category === 'about') {
      filePath = `/data/about/${file.filename}`;
    } else if (file.category === 'blog') {
      filePath = `/data/blog/posts/${file.filename}`;
    } else if (file.category === 'projects') {
      filePath = `/data/projects/${file.filename}`;
    } else {
      filePath = `/data/${file.category}/${file.filename}`;
    }
    
    const result = validationResults.get(filePath)
    if (!result) return '⏳' // Loading/Unknown
    
    return result.isValid ? '✅' : '❌'
  }

  // Frontmatter management functions
  const parseFrontmatter = (content: string) => {
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
    if (!frontmatterMatch) return { frontmatter: null, content: content };
    
    const frontmatterText = frontmatterMatch[1];
    // Entferne Frontmatter und alle leeren Zeilen danach
    const markdownContent = content.replace(/^---\n[\s\S]*?\n---\n\s*/, '');
    
    // Parse YAML-like frontmatter (improved for complex objects)
    const frontmatter: any = {};
    let currentKey: string | null = null;
    let currentValue: any = null;
    let inObject = false;
    let indentLevel = 0;
    
    frontmatterText.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;
      
      // Check if line is indented (part of an object)
      const lineIndent = line.match(/^(\s*)/)?.[1].length || 0;
      
      if (lineIndent > 0 && currentKey) {
        // This is a nested property
        const [nestedKey, ...nestedValueParts] = trimmed.split(':');
        if (nestedKey && nestedValueParts.length > 0) {
          let nestedValue = nestedValueParts.join(':').trim();
          nestedValue = parseValue(nestedValue);
          
          if (!currentValue || typeof currentValue !== 'object') {
            currentValue = {};
          }
          currentValue[nestedKey.trim()] = nestedValue;
        }
      } else {
        // Save previous key-value pair
        if (currentKey && currentValue !== null) {
          frontmatter[currentKey] = currentValue;
        }
        
        // Parse new key-value pair
        const [key, ...valueParts] = trimmed.split(':');
        if (key && valueParts.length > 0) {
          currentKey = key.trim();
          let value = valueParts.join(':').trim();
          currentValue = parseValue(value);
          
          // Check if this starts an object (next line might be indented)
          inObject = false;
        } else if (trimmed.startsWith('-') || trimmed.match(/^\d+\./)) {
          // Array item - handle if needed
        }
      }
    });
    
    // Save last key-value pair
    if (currentKey && currentValue !== null) {
      frontmatter[currentKey] = currentValue;
    }
    
    return { frontmatter, content: markdownContent };
  };
  
  const parseValue = (value: string): any => {
    // Remove quotes
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1);
    }
    
    // Parse boolean
    if (value === 'true') return true;
    if (value === 'false') return false;
    
    // Parse number
    if (!isNaN(Number(value)) && value.trim() !== '') {
      return Number(value);
    }
    
    // Parse array
    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        return JSON.parse(value);
      } catch {
        // Fallback: simple split
        return value.slice(1, -1).split(',').map(v => parseValue(v.trim()));
      }
    }
    
    // Return as string
    return value;
  };

  const serializeValue = (value: any): string => {
    if (value === null || value === undefined) return 'null'
    if (typeof value === 'boolean') return value.toString()
    if (typeof value === 'number') return value.toString()
    if (Array.isArray(value)) {
      if (value.length === 0) return '[]'
      return `[${value.map(v => typeof v === 'string' ? `"${v}"` : v).join(', ')}]`
    }
    if (typeof value === 'object') {
      // Serialize objects as YAML-like structure
      const entries = Object.entries(value)
        .filter(([_, v]) => v !== null && v !== undefined)
        .map(([k, v]) => `  ${k}: ${serializeValue(v)}`)
      return entries.length > 0 ? `\n${entries.join('\n')}` : '{}'
    }
    // String - escape quotes
    return `"${String(value).replace(/"/g, '\\"')}"`
  }

  const updateFrontmatter = (content: string, updates: any) => {
    const { frontmatter, content: markdownContent } = parseFrontmatter(content);
    
    // Merge updates with existing frontmatter
    const mergedFrontmatter = frontmatter ? { ...frontmatter, ...updates } : { ...updates };
    
    // Always update the updated date
    mergedFrontmatter.updated = new Date().toISOString().split('T')[0];
    
    // If no frontmatter existed, add created date
    if (!frontmatter && !mergedFrontmatter.created) {
      mergedFrontmatter.created = new Date().toISOString().split('T')[0];
    }
    
    // Serialize frontmatter to YAML-like format
    const frontmatterLines: string[] = []
    Object.entries(mergedFrontmatter).forEach(([key, value]) => {
      if (value === null || value === undefined) return
      
      if (typeof value === 'object' && !Array.isArray(value)) {
        // Complex object (like layout)
        const serialized = serializeValue(value)
        if (serialized.startsWith('\n')) {
          // Multi-line object
          frontmatterLines.push(`${key}:${serialized}`)
        } else {
          frontmatterLines.push(`${key}: ${serialized}`)
        }
      } else {
        // Simple value
        frontmatterLines.push(`${key}: ${serializeValue(value)}`)
      }
    })
    
    const frontmatterText = frontmatterLines.join('\n')
    const cleanMarkdownContent = markdownContent.replace(/^\s+/, '');
    return `---\n${frontmatterText}\n---\n\n${cleanMarkdownContent}`;
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedFile) return;
    
    const updatedContent = updateFrontmatter(content, { status: newStatus });
    setContent(updatedContent);
    
    // Save the file
    await handleSave();
    
    console.log(`📝 Status changed to: ${newStatus}`);
  };

  const handleFeaturedToggle = async () => {
    if (!selectedFile) return;
    
    const { frontmatter } = parseFrontmatter(content);
    const currentFeatured = frontmatter?.featured === 'true' || frontmatter?.featured === true;
    const newFeatured = !currentFeatured;
    
    const updatedContent = updateFrontmatter(content, { featured: newFeatured });
    setContent(updatedContent);
    
    // Save the file with the UPDATED content directly
    await handleSaveWithContent(updatedContent);
    
    console.log(`⭐ Featured status: ${newFeatured}`);
  };

  // Handle sections reorder
  const handleSectionsReorder = async (newOrder: MarkdownSection[]) => {
    if (!selectedFile || !parsedMarkdown) return;
    
    // Reorder sections in markdown
    const { content: markdownContent } = parseFrontmatter(content);
    const reorderedMarkdown = reorderSectionsInMarkdown(markdownContent, newOrder);
    
    // Update content with reordered markdown
    const { frontmatter } = parseFrontmatter(content);
    const updatedContent = updateFrontmatter(reorderedMarkdown, frontmatter || {});
    setContent(updatedContent);
    
    // Update parsed markdown
    const parser = new MarkdownParser(updatedContent, frontmatter?.github, selectedFile?.category === 'projects' ? selectedFile.name.toLowerCase() : undefined);
    const newParsed = parser.parse();
    setParsedMarkdown(newParsed);
    
    // Auto-save if enabled
    if (autoSave) {
      await handleSaveWithContent(updatedContent);
    }
    
    console.log('📝 Sections reordered:', newOrder.map(s => s.title));
  };

  // Handle block move between slots
  const handleBlockMove = async (
    blockId: string,
    fromSlot: string,
    toSlot: string,
    newIndex: number
  ) => {
    if (!layoutConfig) return

    // Move block in config
    const newConfig = moveBlockBetweenSlots(layoutConfig, blockId, fromSlot, toSlot, newIndex)
    setLayoutConfig(newConfig)

    // Update frontmatter with new layout config
    const updatedFrontmatter = {
      ...frontmatter,
      pageLayout: newConfig.template,
      layout: {
        slots: newConfig.slots
      }
    }

    // Update content
    const updatedContent = updateFrontmatter(content, updatedFrontmatter)
    setContent(updatedContent)
    setFrontmatter(updatedFrontmatter)

    // Auto-save if enabled
    if (autoSave) {
      await handleSaveWithContent(updatedContent)
    }

    console.log(`📦 Block ${blockId} moved from ${fromSlot} to ${toSlot} at index ${newIndex}`)
  };

  // Check if a project file is inactive (not in selectedRepos)
  const isProjectInactive = (file: FileItem): boolean => {
    if (file.category !== 'projects') return false;
    if (selectedRepos.length === 0) return false; // If no selected repos, assume all are active
    
    // Extract project name from filename (e.g., "codebreaker.json" -> "codebreaker")
    const projectName = file.name.replace('.json', '').toLowerCase();
    const normalizedSelectedRepos = selectedRepos.map(name => name.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
    
    return !normalizedSelectedRepos.includes(projectName);
  };

  // Filter files based on project filter
  const getFilteredFiles = () => {
    let filtered = files;
    
    // Filter out inactive projects if not showing them
    if (!showInactiveProjects) {
      filtered = filtered.filter(file => !isProjectInactive(file));
    }
    
    if (projectFilter === 'all') return filtered;
    
    return filtered.filter(file => {
      if (file.category !== 'projects') return true; // Keep non-project files
      
      // For project files, check their frontmatter
      const filePath = `/data/projects/${file.filename}`;
      const result = validationResults.get(filePath);
      
      if (!result) return true; // If no validation result, keep file
      
      // Parse frontmatter from the file content (we need to fetch it)
      // For now, we'll use a simple approach and check if the file exists
      return true; // We'll implement proper filtering after we have the content
    });
  };

  // Line highlighting functions
  const highlightTemplateText = (editor: any, monaco: any) => {
    if (!editor || !content) return

    const decorations: any[] = []
    const lines = content.split('\n')

    // Template-Texte die markiert werden sollen
    const templateTexts = [
      'Brief description of what this project does.',
      'Your motivation and the problem you wanted to solve.',
      'Instructions on how to use the project.',
      'Current development status.',
      'The story of how you built this project.',
      'Future feature 1',
      'Future feature 2',
      'Brief introduction about yourself.',
      'Skill 1',
      'Skill 2', 
      'Skill 3',
      'Your story...',
      'What you\'re working on now...',
      'Your blog post content goes here...',
      'Content...',
      'More content...',
      'Blog Post Title',
      'Brief description of the post',
      'tag1',
      'tag2',
      'Your Name',
      // Neue Template-Texte
      '[MANUAL INPUT NEEDED',
      '[MANUAL INPUT NEEDED -',
      'MANUAL INPUT NEEDED',
      '[FILL IN]',
      'FILL IN'
    ]

    // Finde alle Zeilen mit Template-Texten
    lines.forEach((line, lineIndex) => {
      templateTexts.forEach(templateText => {
        if (line.includes(templateText)) {
          const startColumn = line.indexOf(templateText) + 1
          const endColumn = startColumn + templateText.length
          
          decorations.push({
            range: new monaco.Range(lineIndex + 1, startColumn, lineIndex + 1, endColumn),
            options: {
              className: 'template-text-highlight',
              hoverMessage: { 
                value: `Template text: "${templateText}"\n\nPlease replace with your actual content.` 
              },
              minimap: {
                color: '#ff6b6b',
                position: 1
              }
            }
          })
        }
      })
    })

    // Finde alle Zeilen mit Template-Pattern (für dynamische Texte)
    const templatePatterns = [
      /\[MANUAL INPUT NEEDED[^\]]*\]/g,
      /\[FILL IN\]/g,
      /MANUAL INPUT NEEDED/g
    ]

    lines.forEach((line, lineIndex) => {
      templatePatterns.forEach(pattern => {
        const matches = line.match(pattern)
        if (matches) {
          matches.forEach(match => {
            const startColumn = line.indexOf(match) + 1
            const endColumn = startColumn + match.length
            
            decorations.push({
              range: new monaco.Range(lineIndex + 1, startColumn, lineIndex + 1, endColumn),
              options: {
                className: 'template-text-highlight',
                hoverMessage: { 
                  value: `Template pattern: "${match}"\n\nPlease replace with your actual content.` 
                },
                minimap: {
                  color: '#ff6b6b',
                  position: 1
                }
              }
            })
          })
        }
      })
    })

    // Entferne alte Decorations und füge neue hinzu
    if (decorationRef.current) {
      editor.deltaDecorations(decorationRef.current, decorations)
    } else {
      decorationRef.current = editor.deltaDecorations([], decorations)
    }
  }

  const clearHighlights = (editor: any) => {
    if (editor && decorationRef.current) {
      editor.deltaDecorations(decorationRef.current, [])
      decorationRef.current = []
    }
  }

  // Build functions
  const handleBuild = async () => {
    // Validiere alle Dateien
    await validateAllFiles()
    
    // Prüfe ob Probleme gefunden wurden
    const hasIssues = Array.from(validationResults.values()).some(result => !result.isValid)
    
    if (hasIssues) {
      // Zeige Validation Modal
      setIsValidationModalOpen(true)
    } else {
      // Direkt builden
      await performBuild()
    }
  }

  const performBuild = async () => {
    try {
      console.log('🚀 Starting validation process...')
      
      // JSON-only: Just validate all files, no conversion needed
      await validateAllFiles()
      
      // Check validation results
      const validationArray = Array.from(validationResults.values())
      const validCount = validationArray.filter(r => r.isValid).length
      const invalidCount = validationArray.filter(r => !r.isValid).length
      
      if (invalidCount > 0) {
        alert(`Validation completed with errors:\n\n✅ Valid: ${validCount}\n❌ Invalid: ${invalidCount}\n\nPlease fix the errors before publishing.`)
      } else {
        alert(`✅ All files validated successfully!\n\nValid files: ${validCount}\n\nYou can now publish your portfolio.`)
      }
      
      console.log('✅ Validation completed')
    } catch (error) {
      console.error('Validation failed:', error)
      alert(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleRemoveEmptySections = async () => {
    try {
      console.log('🗑️ Removing empty sections...')
      
      let processedFiles = 0
      let removedSections = 0
      
      // Für jede Datei mit Problemen
      for (const [filePath, result] of Array.from(validationResults.entries())) {
        if (!result.isValid && result.errors.length > 0) {
          try {
            // Lade aktuellen Inhalt
            const response = await fetch(`/api/editor/json-file?path=${encodeURIComponent(filePath)}`)
            if (response.ok) {
              const data = await response.json()
              const content = data.content
              
              // Versuche JSON zu parsen und zu bereinigen
              try {
                const jsonData = typeof content === 'string' ? JSON.parse(content) : content
                
                // Entferne Felder mit undefined/null values (optional)
                const cleaned = JSON.parse(JSON.stringify(jsonData, (key, value) => {
                  return value === undefined ? null : value
                }))
                
                // Speichere bereinigten Inhalt
                await fetch('/api/editor/json-file', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    path: filePath,
                    content: cleaned
                  })
                })
                
                processedFiles++
                removedSections += result.errors.length
                console.log(`✅ Fixed ${result.errors.length} errors in ${filePath.split('/').pop()}`)
              } catch (parseError) {
                console.error(`Error parsing JSON for ${filePath}:`, parseError)
              }
            }
          } catch (error) {
            console.error(`Error processing ${filePath}:`, error)
          }
        }
      }
      
      // Validiere erneut
      await validateAllFiles()
      
      console.log(`✅ Cleanup completed: ${processedFiles} files processed, ${removedSections} errors fixed`)
      
      // Zeige Erfolgsmeldung
      if (removedSections > 0) {
        alert(`✅ Cleanup completed!\n\nProcessed: ${processedFiles} files\nRemoved: ${removedSections} empty sections`)
      } else {
        alert('✅ Cleanup completed!\n\nNo empty sections found to remove.')
      }
      
    } catch (error) {
      console.error('Error removing empty sections:', error)
      alert('❌ Error during cleanup. Please try again.')
    }
  }

  // Cleanup hover provider on unmount
  useEffect(() => {
    return () => {
      if (hoverProviderRef.current) {
        hoverProviderRef.current.dispose()
        hoverProviderRef.current = null
      }
    }
  }, [])

  // Monaco Editor handlers
  const handleEditorMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    
    // Highlight template text immediately
    highlightTemplateText(editor, monaco)
    
    // Only register hover provider once
    if (!hoverProviderRef.current) {
      // Register custom hover provider for markdown syntax
      hoverProviderRef.current = monaco.languages.registerHoverProvider('markdown', {
        provideHover: (model: any, position: any) => {
          const word = model.getWordAtPosition(position)
          const lineContent = model.getLineContent(position.lineNumber)
          
          if (!word) return null

          const wordText = word.word
          const lineText = lineContent.trim()
          
          // Detect markdown syntax and show appropriate tooltip
          let tooltipContent = ''

          // Check for headers
          if (lineText.match(markdownPatterns.header)) {
            const match = lineText.match(markdownPatterns.header)
            if (match) {
              const level = match[1].length
              tooltipContent = `**Header Level ${level}**\n\nCreates an H${level} heading element.\n\nExample: ${match[0]}`
            }
          }
          // Check for bold text
          else if (wordText.includes('**') && lineText.includes('**')) {
            const boldMatch = lineText.match(markdownPatterns.bold)
            if (boldMatch) {
              tooltipContent = `**Bold Text**\n\nRenders text in bold.\n\nExample: ${boldMatch[0]} → **${boldMatch[1]}**`
            }
          }
          // Check for italic text
          else if (wordText.includes('*') && lineText.includes('*') && !lineText.includes('**')) {
            const italicMatch = lineText.match(markdownPatterns.italic)
            if (italicMatch) {
              tooltipContent = `**Italic Text**\n\nRenders text in italics.\n\nExample: ${italicMatch[0]} → *${italicMatch[1]}*`
            }
          }
          // Check for inline code
          else if (wordText.includes('`') && lineText.includes('`')) {
            const codeMatch = lineText.match(markdownPatterns.code)
            if (codeMatch) {
              tooltipContent = `**Inline Code**\n\nRenders text as inline code.\n\nExample: ${codeMatch[0]} → \`${codeMatch[1]}\``
            }
          }
          // Check for links
          else if (wordText.includes('[') || wordText.includes(']') || wordText.includes('(') || wordText.includes(')')) {
            const linkMatch = lineText.match(markdownPatterns.link)
            if (linkMatch) {
              tooltipContent = `**Link**\n\nCreates a clickable link.\n\nExample: ${linkMatch[0]} → [${linkMatch[1]}](${linkMatch[2]})`
            }
          }
          // Check for list items
          else if (lineText.match(markdownPatterns.listItem)) {
            const listMatch = lineText.match(markdownPatterns.listItem)
            if (listMatch) {
              const isNumbered = /\d+\./.test(listMatch[2])
              tooltipContent = `**${isNumbered ? 'Numbered' : 'Bullet'} List Item**\n\nCreates a ${isNumbered ? 'numbered' : 'bullet'} list item.\n\nExample: ${listMatch[0]}`
            }
          }
          // Check for code blocks
          else if (lineText.match(markdownPatterns.codeBlock)) {
            const codeBlockMatch = lineText.match(markdownPatterns.codeBlock)
            if (codeBlockMatch) {
              const language = codeBlockMatch[1] || 'plain text'
              tooltipContent = `**Code Block**\n\nCreates a code block with ${language} syntax highlighting.\n\nExample: ${codeBlockMatch[0]}`
            }
          }
          // Check for blockquotes
          else if (lineText.match(markdownPatterns.blockquote)) {
            const blockquoteMatch = lineText.match(markdownPatterns.blockquote)
            if (blockquoteMatch) {
              tooltipContent = `**Blockquote**\n\nCreates a blockquote element.\n\nExample: ${blockquoteMatch[0]}`
            }
          }

          // Return hover content if found
          if (tooltipContent) {
            return {
              contents: [
                { value: tooltipContent }
              ]
            }
          }

          return null
        }
      })
    }
  }

  // Initialize layout from frontmatter
  useEffect(() => {
    if (frontmatter?.pageLayout) {
      setSelectedLayout(frontmatter.pageLayout)
    } else {
      setSelectedLayout('sidebar-left')
    }
  }, [frontmatter])

  // Update parsed markdown when content changes
  useEffect(() => {
    if (content && selectedFile) {
      // Extract GitHub URL from frontmatter if available
      const githubUrl = frontmatter?.github || ''
      // Extract project name from filename for local asset resolution
      const projectName = selectedFile.category === 'projects' ? selectedFile.name.toLowerCase() : undefined
      const parser = new MarkdownParser(content, githubUrl, projectName)
      const parsed = parser.parse()
      setParsedMarkdown(parsed)
      
      // Update layout config
      const config = frontmatterToBlocks(
        { ...(frontmatter || {}), pageLayout: selectedLayout },
        parsed.sections
      )
      setLayoutConfig(config)
      
      // Set first section as active
      if (parsed.sections.length > 0) {
        setActiveSection(parsed.sections[0].id)
      }
    } else if (!content || !selectedFile) {
      // Reset if content is cleared or no file is selected
      setParsedMarkdown(null)
      setActiveSection('')
      setLayoutConfig(null)
    }
  }, [content, frontmatter, selectedFile, selectedLayout])

  // Update layout config when selectedLayout changes (separate effect to avoid infinite loop)
  useEffect(() => {
    if (parsedMarkdown && frontmatter) {
      const config = frontmatterToBlocks(
        { ...(frontmatter || {}), pageLayout: selectedLayout },
        parsedMarkdown.sections
      )
      setLayoutConfig(config)
    }
  }, [selectedLayout])

  // Spy navigation - track scroll position for both editor and modal
  useEffect(() => {
    if (!parsedMarkdown) return

    const handleScroll = (scrollContainer: HTMLElement) => {
      const sections = parsedMarkdown.sections
      const scrollTop = scrollContainer.scrollTop || 0
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        const element = document.getElementById(section.id)
        if (element) {
          const elementTop = element.offsetTop - 100 // Offset for better UX
          if (scrollTop >= elementTop) {
            setActiveSection(section.id)
            break
          }
        }
      }
    }

    // Add scroll listener to editor content
    const editorElement = contentRef.current
    if (editorElement) {
      const editorScrollHandler = () => handleScroll(editorElement)
      editorElement.addEventListener('scroll', editorScrollHandler)
      
      return () => editorElement.removeEventListener('scroll', editorScrollHandler)
    }
  }, [parsedMarkdown])

  // Spy navigation for modal content
  useEffect(() => {
    if (!parsedMarkdown || !isPreviewModalOpen) return

    const handleModalScroll = (scrollContainer: HTMLElement) => {
      const sections = parsedMarkdown.sections
      const scrollTop = scrollContainer.scrollTop || 0
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        const element = document.getElementById(section.id)
        if (element) {
          const elementTop = element.offsetTop - 100 // Offset for better UX
          if (scrollTop >= elementTop) {
            setActiveSection(section.id)
            break
          }
        }
      }
    }

    // Find modal content element
    const modalContent = document.querySelector('.about-content')
    if (modalContent) {
      const modalScrollHandler = () => handleModalScroll(modalContent as HTMLElement)
      modalContent.addEventListener('scroll', modalScrollHandler)
      
      return () => modalContent.removeEventListener('scroll', modalScrollHandler)
    }
  }, [parsedMarkdown, isPreviewModalOpen])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element && contentRef.current) {
      const offsetTop = element.offsetTop - 20
      contentRef.current.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      })
    }
  }

  const handleInlinePreviewClick = () => {
    setViewMode('inline-preview')
  }

  const handleModalPreviewClick = () => {
    setViewMode('modal-preview')
    setIsPreviewModalOpen(true)
  }

  const handleClosePreviewModal = () => {
    setIsPreviewModalOpen(false)
    setViewMode('editor-only') // Zurück zu Editor Only
  }

  const loadFiles = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/editor/json-files?source=all')
      if (response.ok) {
        const data = await response.json()
        // Filter out index files (projects.json, blog.json) - these are auto-managed
        const filteredFiles = (data.files || []).filter((file: FileItem) => 
          file.name !== 'projects.json' && file.name !== 'blog.json'
        )
        setFiles(filteredFiles)
        console.log('📁 Files loaded:', filteredFiles.length)
      } else {
        console.error('❌ Failed to load files:', response.status)
      }
    } catch (error) {
      console.error('❌ Error loading files:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPreviewData = async () => {
    try {
      // Load user data
      const userRes = await fetch('/data/user/user.json')
      if (userRes.ok) {
        const userData = await userRes.json()
        setUserData(userData)
        console.log('✅ User data loaded')
      }

      // Load projects data
      const projectsRes = await fetch('/data/projects/projects.json')
      if (projectsRes.ok) {
        const projectsData = await projectsRes.json()
        setProjects(projectsData)
        console.log('✅ Projects data loaded')
      }
    } catch (error) {
      console.error('❌ Error loading preview data:', error)
    }
  }

  const loadProjectMetadata = async () => {
    try {
      const projectFiles = files.filter(file => file.category === 'projects')
      const metadata = new Map()
      
      for (const file of projectFiles) {
        try {
          // Use the correct API path for loading project files
          const apiPath = `/api/editor/file/projects/${file.filename}`
          const response = await fetch(apiPath)
          if (response.ok) {
            const content = await response.text()
            const { frontmatter } = parseFrontmatter(content)
            metadata.set(file.path, frontmatter)
          }
        } catch (error) {
          console.error(`Error loading metadata for ${file.name}:`, error)
        }
      }
      
      setProjectMetadata(metadata)
      console.log('✅ Project metadata loaded:', metadata.size, 'projects')
    } catch (error) {
      console.error('❌ Error loading project metadata:', error)
    }
  }

  const handleFileSelect = async (file: FileItem) => {
    try {
      // Reset state first to prevent showing old content
      setContent('')
      setParsedMarkdown(null)
      setActiveSection('')
      setFrontmatter(null)
      setAboutData(null)
      setSelectedFile(file)
      
      // Check if this is about.json - use AboutEditor
      if (file.category === 'about' && file.name === 'about.json') {
        // Load JSON content
        const response = await fetch(`/api/editor/json-file?path=about/about.json&source=private`)
        if (response.ok) {
          const result = await response.json()
          // API returns { content: string } or { data: AboutData }, handle both
          let data: AboutData
          if (result.data) {
            data = result.data as AboutData
          } else if (result.content) {
            // Parse JSON string
            try {
              data = JSON.parse(result.content) as AboutData
            } catch (e) {
              console.error('Failed to parse about.json content:', e)
              setAboutData(null)
              return
            }
          } else {
            // Direct AboutData object
            data = result as AboutData
          }
          
          // Ensure sections array exists
          if (!data.sections) {
            data.sections = []
          }
          if (!data.header) {
            data.header = { title: 'About Me', subtitle: '' }
          }
          if (!data.socialLinks) {
            data.socialLinks = { github: null, twitter: null, linkedin: null, website: null, email: null }
          }
          
          setAboutData(data)
          console.log('📄 About.json loaded:', data)
        } else {
          console.error('❌ Failed to load about.json:', response.status)
          setAboutData(null)
        }
        return
      }
      
      // Load Markdown content using Editor File API
      let apiPath;
      if (file.category === 'about') {
        apiPath = `/api/editor/file/about/${file.filename}`;
      } else if (file.category === 'blog') {
        apiPath = `/api/editor/file/blog/posts/${file.filename}`;
      } else if (file.category === 'projects') {
        apiPath = `/api/editor/file/projects/${file.filename}`;
      } else {
        // Fallback for other categories
        apiPath = `/api/editor/file/${file.category}/${file.filename}`;
      }
      
      const response = await fetch(apiPath)
      if (response.ok) {
        const markdownContent = await response.text()
        setContent(markdownContent)
        
        // Parse frontmatter
        let parsedFrontmatter: any = null
        try {
          const result = parseFrontmatterUtil(markdownContent)
          parsedFrontmatter = result.frontmatter || null
          setFrontmatter(parsedFrontmatter)
        } catch (error) {
          console.warn('Could not parse frontmatter, using simple parser:', error)
          const { frontmatter: simpleFrontmatter } = parseFrontmatter(markdownContent)
          parsedFrontmatter = simpleFrontmatter || null
          setFrontmatter(parsedFrontmatter)
        }
        
        // Markdown parsing will be handled by useEffect when content/frontmatter/selectedFile change
        // This prevents race conditions and ensures state is properly synchronized
        
        // Highlight template text immediately after content is set
        setTimeout(() => {
          if (editorRef.current) {
            const monaco = (window as any).monaco
            if (monaco) {
              highlightTemplateText(editorRef.current, monaco)
            }
          }
        }, 100) // Small delay to ensure content is set
        
        console.log('📄 Markdown file loaded:', file.name, 'from', apiPath)
      } else {
        console.error('❌ Failed to load Markdown file:', response.status, apiPath)
        // Reset state on error
        setContent('')
        setParsedMarkdown(null)
        setActiveSection('')
        setFrontmatter(null)
      }
    } catch (error) {
      console.error('❌ Error loading file:', error)
      // Reset state on error
      setContent('')
      setParsedMarkdown(null)
      setActiveSection('')
      setFrontmatter(null)
      setAboutData(null)
    }
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  const getRelativePath = (file: FileItem): string => {
    if (file.category === 'about') {
      return `about/${file.filename}`;
    } else if (file.category === 'blog') {
      return `blog/posts/${file.filename}`;
    } else if (file.category === 'projects') {
      return `projects/${file.filename}`;
    }
    return `${file.category}/${file.filename}`;
  };

  const handleSaveWithContent = async (contentToSave: string) => {
    if (!selectedFile) return
    
    try {
      // Save Markdown content
      const response = await fetch('/api/editor/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: getRelativePath(selectedFile),
          content: contentToSave
        })
      })
      
      if (response.ok) {
        console.log('💾 Markdown file saved:', selectedFile.name)
        setLastSaved(new Date())
        
        // Validate file after save - use relative path for validation
        const validationPath = `/data/${getRelativePath(selectedFile)}`
        await validateFile(validationPath, contentToSave)
        
        // Update metadata for this file
        if (selectedFile.category === 'projects') {
          const { frontmatter } = parseFrontmatter(contentToSave)
          setProjectMetadata(prev => new Map(prev.set(selectedFile.path, frontmatter)))
        }
        
        // DON'T reload preview data - it overwrites the saved changes!
      } else {
        console.error('❌ Failed to save Markdown file:', response.status)
      }
    } catch (error) {
      console.error('❌ Error saving Markdown file:', error)
    }
  }

  const handleFrontmatterUpdate = (updates: any) => {
    setFrontmatter(updates)
    
    // Update content with new frontmatter
    const updatedContent = updateFrontmatter(content, updates)
    setContent(updatedContent)
  }

  const handleFrontmatterSave = async () => {
    // Frontmatter is already in content via handleFrontmatterUpdate
    await handleSave()
  }

  const handleCreateNewFile = async (filename: string, category: 'about' | 'blog' | 'projects', template: string) => {
    try {
      // Determine relative path
      let relativePath: string
      if (category === 'about') {
        relativePath = `about/${filename}`
      } else if (category === 'blog') {
        relativePath = `blog/posts/${filename}`
      } else {
        relativePath = `projects/${filename}`
      }

      // Save new file with template
      const response = await fetch('/api/editor/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: relativePath,
          content: template
        })
      })

      if (response.ok) {
        console.log('✅ New file created:', filename)
        
        // Reload files list
        await loadFiles()
        
        // Select the new file
        const newFile = files.find(f => f.filename === filename && f.category === category)
        if (newFile) {
          await handleFileSelect(newFile)
        } else {
          // If file not found yet, wait a bit and try again
          setTimeout(async () => {
            await loadFiles()
            const retryFile = files.find(f => f.filename === filename && f.category === category)
            if (retryFile) {
              await handleFileSelect(retryFile)
            }
          }, 500)
        }
      } else {
        console.error('❌ Failed to create new file:', response.status)
        alert('Failed to create new file')
      }
    } catch (error) {
      console.error('❌ Error creating new file:', error)
      alert('Error creating new file')
    }
  }

  const handleSave = async () => {
    if (!selectedFile) return
    
    // Check if this is about.json - use AboutEditor save
    if (selectedFile.category === 'about' && selectedFile.name === 'about.json' && aboutData) {
      try {
        const response = await fetch('/api/editor/json-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: 'about/about.json',
            source: 'private',
            content: JSON.stringify(aboutData, null, 2)
          })
        })
        
        if (response.ok) {
          console.log('💾 About.json saved')
          setLastSaved(new Date())
        } else {
          console.error('❌ Failed to save about.json:', response.status)
          alert('Failed to save about.json')
        }
      } catch (error) {
        console.error('❌ Error saving about.json:', error)
        alert('Error saving about.json')
      }
      return
    }
    
    // Auto-add frontmatter if missing (beim ersten Editieren)
    let contentToSave = content
    const { frontmatter: currentFrontmatter } = parseFrontmatter(content)
    
    // Save selected layout to frontmatter if it's a project
    if (selectedFile.category === 'projects' && selectedLayout) {
      const layoutUpdate = { pageLayout: selectedLayout }
      contentToSave = updateFrontmatter(contentToSave, layoutUpdate)
    }
    
    if (!currentFrontmatter && selectedFile.category === 'projects') {
      // Automatisch minimales Frontmatter hinzufügen
      const autoFrontmatter = {
        status: 'active',
        featured: false,
        created: new Date().toISOString().split('T')[0],
        updated: new Date().toISOString().split('T')[0],
        pageLayout: selectedLayout,
        ...(frontmatter || {})
      }
      contentToSave = updateFrontmatter(contentToSave, autoFrontmatter)
      setContent(contentToSave)
      setFrontmatter(autoFrontmatter)
    }
    
    try {
      // Save Markdown content
      const response = await fetch('/api/editor/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: getRelativePath(selectedFile),
          content: contentToSave
        })
      })
      
      if (response.ok) {
        console.log('💾 Markdown file saved:', selectedFile.name)
        setLastSaved(new Date())
        
        // Validate file after save - use relative path for validation
        const validationPath = `/data/${getRelativePath(selectedFile)}`
        await validateFile(validationPath, contentToSave)
        
        // Update metadata for this file
        if (selectedFile.category === 'projects') {
          const { frontmatter: savedFrontmatter } = parseFrontmatter(contentToSave)
          setProjectMetadata(prev => new Map(prev.set(selectedFile.path, savedFrontmatter)))
          setFrontmatter(savedFrontmatter)
        }
        
        // Reload preview data after save
        loadPreviewData()
      } else {
        console.error('❌ Failed to save Markdown file:', response.status)
      }
    } catch (error) {
      console.error('❌ Error saving Markdown file:', error)
    }
  }

  if (loading) {
    return (
      <div className="editor-component editor-component--loading">
        <div className="editor-component__loading">
          <div className="editor-component__loading-icon">🔄</div>
          <div className="editor-component__loading-text">Editor wird geladen...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`editor-component viewport-full ${(isPreviewModalOpen || isFormattingGuideOpen) ? 'editor-component--modal-open' : ''}`}>
      {/* Sidebar */}
      <div className="editor-component__sidebar">
        <div className="editor-component__sidebar-header">
          <h2 className="editor-component__sidebar-title">📁 JSON Files</h2>
          <button
            onClick={() => setIsNewFileModalOpen(true)}
            className="editor-component__new-file-btn"
            title="Create new file"
          >
            ➕ New File
          </button>
        </div>
        
        <div className="editor-component__sidebar-content">
          {files.length === 0 ? (
            <div className="editor-component__no-files">No JSON files found</div>
          ) : (
            <div className="editor-component__file-tree">
              {/* About Section */}
              {(() => {
                const aboutFiles = files.filter(file => file.category === 'about');
                if (aboutFiles.length === 0) return null;
                
                return (
                  <div className="editor-component__category">
                    <div 
                      className="editor-component__category-header"
                      onClick={() => toggleCategory('about')}
                    >
                      <span className="editor-component__category-icon">
                        {expandedCategories.about ? '📂' : '📁'}
                      </span>
                      <span className="editor-component__category-title">About</span>
                      <span className="editor-component__category-count">({aboutFiles.length})</span>
                    </div>
                    {expandedCategories.about && (
                      <div className="editor-component__category-files">
                        {aboutFiles.map((file) => (
                          <div
                            key={file.path}
                            onClick={() => handleFileSelect(file)}
                            className={`editor-component__file-item ${
                              selectedFile?.path === file.path ? 'editor-component__file-item--active' : ''
                            }`}
                          >
                            <span className="editor-component__file-icon">📄</span>
                            <span className="editor-component__file-name">{file.name}</span>
                            <span className="editor-component__file-status">{getValidationIcon(file)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Blog Section */}
              {(() => {
                const blogFiles = files.filter(file => file.category === 'blog');
                if (blogFiles.length === 0) return null;
                
                return (
                  <div className="editor-component__category">
                    <div 
                      className="editor-component__category-header"
                      onClick={() => toggleCategory('blog')}
                    >
                      <span className="editor-component__category-icon">
                        {expandedCategories.blog ? '📂' : '📁'}
                      </span>
                      <span className="editor-component__category-title">Blog Posts</span>
                      <span className="editor-component__category-count">({blogFiles.length})</span>
                    </div>
                    {expandedCategories.blog && (
                      <div className="editor-component__category-files">
                        {blogFiles.map((file) => (
                          <div
                            key={file.path}
                            onClick={() => handleFileSelect(file)}
                            className={`editor-component__file-item ${
                              selectedFile?.path === file.path ? 'editor-component__file-item--active' : ''
                            }`}
                          >
                            <span className="editor-component__file-icon">📝</span>
                            <span className="editor-component__file-name">{file.name}</span>
                            <span className="editor-component__file-status">{getValidationIcon(file)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Projects Section with Filter */}
              {(() => {
                const projectFiles = files.filter(file => file.category === 'projects');
                if (projectFiles.length === 0) return null;
                
                return (
                  <div className="editor-component__category">
                    <div 
                      className="editor-component__category-header"
                      onClick={() => toggleCategory('projects')}
                    >
                      <span className="editor-component__category-icon">
                        {expandedCategories.projects ? '📂' : '📁'}
                      </span>
                      <span className="editor-component__category-title">Project Details</span>
                      <span className="editor-component__category-count">({projectFiles.length})</span>
                    </div>
                    
                    {/* Project Filter - nur in Projects Section */}
                    {expandedCategories.projects && (
                      <div className="editor-component__project-filter">
                        <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', marginBottom: 'var(--space-xs)' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', fontSize: '0.875rem', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={showInactiveProjects}
                              onChange={(e) => setShowInactiveProjects(e.target.checked)}
                            />
                            <span>Show Inactive Projects</span>
                          </label>
                        </div>
                        <select 
                          value={projectFilter}
                          onChange={(e) => setProjectFilter(e.target.value as any)}
                          className="editor-component__filter-select"
                        >
                          <option value="all">📁 All Projects</option>
                          <option value="active">🟢 Active</option>
                          <option value="hidden">👁️ Hidden</option>
                          <option value="draft">📝 Draft</option>
                          <option value="featured">⭐ Featured</option>
                        </select>
                      </div>
                    )}
                    
                    {expandedCategories.projects && (
                      <div className="editor-component__category-files">
                        {(() => {
                          // Filter projects based on selected filter and inactive status
                          let filteredProjects = projectFiles;
                          
                          // Filter out inactive projects if not showing them
                          if (!showInactiveProjects) {
                            filteredProjects = filteredProjects.filter(file => !isProjectInactive(file));
                          }
                          
                          if (projectFilter !== 'all') {
                            filteredProjects = filteredProjects.filter(file => {
                              const metadata = projectMetadata.get(file.path);
                              if (!metadata) return true; // Show if no metadata loaded yet
                              
                              switch (projectFilter) {
                                case 'active':
                                  return metadata.status === 'active';
                                case 'hidden':
                                  return metadata.status === 'hidden';
                                case 'draft':
                                  return metadata.status === 'draft';
                                case 'featured':
                                  return metadata.featured === 'true' || metadata.featured === true;
                                default:
                                  return true;
                              }
                            });
                          }
                          
                          return filteredProjects.map((file) => {
                            // Get metadata for this file
                            const metadata = projectMetadata.get(file.path);
                            const isFeatured = metadata?.featured === 'true' || metadata?.featured === true;
                            const isInactive = isProjectInactive(file);
                            
                            return (
                              <div
                                key={file.path}
                                onClick={() => handleFileSelect(file)}
                                className={`editor-component__file-item ${
                                  selectedFile?.path === file.path ? 'editor-component__file-item--active' : ''
                                } ${isFeatured ? 'editor-component__file-item--featured' : ''} ${
                                  isInactive ? 'editor-component__file-item--inactive' : ''
                                }`}
                                title={isInactive ? 'This project is not in your selected repositories (inactive)' : ''}
                              >
                                <span className="editor-component__file-icon">
                                  {isFeatured ? '⭐' : isInactive ? '💤' : '📄'}
                                </span>
                                <span className="editor-component__file-name">{file.name}</span>
                                {isInactive && (
                                  <span className="editor-component__file-badge" style={{ 
                                    fontSize: '0.75rem', 
                                    color: 'var(--text-muted)',
                                    marginLeft: 'auto',
                                    padding: '2px 6px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: '4px'
                                  }}>
                                    Inactive
                                  </span>
                                )}
                                <span className="editor-component__file-status">{getValidationIcon(file)}</span>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="editor-component__main">
        {/* Header */}
        <div className="editor-component__header">
          <div className="editor-component__header-info">
            <h1 className="editor-component__title">Portfolio Editor</h1>
            {selectedFile && (
              <div className="editor-component__subtitle">Editing: {selectedFile.name}</div>
            )}
          </div>
          
          {/* View Mode Toggle - NUR Modal Preview Button (Split View ist jetzt in Tabs) */}
          <div className="editor-component__view-toggle">
            <button
              onClick={handleModalPreviewClick}
              className={`editor-component__view-btn ${
                viewMode === 'modal-preview' ? 'editor-component__view-btn--active' : ''
              }`}
            >
              🖼️ Modal Preview
            </button>
            
            {/* Layout Selector - NUR für Modal Preview, nur für Projects */}
            {selectedFile?.category === 'projects' && viewMode === 'modal-preview' && (
              <div className="editor-component__layout-selector editor-component__layout-selector--header">
                <label className="editor-component__layout-label">
                  Layout:
                  <select
                    value={selectedLayout}
                    onChange={(e) => setSelectedLayout(e.target.value)}
                    className="editor-component__layout-select"
                  >
                    <option value="sidebar-left">📋 Sidebar Left</option>
                    <option value="sidebar-right">📋 Sidebar Right</option>
                    <option value="full-width">📄 Full Width</option>
                    <option value="two-column">📊 Two Column</option>
                    <option value="centered">🎯 Centered</option>
                    <option value="masonry">🧱 Masonry</option>
                    <option value="split-screen">🖥️ Split Screen</option>
                    <option value="hero-content">🎬 Hero Content</option>
                    <option value="carousel-layout">🎠 Carousel</option>
                    <option value="sticky-sidebar">📌 Sticky Sidebar</option>
                  </select>
                </label>
              </div>
            )}
            
            {/* Edit Mode Toggle - Immer sichtbar wenn Sections vorhanden */}
            {parsedMarkdown && parsedMarkdown.sections.length > 0 && selectedFile?.category === 'projects' && (
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`editor-component__btn editor-component__btn--${isEditMode ? 'primary' : 'secondary'}`}
                style={{ marginLeft: 'var(--space-md)' }}
              >
                {isEditMode ? '✏️ Edit Mode: ON' : '✏️ Edit Sections'}
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <EditorTabs
          activeTab={activeEditorTab}
          onTabChange={(tab) => {
            setActiveEditorTab(tab)
            // Disable split view when switching away from content tab
            if (tab !== 'content') {
              setSplitView(false)
              setViewMode('editor-only')
            }
          }}
          splitView={splitView && activeEditorTab === 'content'}
          onSplitViewToggle={() => {
            if (activeEditorTab === 'content') {
              const newSplitView = !splitView
              setSplitView(newSplitView)
              setViewMode(newSplitView ? 'split-view' : 'editor-only')
            }
          }}
        />

        {/* Editor Area */}
        <div className={`editor-component__editor-area editor-component__editor-area--${(splitView && activeEditorTab === 'content') ? 'split-view' : 'single'} content-auto`}>
          {/* Content Tab */}
          {activeEditorTab === 'content' && (
            <>
              {!splitView && (
                <div className="editor-component__editor-panel">
                  {/* About Editor - für about.json */}
                  {selectedFile && selectedFile.category === 'about' && selectedFile.name === 'about.json' && aboutData ? (
                    <AboutEditor
                      initialData={aboutData}
                      onSave={(data) => {
                        setAboutData(data)
                        handleSave()
                      }}
                    />
                  ) : selectedFile ? (
                    <div className="editor-component__no-editor">
                      <p className="text-gray-400">
                        Editor für {selectedFile.category}/{selectedFile.name} wird implementiert...
                      </p>
                      <p className="text-gray-500 text-sm mt-2">
                        Aktuell nur about.json unterstützt. Weitere Editoren folgen.
                      </p>
                    </div>
                  ) : (
                    <div className="editor-component__no-editor">
                      <p className="text-gray-400">Wähle eine Datei aus der Liste aus</p>
                    </div>
                  )}
                </div>
              )}
              
              {splitView && (
                <div className="editor-component__split-view-layout">
                  {/* Editor Panel */}
                  <div 
                    className="editor-component__editor-panel"
                    style={{ width: `${splitPosition}%` }}
                  >
                    {selectedFile && selectedFile.category === 'about' && selectedFile.name === 'about.json' && aboutData ? (
                      <AboutEditor
                        initialData={aboutData}
                        onSave={(data) => {
                          setAboutData(data)
                          handleSave()
                        }}
                      />
                    ) : selectedFile ? (
                      <div className="editor-component__no-editor">
                        <p className="text-gray-400">
                          Editor für {selectedFile.category}/{selectedFile.name} wird implementiert...
                        </p>
                      </div>
                    ) : (
                      <div className="editor-component__no-editor">
                        <p className="text-gray-400">Wähle eine Datei aus</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Resizer */}
                  <div 
                    className="editor-component__split-resizer"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      setIsResizing(true)
                    }}
                  />
                  
                  {/* Preview Panel */}
                  <div 
                    className="editor-component__preview-panel"
                    style={{ width: `${100 - splitPosition}%` }}
                  >
                    {aboutData && selectedFile?.category === 'about' && selectedFile.name === 'about.json' ? (
                      <div className="about-preview">
                        <DetailLayoutRenderer
                          layout={sectionLayouts?.aboutMe?.detailLayout || 'sidebar-left'}
                          content={
                            <div className="about-content">
                              {aboutData.header && (
                                <div className="about-header">
                                  <h1 className="about-header__title">{aboutData.header.title}</h1>
                                  {aboutData.header.subtitle && (
                                    <p className="about-header__subtitle">{aboutData.header.subtitle}</p>
                                  )}
                                </div>
                              )}
                              {aboutData.sections && aboutData.sections.length > 0 && (
                                <div className="about-sections">
                                  {aboutData.sections.map((section) => (
                                    <SectionRenderer key={section.id} section={section} />
                                  ))}
                                </div>
                              )}
                            </div>
                          }
                          sidebar={
                            aboutData.sections && aboutData.sections.length > 0 ? (
                              <nav className="about-sidebar">
                                <div className="sidebar-header">
                                  <h3 className="sidebar-title">Contents</h3>
                                </div>
                                <div className="sidebar-nav">
                                  {aboutData.sections.map((section, index) => (
                                    <a
                                      key={section.id}
                                      href={`#${section.id}`}
                                      className="sidebar-nav-item"
                                    >
                                      <span className="nav-item-number">{String(index + 1).padStart(2, '0')}</span>
                                      <span className="nav-item-text">{section.title}</span>
                                    </a>
                                  ))}
                                </div>
                              </nav>
                            ) : null
                          }
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <div className="text-4xl mb-4">👁️</div>
                          <p className="text-gray-400">No content to preview</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Appearance Tab */}
          {activeEditorTab === 'appearance' && (
            <div className="editor-component__appearance-panel">
              <AppearanceEditor />
            </div>
          )}

          {/* Preview Tab */}
          {activeEditorTab === 'preview' && (
            <div className="editor-component__preview-panel-full">
              {aboutData && selectedFile?.category === 'about' && selectedFile.name === 'about.json' ? (
                <div className="about-preview">
                  {/* About Preview wird hier gerendert */}
                  <p className="text-gray-400">About Preview wird hier angezeigt</p>
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="text-4xl mb-4">👁️</div>
                    <p className="text-gray-400">Select a file to preview</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Preview Only Modal */}
      <BaseModal 
        isOpen={isPreviewModalOpen} 
        onClose={handleClosePreviewModal} 
        title={`Preview: ${selectedFile?.name || 'Markdown Preview'}`}
      >
        {selectedFile?.category === 'projects' && (
          <div className="editor-component__layout-selector editor-component__layout-selector--modal">
            <label className="editor-component__layout-label">
              Layout:
              <select
                value={selectedLayout}
                onChange={(e) => setSelectedLayout(e.target.value)}
                className="editor-component__layout-select"
              >
                <option value="sidebar-left">📋 Sidebar Left</option>
                <option value="sidebar-right">📋 Sidebar Right</option>
                <option value="full-width">📄 Full Width</option>
                <option value="two-column">📊 Two Column</option>
                <option value="centered">🎯 Centered</option>
                <option value="masonry">🧱 Masonry</option>
                <option value="split-screen">🖥️ Split Screen</option>
                <option value="hero-content">🎬 Hero Content</option>
                <option value="carousel-layout">🎠 Carousel</option>
                <option value="sticky-sidebar">📌 Sticky Sidebar</option>
              </select>
            </label>
          </div>
        )}
        <div className="project-detail-modal">
          {parsedMarkdown && layoutConfig ? (
            <BlockEditor
              config={layoutConfig}
              markdownSections={parsedMarkdown.sections}
              githubUrl={frontmatter?.github}
              projectName={selectedFile?.category === 'projects' ? selectedFile.name.toLowerCase() : undefined}
              isEditMode={isEditMode}
              onSectionsReorder={handleSectionsReorder}
              onBlockMove={handleBlockMove}
            />
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-4xl mb-4">📝</div>
                <p className="text-gray-400">No content to preview</p>
              </div>
            </div>
          )}
        </div>
      </BaseModal>

      {/* Formatting Guide Modal */}
      <BaseModal 
        isOpen={isFormattingGuideOpen} 
        onClose={() => setIsFormattingGuideOpen(false)} 
        title="📖 Markdown Formatting Guide"
      >
        <div className="formatting-guide">
          <div className="formatting-guide__content">
            <h3 className="formatting-guide__section-title">Headers</h3>
            <div className="formatting-guide__examples">
              <div className="formatting-guide__example">
                <code>### Main Section</code>
                <span>→ Creates H3 header</span>
              </div>
              <div className="formatting-guide__example">
                <code>#### Sub Section</code>
                <span>→ Creates H4 header</span>
              </div>
            </div>

            <h3 className="formatting-guide__section-title">Text Formatting</h3>
            <div className="formatting-guide__examples">
              <div className="formatting-guide__example">
                <code>**bold text**</code>
                <span>→ <strong>bold text</strong></span>
              </div>
              <div className="formatting-guide__example">
                <code>*italic text*</code>
                <span>→ <em>italic text</em></span>
              </div>
              <div className="formatting-guide__example">
                <code>`inline code`</code>
                <span>→ <code>inline code</code></span>
              </div>
            </div>

            <h3 className="formatting-guide__section-title">Lists</h3>
            <div className="formatting-guide__examples">
              <div className="formatting-guide__example">
                <code>- Bullet point</code>
                <span>→ Creates bullet list</span>
              </div>
              <div className="formatting-guide__example">
                <code>1. Numbered item</code>
                <span>→ Creates numbered list</span>
              </div>
            </div>

            <h3 className="formatting-guide__section-title">Code Blocks</h3>
            <div className="formatting-guide__examples">
              <div className="formatting-guide__example">
                <code>```<br/>code here<br/>```</code>
                <span>→ Creates code block</span>
              </div>
            </div>

            <h3 className="formatting-guide__section-title">Links & Images</h3>
            <div className="formatting-guide__examples">
              <div className="formatting-guide__example">
                <code>[Link text](https://example.com)</code>
                <span>→ Creates clickable link</span>
              </div>
              <div className="formatting-guide__example">
                <code>![Alt text](image.jpg)</code>
                <span>→ Embeds image</span>
              </div>
            </div>

            <h3 className="formatting-guide__section-title">Other Elements</h3>
            <div className="formatting-guide__examples">
              <div className="formatting-guide__example">
                <code>&gt; Quote text</code>
                <span>→ Creates blockquote</span>
              </div>
              <div className="formatting-guide__example">
                <code>---</code>
                <span>→ Creates horizontal line</span>
              </div>
            </div>

            <div className="formatting-guide__tip">
              <strong>💡 Tip:</strong> Use headers (### and ####) to create navigation sections that appear in the sidebar!
            </div>
          </div>
        </div>
      </BaseModal>

      {/* Validation Modal */}
      <ValidationModal
        isOpen={isValidationModalOpen}
        onClose={() => setIsValidationModalOpen(false)}
        validationResults={validationResults}
        onRemoveEmptySections={handleRemoveEmptySections}
        onBuildAnyway={performBuild}
        onCancel={() => setIsValidationModalOpen(false)}
      />
      
      <NewFileModal
        isOpen={isNewFileModalOpen}
        onClose={() => setIsNewFileModalOpen(false)}
        onCreate={handleCreateNewFile}
      />
    </div>
  )
}
