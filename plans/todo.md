# Admin Grid-Editor: Drag&Drop Layout (ToDo, detailliert & pattern-konform)

---

## **Frontend: Grid-Editor**

- [ ] **Library installieren**
  - [ ] `react-grid-layout` im richtigen Verzeichnis installieren:
    - `cd frontend && npm install react-grid-layout`

- [ ] **EIN Edit-Button für JEDE Page**
  - [ ] **Landing Page Edit-Button**:
    - `frontend/src/presentation/public/pages/page.tsx`
    - EIN Edit-Button oben rechts auf der Landing Page
    - **Nur du als Admin** siehst diesen Button
    - **Besucher** sehen nur die normale Page ohne Edit-Button
  - [ ] **Admin Page Edit-Button**:
    - `frontend/src/presentation/admin/pages/page.tsx` (oder wo die Admin-Page ist)
    - EIN Edit-Button oben rechts auf der Admin Page
    - **Nur du als Admin** siehst diesen Button
  - [ ] **Edit-Button Komponente**:
    - `frontend/src/presentation/shared/ui/EditButton.tsx`
    - Props: onToggle, isEditing, position
    - Icon: Edit-Icon wenn nicht editing, Save-Icon wenn editing

- [ ] **Grid-Editor Komponente**
  - [ ] Neue Komponente:
    - `frontend/src/presentation/admin/components/features/sections/AdminGridEditor.tsx`
      - Grid-Editor-UI für Sections/Cards (Drag&Drop, Resize)
      - Nutzt `react-grid-layout`
      - Props: Sections, Layout, onLayoutChange, isEditing, etc.
  - [ ] Optional: Gemeinsame Grid-Logik in
    - `frontend/src/presentation/shared/ui/AdminGrid.tsx` (falls auch für andere Admin-Features nutzbar)

- [ ] **State Management**
  - [ ] **Global Edit-State**:
    - `frontend/src/presentation/admin/contexts/EditContext.tsx`
    - `isEditing` State für alle Pages
    - `useEdit()` Hook für einfachen Zugriff
  - [ ] **Layout-Änderungen** im State halten (`useState`)
  - [ ] **API-Integration**:
    - Laden: `GET /api/admin/layout`
    - Speichern: `POST /api/admin/layout`
    - API-Calls in `frontend/src/domain/shared/utils/api.ts`

- [ ] **Page Integration**
  - [ ] **Landing Page** (`frontend/src/presentation/public/pages/page.tsx`):
    - EditContext Provider hinzufügen
    - EditButton importieren & einbinden
    - Conditional Rendering: `{isEditing ? <AdminGridEditor /> : <NormalSections />}`
  - [ ] **Admin Page** (Admin-Page-Datei):
    - EditContext Provider hinzufügen
    - EditButton importieren & einbinden
    - Conditional Rendering: `{isEditing ? <AdminGridEditor /> : <NormalSections />}`

- [ ] **Fallback**
  - [ ] Fallback auf Standard-Layout, falls kein Layout gespeichert

---

## **Backend: Layout-API**

- [ ] **API-Endpunkte**
  - [ ] `backend/app/api/endpoints/admin/layout.py`
    - Endpunkt: `GET /api/admin/layout` (Layout laden)
    - Endpunkt: `POST /api/admin/layout` (Layout speichern)
    - **Nur du als Admin** darfst speichern/bearbeiten (Auth prüfen)
    - **Besucher** dürfen nur das Layout lesen (GET), aber niemals speichern/bearbeiten

- [ ] **Domain & Infrastruktur**
  - [ ] Model:
    - `backend/app/domain/models/layout.py`
      - Layout-Entity (id, page, layout_json, created_at, updated_at)
  - [ ] Schema:
    - `backend/app/schemas/layout.py`
      - Pydantic-Model für Layout (Request/Response)
  - [ ] Repository-Interface:
    - `backend/app/domain/repositories/layout_repository.py`
  - [ ] Repository-Implementierung:
    - `backend/app/infrastructure/database/repositories/layout_repository_impl.py`
  - [ ] DB-Model:
    - `backend/app/infrastructure/database/models/layout.py`
      - SQLAlchemy-Model für Layout
  - [ ] Migration:
    - Neue Migration für Layout-Tabelle (z.B. mit Alembic)

---

## **Integration & Features**

- [ ] **Edit-Button Workflow**
  - [ ] **Edit-Button klicken** → `setIsEditing(true)` → Grid-Editor aktiviert
  - [ ] **Sections werden editierbar** → Drag&Drop, Resize möglich
  - [ ] **Edit-Button wird zu Save-Button** → Icon ändert sich
  - [ ] **Save-Button klicken** → Layout speichern → `setIsEditing(false)`
  - [ ] **Cancel-Button** → Änderungen verwerfen → `setIsEditing(false)`

- [ ] **Admin-Only Features**
  - [ ] **Edit-Button nur für Admins** sichtbar auf beiden Pages
  - [ ] **Admin-Auth Check** bei jedem Layout-Request
  - [ ] **Besucher** sehen niemals Edit-Buttons oder Grid-Editor

- [ ] **Real-time Updates**
  - [ ] **Sofortige Anzeige** nach Layout-Änderungen
  - [ ] **Optimistic Updates** für bessere UX
  - [ ] **Error Handling** bei Speicher-Fehlern

---

## **Testing & Validation**

- [ ] **Testing**
  - [ ] Tests für EditButton Komponente
  - [ ] Tests für EditContext Integration
  - [ ] Tests für AdminGridEditor
  - [ ] Tests für Layout-API
  - [ ] E2E Tests für Edit-Workflow auf beiden Pages

- [ ] **Validation**
  - [ ] Layout-Validierung vor Speichern
  - [ ] Admin-Permission Validierung
  - [ ] Error-Handling für fehlgeschlagene Requests

---

## **Deployment & Security**

- [ ] **Security**
  - [ ] **Admin-Auth** bei allen Layout-Requests
  - [ ] **CSRF Protection** für Layout-Forms
  - [ ] **Input Sanitization** für Layout-JSON
  - [ ] **Rate Limiting** für Layout-Requests

- [ ] **Performance**
  - [ ] **Lazy Loading** für Grid-Editor Komponenten
  - [ ] **Optimistic Updates** für bessere UX
  - [ ] **Caching** für Layout-Daten

---

## **EXECUTION PLAN**

1. **Dependencies**: `cd frontend && npm install react-grid-layout`
2. **EditContext**: `frontend/src/presentation/admin/contexts/EditContext.tsx`
3. **EditButton**: `frontend/src/presentation/shared/ui/EditButton.tsx`
4. **AdminGridEditor**: `frontend/src/presentation/admin/components/features/sections/AdminGridEditor.tsx`
5. **Landing Page Integration**: `frontend/src/presentation/public/pages/page.tsx`
6. **Admin Page Integration**: Admin-Page-Datei
7. **Backend API**: `backend/app/api/endpoints/admin/layout.py`
8. **Models & Schemas**: Layout domain layer
9. **Database**: Migration & repository
10. **Testing**: Unit & E2E tests 