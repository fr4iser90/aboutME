# AboutMeModal Änderungen - Analyse

## 📋 Aktueller Zustand

### **AboutMeModal.tsx (aktuell):**
- ✅ Parst **Markdown** (`userData.aboutMe.content`)
- ✅ Verwendet `MarkdownParser` → `ParsedMarkdown`
- ✅ Eigene Sidebar-Navigation (Contents)
- ✅ Scroll Spy für aktive Section
- ✅ Rendert Markdown-Elemente (Headings, Lists, etc.)
- ✅ Social Links aus `userData.socialLinks`

### **Section Layout Config:**
```typescript
{
  id: 'aboutMe',
  name: 'About Me',
  supportsDetailLayout: false,  // ❌ KEIN Detail Layout!
  supportsMediaLayout: false
}
```

### **Default Layout:**
```
┌─────────────────────────────────────┐
│ About Me Modal                      │
├──────────┬──────────────────────────┤
│ Sidebar  │ Content Area              │
│          │                           │
│ Contents │ Section 1: Introduction  │
│ 01 Intro │ - Heading                 │
│ 02 Exp   │ - Text                   │
│ 03 ...   │ - List                    │
│          │                           │
│          │ Section 2: Experience    │
│          │ - ...                     │
│          │                           │
│          │ Social Links              │
└──────────┴──────────────────────────┘
```

---

## 🔄 Was ändert sich?

### **1. Datenstruktur:**
**ALT (Markdown):**
```json
{
  "content": "# About Me\n\nHi, ich bin...",
  "htmlContent": null
}
```

**NEU (Strukturiertes JSON):**
```json
{
  "header": {
    "title": "About Me",
    "subtitle": "Your tagline"
  },
  "sections": [
    {
      "id": "introduction",
      "type": "text",
      "title": "Introduction",
      "blocks": [
        { "type": "heading", "level": 2, "content": "Who I Am" },
        { "type": "text", "content": "Hi, ich bin Patrick..." },
        { "type": "list", "items": ["Frontend", "Backend"] }
      ]
    }
  ],
  "socialLinks": {
    "github": "https://...",
    "twitter": null
  }
}
```

### **2. Rendering:**
**ALT:**
- Markdown → Parser → Sections → Render Markdown Elements

**NEU:**
- JSON → Sections → Blocks → Render Block Types

### **3. Social Links:**
**ALT:**
- Aus `userData.socialLinks`

**NEU:**
- Aus `aboutData.socialLinks` (in about.json)

---

## 🎯 Detail Layout Integration?

### **Frage: Soll AboutMeModal DetailLayoutRenderer verwenden?**

**Option A: Eigene Implementierung (aktuell)**
- ✅ Eigene Sidebar + Content
- ✅ Speziell für About Me optimiert
- ❌ Nicht konsistent mit ProjectModal/BlogModal

**Option B: DetailLayoutRenderer (wie Projects)**
- ✅ Konsistent mit anderen Modals
- ✅ Nutzt Section Layout Config (`sectionLayouts.aboutMe.detailLayout`)
- ✅ Gleiche Layouts wie Projects (sidebar-left, two-column, etc.)
- ❌ Muss angepasst werden

### **Empfehlung: Option B (DetailLayoutRenderer)**

**Warum?**
- Konsistenz mit ProjectModal/BlogModal
- Nutzt Section Layout System
- User kann Layout in Appearance Editor wählen

**Änderungen:**
1. `SectionLayoutEditor.tsx`: `supportsDetailLayout: true` für `aboutMe`
2. `AboutMeModal.tsx`: DetailLayoutRenderer verwenden
3. Blocks aus JSON-Struktur rendern (statt Markdown)

---

## 📐 Default Layout (mit DetailLayoutRenderer)

### **Wenn `sectionLayouts.aboutMe.detailLayout = 'sidebar-left'`:**

```
┌─────────────────────────────────────┐
│ About Me Modal                      │
├──────────┬──────────────────────────┤
│ Sidebar  │ Content Area             │
│          │                           │
│ Contents │ Header:                  │
│ 01 Intro │ - Title: "About Me"      │
│ 02 Exp   │ - Subtitle: "Tagline"    │
│ 03 ...   │                           │
│          │ Section 1: Introduction  │
│          │ - Block: Heading (H2)     │
│          │ - Block: Text             │
│          │ - Block: List             │
│          │                           │
│          │ Section 2: Experience    │
│          │ - Block: Text             │
│          │                           │
│          │ Social Links              │
└──────────┴──────────────────────────┘
```

### **Wenn `sectionLayouts.aboutMe.detailLayout = 'two-column'`:**

```
┌─────────────────────────────────────┐
│ About Me Modal                      │
├──────────────┬──────────────────────┤
│ Column 1      │ Column 2             │
│              │                       │
│ Header       │ Sidebar              │
│ Section 1    │ Contents             │
│ Section 2    │ 01 Intro             │
│              │ 02 Exp               │
│              │                      │
│              │ Social Links         │
└──────────────┴──────────────────────┘
```

---

## 🔧 Implementierung

### **1. SectionLayoutEditor anpassen:**
```typescript
{
  id: 'aboutMe',
  name: 'About Me',
  supportsDetailLayout: true,  // ✅ JETZT TRUE!
  supportsMediaLayout: false,
  availableDetailLayouts: ['sidebar-left', 'two-column', 'centered', 'full-width']
}
```

### **2. AboutMeModal anpassen:**
```typescript
// Statt MarkdownParser:
const detailLayout = sectionLayouts.aboutMe?.detailLayout || 'sidebar-left'

// Render Blocks statt Markdown:
const renderBlocks = (blocks: AboutBlock[]) => {
  return blocks.map(block => {
    switch (block.type) {
      case 'heading':
        return <h{block.level}>{block.content}</h{block.level}>
      case 'text':
        return <p>{block.content}</p>
      case 'list':
        return <ul>{block.items.map(item => <li>{item}</li>)}</ul>
      // ...
    }
  })
}

// DetailLayoutRenderer verwenden:
<DetailLayoutRenderer
  layout={detailLayout}
  content={renderAboutContent(aboutData)}
  sidebar={renderSidebar(aboutData.sections)}
/>
```

### **3. Block Renderer:**
- Neue Component: `AboutBlockRenderer.tsx`
- Rendert alle Block Types (Heading, Text, List, Quote, Link, Image, Divider, Code)

---

## ✅ Zusammenfassung

**Was ändert sich:**
1. ❌ Kein Markdown mehr → ✅ Strukturiertes JSON
2. ❌ MarkdownParser → ✅ Block Renderer
3. ❌ `userData.aboutMe.content` → ✅ `aboutData` (aus about.json)
4. ❌ Eigene Sidebar → ✅ DetailLayoutRenderer (optional)
5. ❌ `userData.socialLinks` → ✅ `aboutData.socialLinks`

**Default:**
- Wenn DetailLayoutRenderer: `sidebar-left` (wie Projects)
- Wenn eigene Implementierung: Aktuelles Layout bleibt

**Empfehlung:**
- ✅ DetailLayoutRenderer verwenden (konsistent)
- ✅ Section Layout Config aktivieren (`supportsDetailLayout: true`)

