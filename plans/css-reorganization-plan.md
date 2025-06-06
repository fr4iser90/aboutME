# CSS Reorganization Plan

## Current Structure Analysis
```
frontend/src/domain/shared/styles/
├── admin/
│   ├── admin.css (needs review)
│   ├── components/ (17 files)
│   │   ├── admin-components.css
│   │   ├── AdminSkillsPage.css
│   │   ├── FileInformation.css
│   │   ├── FilePreview.css
│   │   ├── FileTree.css
│   │   ├── GitHubSyncButton.css
│   │   ├── navigation-menu.css
│   │   ├── page.css
│   │   ├── progress.css
│   │   ├── ProjectEditor.css
│   │   ├── ProjectForm.css
│   │   ├── ProjectList.css
│   │   ├── radio-group.css
│   │   ├── resizable.css
│   │   ├── SectionEditor.css
│   │   ├── SkillForm.css
│   │   └── toaster.css
│   ├── layout/
│   │   └── admin-layout.css
│   ├── main.css (needs review)
│   └── theme/
└── public/
    ├── components/ (4 files)
    │   ├── globals.css (needs review - should be in root or admin?)
    │   ├── ProjectCard.css
    │   ├── ProjectsPage.css
    │   └── public-sections.css
    ├── layout/
    │   └── layout.css
    ├── main.css (needs review)
    └── theme/
        ├── layout.css (duplicate)
        └── theme.css
```

## Issues to Fix
1. Root level files that need review:
   - `admin/admin.css` - might be redundant with components
   - `admin/main.css` - needs review
   - `public/main.css` - needs review
   - `public/components/globals.css` - incorrectly placed

2. Duplicate layout files:
   - `public/layout/layout.css`
   - `public/theme/layout.css`

3. Theme organization:
   - Empty admin/theme directory
   - Duplicate theme files in public

## Execution Steps

### Phase 1: Root Files Review
1. Review and handle main.css files:
   - Compare admin/main.css and public/main.css
   - Determine if they're needed or can be merged into components
   - Update imports accordingly

2. Review admin.css:
   - Check if content is already in admin/components
   - Merge or remove if redundant
   - Move unique styles to appropriate admin component

3. Handle globals.css:
   - Move from public/components to appropriate location
   - Review if it should be in admin or public root
   - Update all imports

### Phase 2: Layout & Theme Organization
1. Resolve duplicate layout files:
   - Review content of both layout files
   - Merge if possible or keep the more appropriate one
   - Remove duplicate

2. Organize theme files:
   - Move appropriate theme files to admin/theme
   - Keep only necessary theme files in public/theme
   - Update theme imports

### Phase 3: BEM Validation
1. Check each component for BEM compliance:
   - Block naming
   - Element naming (__)
   - Modifier naming (--)

2. Fix any BEM violations:
   - Standardize block names
   - Fix element separators
   - Fix modifier separators

## Success Criteria
- [ ] All main.css files reviewed and handled
- [ ] admin.css reviewed and merged if needed
- [ ] globals.css moved to correct location
- [ ] Duplicate layout files resolved
- [ ] Theme files properly organized
- [ ] All components follow BEM
- [ ] No broken styles

## Next Steps
1. Begin with main.css files review
2. Handle admin.css and globals.css
3. Resolve layout and theme organization
4. Validate BEM compliance

## Expected Final Structure
```
frontend/src/domain/shared/styles/
├── admin/
│   ├── components/
│   │   ├── file/
│   │   │   ├── file-information.css
│   │   │   ├── file-preview.css
│   │   │   └── file-tree.css
│   │   ├── project/
│   │   │   ├── project-editor.css
│   │   │   ├── project-form.css
│   │   │   └── project-list.css
│   │   ├── section/
│   │   │   └── section-editor.css
│   │   ├── skill/
│   │   │   └── skill-form.css
│   │   └── ui/
│   │       ├── admin-nav.css
│   │       ├── github-sync.css
│   │       ├── page.css
│   │       ├── progress.css
│   │       ├── radio-group.css
│   │       ├── resizable.css
│   │       └── toaster.css
│   ├── layout/
│   │   └── admin-layout.css
│   └── theme/
│       └── admin-theme.css
└── public/
    ├── components/
    │   ├── project/
    │   │   └── project-card.css
    │   └── ui/
    │       └── public-nav.css
    ├── layout/
    │   └── public-layout.css
    └── theme/
        └── public-theme.css
```

### Key Changes from Current to Expected:
1. Removed:
   - admin/admin.css (merged into components)
   - admin/main.css (merged into components)
   - public/main.css (merged into components)
   - public/components/globals.css (moved to appropriate theme)
   - public/theme/layout.css (merged with public/layout/layout.css)

2. Added:
   - Component grouping by feature/domain
   - UI components separation
   - Clear theme separation

3. Organized:
   - Components grouped by feature (file, project, section, skill)
   - UI components separated
   - Clear admin/public separation
   - Theme files properly separated
   - Layout files properly separated

4. Naming Standardization:
   - All files use kebab-case
   - Feature-based organization
   - Clear component hierarchy
   - UI components separated from feature components

5. Modern Practices:
   - Feature-based organization
   - Component isolation
   - Clear separation of concerns
   - UI components separated from business components
   - Theme and layout properly separated
