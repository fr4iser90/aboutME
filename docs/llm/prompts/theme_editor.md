Implement a Theme Editor for the admin interface with the following structure:

Backend (Python/FastAPI):
1. Domain Layer (backend/app/domain/):
   - models/Theme.py: Theme Model with:
     * id: int | None
     * name: str
     * description: str | None
     * variables: Dict[str, Any] {
         colors: { primary, secondary, accent, background, text },
         typography: { fontFamily, fontSize, lineHeight },
         spacing: { small, medium, large },
         borderRadius: { small, medium, large }
       }
     * is_active: bool
     * created_at: datetime
     * updated_at: datetime
     * model_config = ConfigDict(from_attributes=True)
   - repositories/ThemeRepository.py: Interface for database operations
   - services/ThemeService.py: Business logic

2. Infrastructure Layer (backend/app/infrastructure/):
   - repositories/ThemeRepositoryImpl.py: PostgreSQL implementation
   - api/admin/themes/ThemeController.py: FastAPI Router with endpoints
   - schemas/ThemeSchema.py: Pydantic models

3. API Layer (backend/app/api/):
   - endpoints/admin/themes.py: FastAPI router with these endpoints:
     * GET /api/admin/themes - List all themes
     * GET /api/admin/themes/{theme_id} - Get theme by ID
     * POST /api/admin/themes - Create new theme
     * PUT /api/admin/themes/{theme_id} - Update theme
     * DELETE /api/admin/themes/{theme_id} - Delete theme
     * PATCH /api/admin/themes/{theme_id}/activate - Activate theme
     * PATCH /api/admin/themes/{theme_id}/duplicate - Duplicate theme
     * POST /api/admin/themes/import - Import theme from JSON
     * GET /api/admin/themes/{theme_id}/export - Export theme to JSON
     * GET /api/admin/themes/active - Get currently active theme
   - dependencies.py: FastAPI dependencies for auth and validation

4. Database:
   - New migration for themes table
   - Indices for is_active and created_at
   - JSONB for variables

Frontend (Next.js/React/TypeScript):
1. Features (frontend/src/presentation/admin/components/features/themes/):
   - ThemeList.tsx: Grid layout like ProjectList
   - ThemeEditor.tsx: Split view like ProjectEditor
   - ThemePreview.tsx: Live preview with example components
   - ThemeForm.tsx: Form with React Hook Form + Zod
   - ThemeContext.tsx: Context for theme state

2. API Integration:
   - infrastructure/api/admin/themes/ThemeApi.ts: Axios client
   - application/admin/themes/useThemes.ts: TanStack Query hooks
   - domain/entities/Theme.ts: TypeScript interfaces

3. UI Components (with Radix UI):
   - ThemeCard.tsx: Card layout like ProjectCard
   - ThemeVariables.tsx: CSS variables editor
   - ThemePreview.tsx: Responsive preview
   - ThemeSelector.tsx: Radix Select for theme switching
   - Dialog.tsx: Radix Dialog for import/export
   - ScrollArea.tsx: Radix ScrollArea for long lists

4. Styling:
   - Tailwind CSS with clsx and tailwind-merge
   - class-variance-authority for variants
   - Responsive design
   - Dark mode support
   - Theme switching animations

5. Features:
   - Drag & Drop with react-dropzone
   - Live preview of changes
   - Theme duplication
   - Theme export/import
   - Responsive preview
   - CSS variables editor
   - Theme activation/deactivation

6. Integration:
   - Next.js App Router integration
   - TanStack Query for state management
   - React Hook Form + Zod for validation
   - Axios error handling
   - Loading states
   - Toast notifications

The implementation should:
- Follow existing code style
- Use same patterns as ProjectEditor
- Have full TypeScript typing
- Include Jest tests
- Implement error handling
- Show loading states
- Be responsive
- Meet accessibility standards
- Be performance optimized

Frontend Routes (frontend/src/app/admin/themes/):
- page.tsx: Main themes page
- [id]/page.tsx: Theme editor page
- layout.tsx: Theme section layout
- loading.tsx: Loading state
- error.tsx: Error handling