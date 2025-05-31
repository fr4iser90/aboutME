# LLM Integration Guide

## Ziel
Integriere einen LLM-gestützten Workflow (z.B. Copilot-ähnliche Funktionen) in deine Webapp, mit klaren Workflows und einem aufklappbaren Panel im Admin-Frontend. Der LLM-API-Key soll sicher verwaltet werden (ENV und/oder Admin-Panel).

---

## 1. Architektur-Überblick
- **Frontend:**
  - Aufklappbares Panel (Drawer) rechts im Admin-Bereich
  - Formular zur Verwaltung des LLM-API-Keys und Workflow-Auswahl
  - Kommunikation mit Backend-API
- **Backend:**
  - Endpunkte für LLM-Workflows und API-Key-Management
  - Speicherung des API-Keys (ENV und optional DB)
  - Anbindung an LLM-Provider (z.B. OpenAI)

---

## 2. Benötigte Dateien/Komponenten

### Frontend (`frontend/src`)
- `components/admin/RightDrawer.tsx` – Drawer-Komponente (aufklappbar, schließbar)
- `components/admin/settings/LLMConfigForm.tsx` – Formular für API-Key und Workflow-Konfiguration
- `store/uiStore.ts` (oder Context/Redux) – State für Drawer-Status
- Integration in `app/admin/page.tsx` oder `app/admin/projects/page.tsx`

### Backend (`backend/app`)
- `api/endpoints/admin/llm.py` – API-Routen für LLM-Workflows und Key-Management
- `domain/models/llm_config.py` – Modell für API-Key (optional, falls DB)
- `domain/services/llm_service.py` – Logik für LLM-Workflows
- `.env` – LLM_API_KEY als Umgebungsvariable

---

## 3. Beispiel: Drawer im Frontend
- Button (z.B. Zahnrad-Icon) öffnet das Panel
- Panel enthält Formular für API-Key und Workflow-Auswahl
- Panel kann per X oder Klick außerhalb geschlossen werden

---

## 4. Beispiel: Backend-API
- `POST /api/admin/llm/config` – Setze/aktualisiere API-Key
- `GET /api/admin/llm/config` – Hole aktuellen API-Key (nur für Admins, ggf. maskiert)
- `POST /api/admin/llm/workflow` – Starte einen LLM-Workflow mit Parametern

---

## 5. Sicherheit & Best Practices
- API-Key primär über ENV, optional über Admin-Panel (verschlüsselt speichern)
- Zugriff auf Key-Management nur für Admins
- Logging, Monitoring, Rate-Limiting
- Niemals API-Keys im Frontend anzeigen (nur masked, z.B. `sk-****abcd`)

---

## 6. Beispiel-Workflow (Backend)
```python
# domain/services/llm_service.py
async def run_workflow(workflow_name: str, params: dict):
    # Prompt-Template je Workflow
    prompt = generate_prompt(workflow_name, params)
    response = await call_llm_api(prompt)
    return response
```

---

## 7. Nächste Schritte
1. Drawer-Komponente im Frontend bauen
2. API-Routen im Backend anlegen
3. LLM-Service anbinden und testen
4. Sicherheit prüfen

---

## 8. Optional: Erweiterungen
- Mehrere LLM-Provider unterstützen
- Workflow-Templates im Admin-Panel verwalten
- Monitoring/Statistiken zu LLM-Nutzung

---

**Tipp:**
Starte mit ENV-Variante für den API-Key. Später kannst du das Admin-Panel für dynamische Verwaltung ergänzen. 