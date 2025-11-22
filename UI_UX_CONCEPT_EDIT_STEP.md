# 🎨 UI/UX Konzept: Setup Editor Step

## 📋 Übersicht

**Ziel**: User durch den Content-Edit-Prozess führen mit klaren Prioritäten und visueller Guidance.

---

## 🎯 User-Flow & Prioritäten

### Phase 1: **ESSENTIAL** (Muss gemacht werden)
1. **About** - Persönliche Info füllen
2. **Skills** - Skills überprüfen/anpassen

### Phase 2: **IMPORTANT** (Sollte gemacht werden)
3. **Projects** - Unvollständige Projekt-Details füllen (keine README)
4. **User** - User-Daten überprüfen

### Phase 3: **OPTIONAL** (Kann gemacht werden)
5. **Blog** - Neue Blog-Einträge hinzufügen (wenn aktiviert)

---

## 🎨 UI-Struktur

### Linke Sidebar: Kategorisierte Dateiliste

```
┌─────────────────────────────────────┐
│ 📝 Files                             │
├─────────────────────────────────────┤
│                                      │
│ 🎯 ESSENTIAL                         │
│ ├─ 📄 about.json          ✅ 0.2 KB  │
│ └─ 🛠️ skills.json         ⚠️ 1.5 KB  │
│                                      │
│ 📦 IMPORTANT                          │
│ ├─ 📁 Projects (22)                  │
│ │  ├─ ✅ nixos.json       ✓ 0.9 KB  │
│ │  ├─ ⚠️ aboutme.json     ⚠️ 0.8 KB  │
│ │  └─ ...                            │
│ └─ 👤 user.json           ✅ 0.5 KB  │
│                                      │
│ ✍️ OPTIONAL (Blog aktiviert)        │
│ ├─ 📝 my-first-post.json  ✅ 0.5 KB │
│ ├─ 📝 another-post.json   ✅ 0.3 KB │
│ └─ ➕ New Blog Post                  │
│                                      │
└─────────────────────────────────────┘
```

**Hinweis**: Index-Files (`projects.json`, `blog.json`) werden NICHT angezeigt - diese werden automatisch verwaltet!

### Features:

1. **Kategorien mit Headern**
   - ESSENTIAL (rot/orange Badge)
   - IMPORTANT (gelb Badge)
   - OPTIONAL (grau Badge)

2. **Icons pro Kategorie**
   - 📄 About
   - 🛠️ Skills
   - 📦 Projects
   - 👤 User
   - ✍️ Blog

3. **Validierungs-Status Icons**
   - ✅ Valid (grün)
   - ⚠️ Incomplete (gelb) - z.B. Template-Text noch drin
   - ❌ Invalid (rot)
   - ⏳ Not validated (grau)

4. **Projekt-Details Status**
   - ✅ Complete (hat README/Content)
   - ⚠️ Incomplete (keine README, nur Basis-Daten)
   - 📊 Badge: "22 projects, 8 incomplete"

5. **Blog: "New Post" Button**
   - In Blog-Kategorie
   - Öffnet Modal/Formular für neuen Blog-Eintrag

---

## 🎨 Visuelle Hierarchie

### Farb-Coding:
- **ESSENTIAL**: Rot/Orange Border + Badge
- **IMPORTANT**: Gelb Border + Badge
- **OPTIONAL**: Grau Border + Badge

### Status-Icons:
- **✅ Valid**: Grüner Checkmark
- **⚠️ Incomplete**: Gelber Warnung (Template-Text erkannt)
- **❌ Invalid**: Roter X
- **⏳ Pending**: Grauer Circle

### Projekt-Details:
- **Collapsible Section** für Projects
- **Counter Badge**: "22 projects, 8 incomplete"
- **Filter-Toggle**: "Show only incomplete"

---

## 📝 Workflow-Guidance

### Top-Banner (wenn unvollständig):
```
⚠️ Action Required
   • About: Template text detected
   • 8 Projects: Missing README content
   [Review All] [Skip for now]
```

### Inline-Hints:
- Bei About: "💡 Tip: Add your personal story here"
- Bei Skills: "💡 Tip: Skills are auto-generated from projects"
- Bei Projects: "💡 Tip: Projects without README need manual content"

---

## 🔍 Smart Features

### 1. **Template Detection**
- Erkenne Template-Text (z.B. "Add your about me content here...")
- Markiere als "⚠️ Incomplete"
- Zeige Hinweis: "Template text detected - please fill in"

### 2. **Content Completeness**
- Projekte ohne README → "⚠️ Incomplete"
- Projekte mit README → "✅ Complete"
- Filter: "Show only incomplete"

### 3. **Blog Management**
- "➕ New Blog Post" Button in Blog-Kategorie
- Öffnet Formular/Modal
- Erstellt neue JSON-Datei in `blog/posts/`
- `blog.json` (Index-File) wird automatisch aktualisiert - NICHT im Editor angezeigt!

### 4. **Validation Status**
- Lade Validierungs-Status beim Öffnen
- Zeige Icons in Dateiliste
- Update nach Save

---

## 📱 Responsive Design

### Desktop (aktuelle 2-Column):
- Links: Kategorisierte Liste (280px)
- Rechts: Editor (flex)

### Mobile:
- Collapsible Sidebar
- Full-width Editor
- Bottom Sheet für Dateiliste

---

## 🎯 User-Journey

1. **Landing**: Sehe kategorisierte Liste mit Status
2. **Guidance**: Banner zeigt was zu tun ist
3. **Priority**: ESSENTIAL zuerst (About, Skills)
4. **Projects**: Filter incomplete → fülle leer
5. **Blog**: "New Post" → erstelle Eintrag
6. **Validation**: Status-Icons zeigen Fortschritt
7. **Complete**: Alle ✅ → Next Button aktiviert

---

## 🚀 Implementation Priorities

### Phase 1 (Must Have):
- ✅ Kategorien mit Headern
- ✅ Status-Icons (Valid/Invalid)
- ✅ Template-Detection
- ✅ Project Completeness Check

### Phase 2 (Should Have):
- ✅ Filter "Show incomplete only"
- ✅ Blog "New Post" Button
- ✅ Top-Banner mit Actions
- ✅ Inline-Hints

### Phase 3 (Nice to Have):
- ✅ Progress Indicator
- ✅ Keyboard Shortcuts
- ✅ Bulk Actions
- ✅ Search/Filter

---

## 💡 UX Best Practices

1. **Progressive Disclosure**: Zeige nur relevante Info
2. **Visual Feedback**: Sofortige Status-Updates
3. **Error Prevention**: Validation vor Save
4. **Guidance**: Klare nächste Schritte
5. **Efficiency**: Filter, Shortcuts, Bulk Actions

