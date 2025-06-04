Implement a Theme Editor for the admin interface with the following structure:

Backend (Python/FastAPI):
1. Domain Layer (backend/app/domain/):
[x] models/Theme.py: Theme Model with:
[x] id: int | None
[x] name: str
[x] description: str | None
[x] variables: Dict[str, Any] {
[x] colors: { primary, secondary, accent, background, text },
[x] typography: { fontFamily, fontSize, lineHeight },
[x] spacing: { small, medium, large },
[x] borderRadius: { small, medium, large }
[x] }
[x] is_active: bool
[x] created_at: datetime
[x] updated_at: datetime
[x] model_config = ConfigDict(from_attributes=True)
[x] repositories/ThemeRepository.py: Interface for database operations
[x] services/ThemeService.py: Business logic

2. Infrastructure Layer (backend/app/infrastructure/):
[x] repositories/ThemeRepositoryImpl.py: PostgreSQL implementation with JSONB
[x] api/admin/themes/ThemeController.py: FastAPI Router with endpoints
[x] schemas/ThemeSchema.py: Pydantic models with validation

3. API Layer (backend/app/api/):
[x] endpoints/admin/themes.py: FastAPI router with these endpoints:
[x] GET /api/admin/themes - List all themes
[x] GET /api/admin/themes/{theme_id} - Get theme by ID
[x] POST /api/admin/themes - Create new theme
[x] PUT /api/admin/themes/{theme_id} - Update theme
[x] DELETE /api/admin/themes/{theme_id} - Delete theme
[x] PATCH /api/admin/themes/{theme_id}/activate - Activate theme
[x] PATCH /api/admin/themes/{theme_id}/duplicate - Duplicate theme
[x] POST /api/admin/themes/import - Import theme from JSON
[x] GET /api/admin/themes/{theme_id}/export - Export theme to JSON
[x] GET /api/admin/themes/active - Get currently active theme
[x] dependencies.py: FastAPI dependencies for auth and validation

4. Database:
[x] New migration for themes table with JSONB column
[x] Indices for is_active and created_at

Frontend (Next.js/React/TypeScript):
1. Features (frontend/src/presentation/admin/components/features/themes/):
[ ] ThemeList.tsx: Grid layout like ProjectList
[ ] ThemeEditor.tsx: Split view like ProjectEditor
[ ] ThemePreview.tsx: Live preview with example components
[ ] ThemeForm.tsx: Form with React Hook Form + Zod
[ ] ThemeContext.tsx: Context for theme state

2. API Integration:
[ ] infrastructure/api/admin/themes/ThemeApi.ts: Axios client
[ ] application/admin/themes/useThemes.ts: TanStack Query hooks
[ ] domain/entities/Theme.ts: TypeScript interfaces

3. UI Components (with Radix UI and Headless UI):
[ ] ThemeCard.tsx: Card layout like ProjectCard
[ ] ThemeVariables.tsx: CSS variables editor
[ ] ThemePreview.tsx: Responsive preview
[ ] ThemeSelector.tsx: Radix Select for theme switching
[ ] Dialog.tsx: Radix Dialog for import/export
[ ] ScrollArea.tsx: Radix ScrollArea for long lists
[ ] AlertDialog.tsx: Radix Alert Dialog for confirmations
[ ] Icons.tsx: Heroicons and Lucide icons integration
3. UI Components (with Radix UI and Headless UI):
[ ] ThemeCard.tsx: Card layout like ProjectCard
[ ] ThemeVariables.tsx: CSS variables editor
[ ] ThemePreview.tsx: Responsive preview
[ ] ThemeSelector.tsx: Radix Select for theme switching
[ ] Dialog.tsx: Radix Dialog for import/export
[ ] ScrollArea.tsx: Radix ScrollArea for long lists
[ ] AlertDialog.tsx: Radix Alert Dialog for confirmations
[ ] Icons.tsx: Heroicons and Lucide icons integration

4. Styling:
[ ] Tailwind CSS with clsx and tailwind-merge
[ ] class-variance-authority for variants
[ ] Responsive design
[ ] Dark mode support
[ ] Theme switching animations
[ ] Custom Tailwind plugins for theme variables
[ ] Tailwind CSS with clsx and tailwind-merge
[ ] class-variance-authority for variants
[ ] Responsive design
[ ] Dark mode support
[ ] Theme switching animations
[ ] Custom Tailwind plugins for theme variables

5. Features:
[ ] Drag & Drop with react-dropzone
[ ] Live preview of changes
[ ] Theme duplication
[ ] Theme export/import
[ ] Responsive preview
[ ] CSS variables editor
[ ] Theme activation/deactivation

6. Integration:
[ ] Next.js App Router integration
[ ] TanStack Query for state management
[ ] React Hook Form + Zod for validation
[ ] Axios error handling
[ ] Loading states
[ ] Toast notifications
[ ] NextAuth.js authentication

The implementation should:
[ ] Follow existing code style
[ ] Use same patterns as ProjectEditor
[ ] Have full TypeScript typing
[ ] Include Jest tests
[ ] Implement error handling
[ ] Show loading states
[ ] Be responsive
[ ] Meet accessibility standards
[ ] Be performance optimized
[ ] Follow security best practices

Frontend Routes (frontend/src/app/admin/themes/):
[ ] page.tsx: Main themes page
[ ] [id]/page.tsx: Theme editor page
[ ] layout.tsx: Theme section layout
[ ] loading.tsx: Loading state
[ ] error.tsx: Error handling