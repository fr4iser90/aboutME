# Admin Full-Page Grid-Editor: Drag&Drop Layout (Pattern-konform, maximal detailliert)

---

## 1. Datenbank (init.sql & seed.sql ONLY!)
- **layouts-Tabelle:**
  - id SERIAL PRIMARY KEY
  - page VARCHAR(255) NOT NULL DEFAULT 'home'
  - elements JSONB NOT NULL DEFAULT '[]'  # Array aller Page-Elemente inkl. Grid-Props, Sichtbarkeit, Typ, etc.
  - layout_config JSONB NOT NULL DEFAULT '{}'
  - is_active, is_visible, is_public, created_at, updated_at
  - Legacy-Felder (name, description, grid_config, layout_variant, sections_order, layout_type, show_sidebar, sidebar_position, content) nur als Fallback, aber nicht mehr verwenden!
  - CREATE INDEX IF NOT EXISTS idx_layouts_page ON layouts(page);
- **seed.sql:**
  - Default-Layout für page='home' mit allen Elementen (Navbar, Hero, Sections, Footer, ...)
  - Alle Sections, Skills, etc. wie gehabt

---

## 2. Backend (Pattern-konform, keine Migrationen!)
- **Domain-Model:**
  - `Layout`: page, elements[], layout_config, ... (wie in DB)
  - `PageElement`: id, type, title, visible, grid_props, order, settings
- **Pydantic-Schemas:**
  - `Layout`, `PageElement`, `LayoutUpdate`, `FullPageLayout`
- **API:**
  - `GET /api/admin/layout/full-page?page=...` → komplettes Layout (nur für Admin)
  - `POST /api/admin/layout/full-page` → speichert komplettes Layout (nur für Admin)
  - `GET /api/public/layout?page=...` → Layout (nur sichtbare Elemente)
- **Repository:**
  - Interface + SQLAlchemy-Implementierung für Layout (get_by_page, create, update)
- **Service-Layer:**
  - LayoutService mit allen Pattern-Methoden (get, update, save_full_page_layout, create_default_layout)
- **Auth:**
  - Nur Admin darf speichern/bearbeiten (JWT/Session prüfen)
- **Fehlerbehandlung:**
  - Saubere HTTP-Fehler, Logging, Validierung

---

## 3. Frontend (Pattern-konform, modular, keine statischen Layouts mehr!)
- **API-Client:**
  - `src/domain/shared/utils/layoutApi.ts` (getFullPageLayout, saveFullPageLayout)
- **Edit-Context:**
  - `src/presentation/admin/contexts/EditContext.tsx` (globaler Edit-Status, useEdit() Hook)
- **EditButton:**
  - `src/presentation/shared/ui/EditButton.tsx` (nur für Admin sichtbar, toggelt Edit-Mode)
- **FullPageGridEditor:**
  - `src/presentation/admin/components/features/FullPageGridEditor.tsx`
  - Nutzt `react-grid-layout`
  - Props: elements, layout, onLayoutChange, onSave, onCancel
  - Controls für jedes Element: Hide/Show, Resize, Delete, Settings
  - Drag&Drop, Resize, Grid-Snap, Bulk-Edit
- **ElementControls:**
  - `src/presentation/admin/components/features/ElementControls.tsx` (👁️, 🗑️, ⚙️, etc.)
- **DynamicPageRenderer:**
  - `src/presentation/public/components/DynamicPageRenderer.tsx`
  - Rendert Seite NUR aus Layout-Array (Navbar, Hero, Sections, Footer, ...)
  - **WICHTIG:** Keine statische Navbar oder Sections mehr im Code!
- **Page-Integration:**
  - Landing Page: EditContext Provider, EditButton, DynamicPageRenderer, kein statisches Layout mehr
  - Admin Page: analog
- **Fallback:**
  - Wenn kein Layout vorhanden, Default-Layout aus seed.sql verwenden
- **UX:**
  - Loading/Fehler-States, Optimistic Updates, Save/Cancel, Reset

---

## 4. Features & Pattern
- **Edit-Button Workflow:**
  - Edit-Button → setIsEditing(true) → Grid-Editor sichtbar
  - Grid-Editor: Drag&Drop, Resize, Hide/Show, Delete, Settings
  - Save/Cancel/Reset → API-Call, State zurücksetzen
- **Section Management Features:**
  - Hide/Show, Resize, Delete, Settings, Bulk-Edit
- **Admin-Only Features:**
  - Edit-Button & Grid-Editor nur für Admin sichtbar
  - Besucher sehen nur sichtbare Elemente
- **Real-time Updates:**
  - Sofortige Anzeige nach Layout-Änderungen (optimistic update)
- **Error Handling:**
  - Fehler beim Speichern/Rendern sauber anzeigen
- **Pattern:**
  - Context für Edit-Status, API-Client, Modularität, Separation of Concerns, keine statischen Layouts

---

## 5. Testing & Validation
- **API-Tests:**
  - Layout-Endpoints, Auth, Fehlerfälle
- **Frontend-Tests:**
  - Grid-Editor, Controls, Save/Cancel, EditButton, EditContext
- **E2E-Tests:**
  - Edit-Workflow, Admin-Only, Fallback, Fehlerfälle
- **Validation:**
  - Layout-Validierung vor Speichern, Admin-Check bei jedem Edit

---

## 6. Security & Performance
- **Security:**
  - Admin-Auth bei allen Layout-Requests
  - CSRF Protection für Layout-Forms
  - Input Sanitization für Layout-JSON
  - Rate Limiting für Layout-Requests
- **Performance:**
  - Lazy Loading für Grid-Editor Komponenten
  - Optimistic Updates für bessere UX
  - Caching für Layout-Daten

---

## 7. Rollback/Fail-Safe
- Wenn Fehler: Alles verwerfen, keine Migrationen, keine halben Änderungen!
- Nur Änderungen an init.sql/seed.sql und klaren, modularen Komponenten
- Rollback auf Default-Layout jederzeit möglich

---

## 8. EXECUTION PLAN (Schritt für Schritt)
1. **DB:** layouts-Tabelle & seed.sql anpassen
2. **Backend:** Model, Schema, API, Service, Repo pattern-konform anlegen
3. **Frontend:**
   - layoutApi.ts
   - EditContext
   - EditButton
   - FullPageGridEditor
   - ElementControls
   - DynamicPageRenderer
   - Page-Integration (Landing/Admin)
4. **Testing:** API, Frontend, E2E
5. **Security:** Auth, CSRF, Input-Validation
6. **UX:** Loading, Fehler, Optimistic Update, Fallback
7. **Rollback:** Bei Fehler alles verwerfen 