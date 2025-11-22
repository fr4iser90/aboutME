'use client'

import { useState, useEffect } from 'react'
import { parseFrontmatter } from '@/features/portfolio/utils/frontmatterParser'
import { frontmatterToBlocks } from '@/features/portfolio/utils/frontmatterToBlocks'
import { MarkdownParser } from '@/features/shared/services/markdownParser'
import type { DetailPageLayoutConfig, DetailLayoutConfig } from '@/features/portfolio/types/layouts'
import type { MarkdownSection } from '@/features/shared/services/markdownParser'
import LayoutTemplateSelector from './LayoutTemplateSelector'
import BlockConfigurator from './BlockConfigurator'
import AnimationEditor from './AnimationEditor'
import LayoutPreview from './LayoutPreview'

interface ProjectFile {
  name: string
  path: string
  category: string
}

interface DetailPageLayoutEditorProps {
  category: 'projects' | 'blog'
  onSave?: () => void
}

export default function DetailPageLayoutEditor({ category, onSave }: DetailPageLayoutEditorProps) {
  const [projects, setProjects] = useState<ProjectFile[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [projectContent, setProjectContent] = useState<string>('')
  const [layoutConfig, setLayoutConfig] = useState<DetailPageLayoutConfig | DetailLayoutConfig | null>(null)
  const [markdownSections, setMarkdownSections] = useState<MarkdownSection[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  // Load projects list
  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true)
        const response = await fetch('/api/editor/files')
        if (!response.ok) throw new Error('Failed to load projects')
        const data = await response.json()
        const projectFiles = (data.files || [])
          .filter((f: any) => f.category === category)
          .map((f: any) => ({
            name: f.name,
            path: f.path,
            category: f.category
          }))
        setProjects(projectFiles)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load projects')
      } finally {
        setLoading(false)
      }
    }
    loadProjects()
  }, [category])

  // Load selected project
  useEffect(() => {
    if (!selectedProject) return

    async function loadProject() {
      try {
        setLoading(true)
        setError(null)
        // Convert file path to API path format
        const relativePath = selectedProject.replace(/^.*\/private\/data\//, '')
        const apiPath = `/api/editor/file/${relativePath}`
        const response = await fetch(apiPath)
        if (!response.ok) throw new Error('Failed to load project')
        const content = await response.text()
        setProjectContent(content)

        // Parse frontmatter and create layout config
        const { frontmatter } = parseFrontmatter(content)
        const parser = new MarkdownParser(content, frontmatter?.github, selectedProject.toLowerCase())
        const parsed = parser.parse()
        setMarkdownSections(parsed.sections)

        const config = frontmatterToBlocks(frontmatter || {}, parsed.sections)
        setLayoutConfig(config)
        setHasChanges(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load project')
      } finally {
        setLoading(false)
      }
    }
    loadProject()
  }, [selectedProject])

  const handleTemplateChange = (template: string) => {
    if (!layoutConfig) return
    setLayoutConfig({
      ...layoutConfig,
      template: template as DetailPageLayoutConfig['template']
    })
    setHasChanges(true)
  }

  const handleBlockUpdate = (newConfig: DetailPageLayoutConfig | DetailLayoutConfig) => {
    setLayoutConfig(newConfig)
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!selectedProject || !layoutConfig) return

    try {
      setLoading(true)
      setError(null)

      // Convert layout config back to frontmatter format
      const { frontmatter } = parseFrontmatter(projectContent)
      const updatedFrontmatter = {
        ...frontmatter,
        pageLayout: layoutConfig.template,
        layout: {
          template: layoutConfig.template,
          slots: layoutConfig.slots
        }
      }

      // Update frontmatter in content
      const frontmatterString = Object.entries(updatedFrontmatter)
        .map(([key, value]) => {
          if (key === 'layout') {
            return `layout: ${JSON.stringify(value)}`
          }
          if (typeof value === 'string') {
            return `${key}: "${value}"`
          }
          if (Array.isArray(value)) {
            return `${key}: [${value.map(v => `"${v}"`).join(', ')}]`
          }
          return `${key}: ${value}`
        })
        .join('\n')

      const updatedContent = `---\n${frontmatterString}\n---\n${projectContent.split('---').slice(2).join('---')}`

      // Convert file path to API path format
      const relativePath = selectedProject.replace(/^.*\/private\/data\//, '')
      const response = await fetch('/api/editor/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: relativePath,
          content: updatedContent
        })
      })

      if (!response.ok) throw new Error('Failed to save')
      setHasChanges(false)
      if (onSave) {
        onSave()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    // Reload project to discard changes
    if (selectedProject) {
      const currentProject = selectedProject
      setSelectedProject(null)
      setTimeout(() => setSelectedProject(currentProject), 100)
    }
  }

  if (loading && !layoutConfig) {
    return (
      <div className="layout-editor__loading">
        <p>Loading {category}...</p>
      </div>
    )
  }

  return (
    <div className="layout-editor">
      {/* Project Selector */}
      <div className="layout-editor__project-selector">
        <label className="layout-editor__label">
          Select {category === 'projects' ? 'Project' : 'Blog Post'}:
          <select
            value={selectedProject || ''}
            onChange={(e) => setSelectedProject(e.target.value || null)}
            className="layout-editor__select"
            disabled={loading}
          >
            <option value="">-- Select a {category === 'projects' ? 'project' : 'blog post'} --</option>
            {projects.map((project) => (
              <option key={project.path} value={project.path}>
                {project.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <div className="layout-editor__error">
          <p>Error: {error}</p>
        </div>
      )}

      {!selectedProject && (
        <div className="layout-editor__empty">
          <p>Please select a {category === 'projects' ? 'project' : 'blog post'} to edit its layout.</p>
        </div>
      )}

      {selectedProject && layoutConfig && (
        <div className="layout-editor__split-view">
          {/* Left Panel: Configuration */}
          <div className="layout-editor__config-panel">
            <div className="layout-editor__config-content">
              {/* Template Selector */}
              <div className="layout-editor__section">
                <h2 className="layout-editor__section-title">Layout Template</h2>
                <LayoutTemplateSelector
                  selectedTemplate={layoutConfig.template}
                  onTemplateChange={handleTemplateChange}
                />
              </div>

              {/* Block Configurator */}
              <div className="layout-editor__section">
                <h2 className="layout-editor__section-title">Blocks</h2>
                <BlockConfigurator
                  config={layoutConfig}
                  onConfigUpdate={handleBlockUpdate}
                  markdownSections={markdownSections}
                />
              </div>

              {/* Animation Editor */}
              <div className="layout-editor__section">
                <h2 className="layout-editor__section-title">Animations</h2>
                <AnimationEditor
                  config={layoutConfig}
                  onConfigUpdate={handleBlockUpdate}
                  markdownSections={markdownSections}
                />
              </div>
            </div>

            {/* Save/Cancel Buttons */}
            <div className="layout-editor__actions">
              <button
                onClick={handleSave}
                disabled={!hasChanges || loading}
                className="layout-editor__btn layout-editor__btn--primary"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancel}
                disabled={!hasChanges || loading}
                className="layout-editor__btn layout-editor__btn--secondary"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Right Panel: Preview */}
          <div className="layout-editor__preview-panel">
            <div className="layout-editor__preview-header">
              <h2 className="layout-editor__section-title">Preview</h2>
            </div>
            <div className="layout-editor__preview-content">
              <LayoutPreview
                config={layoutConfig}
                markdownSections={markdownSections}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

