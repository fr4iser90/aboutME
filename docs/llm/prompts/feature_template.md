Implement a [Feature Name] with the following structure:

Backend (Python/FastAPI):
1. Domain Layer (backend/app/domain/):
   - models/[Feature].py: [Feature] Model with:
     * id: int | None
     * [field1]: [type]
     * [field2]: [type]
     * [field3]: [type]
     * created_at: datetime
     * updated_at: datetime
     * model_config = ConfigDict(from_attributes=True)
   - repositories/[Feature]Repository.py: Interface for database operations
   - services/[Feature]Service.py: Business logic

2. Infrastructure Layer (backend/app/infrastructure/):
   - repositories/[Feature]RepositoryImpl.py: PostgreSQL implementation
   - api/admin/[feature]/[Feature]Controller.py: FastAPI Router with endpoints
   - schemas/[Feature]Schema.py: Pydantic models

3. API Layer (backend/app/api/):
   - endpoints/admin/[feature].py: FastAPI router with these endpoints:
     * GET /api/admin/[feature] - List all [feature]
     * GET /api/admin/[feature]/{id} - Get [feature] by ID
     * POST /api/admin/[feature] - Create new [feature]
     * PUT /api/admin/[feature]/{id} - Update [feature]
     * DELETE /api/admin/[feature]/{id} - Delete [feature]
     * [Additional custom endpoints]
   - dependencies.py: FastAPI dependencies for auth and validation

4. Database:
   - New migration for [feature] table
   - Indices for [important fields]
   - [Special column types if needed]

Frontend (Next.js/React/TypeScript):
1. Features (frontend/src/presentation/admin/components/features/[feature]/):
   - [Feature]List.tsx: Grid layout
   - [Feature]Editor.tsx: Split view
   - [Feature]Preview.tsx: Live preview
   - [Feature]Form.tsx: Form with React Hook Form + Zod
   - [Feature]Context.tsx: Context for state

2. API Integration:
   - infrastructure/api/admin/[feature]/[Feature]Api.ts: Axios client
   - application/admin/[feature]/use[Feature].ts: TanStack Query hooks
   - domain/entities/[Feature].ts: TypeScript interfaces

3. UI Components (with Radix UI):
   - [Feature]Card.tsx: Card layout
   - [Feature]Form.tsx: Form components
   - [Feature]Preview.tsx: Preview components
   - [Feature]Selector.tsx: Selection components
   - Dialog.tsx: Radix Dialog
   - ScrollArea.tsx: Radix ScrollArea

4. Styling:
   - Tailwind CSS with clsx and tailwind-merge
   - class-variance-authority for variants
   - Responsive design
   - Dark mode support
   - Animations

5. Features:
   - [Feature specific functionality 1]
   - [Feature specific functionality 2]
   - [Feature specific functionality 3]

6. Integration:
   - Next.js App Router integration
   - TanStack Query for state management
   - React Hook Form + Zod for validation
   - Axios error handling
   - Loading states
   - Toast notifications

The implementation should:
- Follow existing code style
- Use same patterns as existing features
- Have full TypeScript typing
- Include Jest tests
- Implement error handling
- Show loading states
- Be responsive
- Meet accessibility standards
- Be performance optimized

Frontend Routes (frontend/src/app/admin/[feature]/):
- page.tsx: Main [feature] page
- [id]/page.tsx: [Feature] editor page
- layout.tsx: [Feature] section layout
- loading.tsx: Loading state
- error.tsx: Error handling 