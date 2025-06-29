# Inline Page Editor: EIN Edit-Button auf Landing Page (ToDo, detailliert & pattern-konform)

---

## **Frontend: Inline Page Editor**

- [ ] **EIN Edit-Button Komponente**
  - [ ] Neue Komponente:
    - `frontend/src/presentation/shared/ui/PageEditButton.tsx`
      - EIN Edit-Button für die gesamte Landing Page
      - Props: onEdit, position (top-right, bottom-right, etc.)
      - **Nur du als Admin** siehst diesen Button

- [ ] **Landing Page Integration**
  - [ ] **EIN Edit-Button auf der Landing Page** in
    - `frontend/src/presentation/public/pages/page.tsx`
      - EIN Edit-Button oben rechts auf der Page
      - **Nur du als Admin** siehst den Edit-Button
      - **Besucher** sehen nur die normale Page ohne Edit-Button

- [ ] **Admin-Auth Check**
  - [ ] Admin-Context Integration:
    - `frontend/src/presentation/admin/contexts/AdminContext.tsx` erweitern
    - `isAdmin` State für Edit-Button Visibility
  - [ ] **Edit-Button nur für Admins anzeigen**:
    - Conditional Rendering basierend auf Admin-Status
    - Besucher sehen niemals Edit-Button

- [ ] **Page Edit Mode**
  - [ ] **Edit-Modus für gesamte Page**:
    - EIN Button aktiviert Edit-Modus für alle Sections
    - Alle editierbaren Bereiche werden hervorgehoben
    - Klick auf Text/Content → direkt editierbar
    - **EIN Save-Button** speichert alle Änderungen
    - **EIN Cancel-Button** verwirft alle Änderungen

---

## **Backend: Content-API**

- [ ] **API-Endpunkte**
  - [ ] `backend/app/api/endpoints/admin/content.py`
    - Endpunkt: `GET /api/admin/content` (Alle Content laden)
    - Endpunkt: `PUT /api/admin/content` (Alle Content speichern)
    - **Nur du als Admin** darfst bearbeiten (Auth prüfen)
    - **Besucher** dürfen nur Content lesen (GET), niemals bearbeiten

- [ ] **Content Management**
  - [ ] Model:
    - `backend/app/domain/models/content.py`
      - Content-Entity (id, section_id, type, value, created_at, updated_at)
  - [ ] Schema:
    - `backend/app/schemas/content.py`
      - Pydantic-Model für Content (Request/Response)
  - [ ] Repository-Interface:
    - `backend/app/domain/repositories/content_repository.py`
  - [ ] Repository-Implementierung:
    - `backend/app/infrastructure/database/repositories/content_repository_impl.py`
  - [ ] DB-Model:
    - `backend/app/infrastructure/database/models/content.py`
      - SQLAlchemy-Model für Content
  - [ ] Migration:
    - Neue Migration für Content-Tabelle

---

## **Integration & Features**

- [ ] **Page Edit Workflow**
  - [ ] **EIN Edit-Button klicken** → Page wird editierbar
  - [ ] **Alle Sections** werden editierbar markiert
  - [ ] **Klick auf Text** → direkt editierbar
  - [ ] **EIN Save-Button** → alle Änderungen speichern
  - [ ] **EIN Cancel-Button** → alle Änderungen verwerfen

- [ ] **Real-time Updates**
  - [ ] **Sofortige Anzeige** nach Speichern
  - [ ] **Optimistic Updates** für bessere UX
  - [ ] **Error Handling** bei Speicher-Fehlern

- [ ] **Admin-Only Features**
  - [ ] **EIN Edit-Button nur für Admins** sichtbar
  - [ ] **Admin-Auth Check** bei jedem Edit-Request
  - [ ] **Besucher** sehen niemals Edit-Funktionen

---

## **Testing & Validation**

- [ ] **Testing**
  - [ ] Tests für Page-Edit-Button Komponente
  - [ ] Tests für Admin-Auth Integration
  - [ ] Tests für Content-API
  - [ ] E2E Tests für Edit-Workflow

- [ ] **Validation**
  - [ ] Content-Validierung vor Speichern
  - [ ] Admin-Permission Validierung
  - [ ] Error-Handling für fehlgeschlagene Requests

---

## **Deployment & Security**

- [ ] **Security**
  - [ ] **Admin-Auth** bei allen Edit-Requests
  - [ ] **CSRF Protection** für Edit-Forms
  - [ ] **Input Sanitization** für HTML-Content
  - [ ] **Rate Limiting** für Edit-Requests

- [ ] **Performance**
  - [ ] **Lazy Loading** für Edit-Komponenten
  - [ ] **Optimistic Updates** für bessere UX
  - [ ] **Caching** für Content-Daten 