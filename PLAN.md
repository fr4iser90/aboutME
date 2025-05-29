# About Me - Entwicklungsplan

## Projekt-Darstellung

### Layout & Design
- [ ] Grid-Layout für Projekt-Karten
  - Responsive Grid (z.B. 3 Spalten auf Desktop, 2 auf Tablet, 1 auf Mobile)
  - Optionale Sortierung nach:
    - Datum (neueste zuerst)
    - Stars/Forks
    - Alphabetisch
    - Manuell (drag & drop)
- [ ] Projekt-Karten Design
  - Konsistentes Layout für alle Karten
  - Hover-Effekte
  - Bessere Darstellung von:
    - Sprache (mit Icon)
    - Stars/Forks (mit Icons)
    - Topics (als Tags)
    - Status (WIP, Live, etc.)

### Bearbeitung & Verwaltung
- [ ] Admin-Panel Verbesserungen
  - Batch-Edit Funktion für mehrere Projekte
  - Schnell-Edit für einzelne Projekte
  - Drag & Drop für Reihenfolge
  - Filter & Suche
  - Status-Management (WIP, Live, Archived)

### Felder & Daten
- [ ] Notwendige Felder
  - Name (aus GitHub)
  - Beschreibung (editierbar)
  - GitHub URL (aus GitHub)
  - Live URL (editierbar)
  - Thumbnail (editierbar)
  - Sprache (aus GitHub)
  - Topics (aus GitHub + editierbar)
  - Status (editierbar)
  - Sichtbarkeit (editierbar)
  - Reihenfolge (editierbar)

- [ ] Optionale Felder
  - Technologien (editierbar)
  - Features (editierbar)
  - Screenshots (editierbar)
  - Demo-Video (editierbar)

## GitHub Integration
- [ ] Verbesserungen
  - Automatische Aktualisierung von:
    - Stars/Forks
    - Sprache
    - Topics
  - Manuelle Sync-Option
  - Bessere Fehlerbehandlung

## UI/UX Verbesserungen
- [ ] Admin-Panel
  - Bessere Navigation
  - Kontext-Menüs
  - Tooltips für Aktionen
  - Bestätigungs-Dialoge
  - Erfolgs/Fehler-Meldungen

- [ ] Frontend
  - Animierte Übergänge
  - Lazy Loading
  - Infinite Scroll oder Pagination
  - Suchfunktion
  - Filter nach:
    - Sprache
    - Topics
    - Status

## Technische To-Dos
- [ ] Backend
  - Optimierte Datenbank-Abfragen
  - Caching für GitHub-Daten
  - Rate Limiting
  - Bessere Fehlerbehandlung

- [ ] Frontend
  - Performance-Optimierung
  - Code-Splitting
  - Lazy Loading
  - Error Boundaries

## Prioritäten
1. Grid-Layout & Responsive Design
2. Grundlegende Bearbeitungsfunktionen
3. GitHub Integration Verbesserungen
4. UI/UX Verbesserungen
5. Erweiterte Features

## Notizen
- GitHub-URLs ändern sich selten, daher nicht als primäres Edit-Feld
- Fokus auf benutzerfreundliche Bearbeitung der wichtigsten Felder
- Automatische Aktualisierung von GitHub-Daten im Hintergrund
- Manuelle Bearbeitung für personalisierte Beschreibungen und zusätzliche Infos 