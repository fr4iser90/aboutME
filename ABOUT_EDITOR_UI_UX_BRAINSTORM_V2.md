# 🎨 UI/UX Brainstorm: About.json Editor (OHNE MARKDOWN!)

## ⚠️ WICHTIG: KEIN MARKDOWN!
- about.json ist **strukturiertes JSON**
- Direkte Felder, keine Markdown-Parsing
- Klare Datenstruktur

---

## 📋 Aktuelle about.json Struktur

```json
{
  "content": "# About Me\n\nAdd your about me content here...",
  "htmlContent": null,
  "metadata": {
    "lastModified": "2025-11-21T20:55:32.702Z",
    "generatedBy": "setup-wizard"
  }
}
```

**Problem:** `content` ist noch Markdown-String! ❌

**Lösung:** Strukturiertes JSON mit klaren Feldern! ✅

---

## 🎯 NEUE about.json Struktur (Vorschlag)

```json
{
  "header": {
    "title": "About Me",
    "subtitle": "Your tagline or short description"
  },
  "sections": [
    {
      "id": "introduction",
      "type": "text",
      "title": "Introduction",
      "content": "Hi, ich bin Patrick 👋\nI'm hobbyist. just vibe coding ;D"
    },
    {
      "id": "experience",
      "type": "text",
      "title": "Experience",
      "content": "I have been coding for..."
    },
    {
      "id": "skills-highlight",
      "type": "skills",
      "title": "Top Skills",
      "skills": ["JavaScript", "TypeScript", "React"]
    }
  ],
  "socialLinks": {
    "github": "https://github.com/fr4iser90",
    "twitter": null,
    "linkedin": null,
    "website": null,
    "email": null
  },
  "contact": {
    "email": "your@email.com",
    "location": "City, Country",
    "timezone": "UTC+1"
  },
  "metadata": {
    "lastModified": "2025-11-21T20:55:32.702Z",
    "generatedBy": "setup-wizard"
  }
}
```

---

## 🎯 Option 1: **Section-basierter Block-Editor** (Empfohlen)

### Konzept: Strukturierte Sections, keine Markdown!

```
┌─────────────────────────────────────────────────┐
│ 📝 About Me Editor                               │
├─────────────────────────────────────────────────┤
│                                                  │
│ ┌───────────────────────────────────────────┐ │
│ │ Header                                     │ │
│ │ ┌─────────────────────────────────────┐   │ │
│ │ │ Title: [About Me            ]        │   │ │
│ │ │ Subtitle: [Your tagline     ]        │   │ │
│ │ └─────────────────────────────────────┘   │ │
│ └───────────────────────────────────────────┘ │
│                                                  │
│ ┌───────────────────────────────────────────┐ │
│ │ Sections                                   │ │
│ │                                            │ │
│ │ ┌─────────────────────────────────────┐ │ │
│ │ │ Section: Introduction                │ │ │
│ │ │ Type: [Text ▼]                       │ │ │
│ │ │ Title: [Introduction        ]        │ │ │
│ │ │ ┌───────────────────────────────┐   │ │ │
│ │ │ │ Content:                       │   │ │ │
│ │ │ │ [Text Area - Plain Text]       │   │ │ │
│ │ │ │ Hi, ich bin Patrick 👋         │   │ │ │
│ │ │ │ I'm hobbyist. just vibe...     │   │ │ │
│ │ │ └───────────────────────────────┘   │ │ │
│ │ │ [↑] [↓] [✏️] [🗑️]                    │ │ │
│ │ └─────────────────────────────────────┘ │ │
│ │                                            │ │
│ │ ┌─────────────────────────────────────┐ │ │
│ │ │ Section: Experience                 │ │ │
│ │ │ Type: [Text ▼]                     │ │ │
│ │ │ Title: [Experience        ]         │ │ │
│ │ │ ┌───────────────────────────────┐ │ │ │
│ │ │ │ Content:                       │   │ │ │
│ │ │ │ [Text Area]                    │   │ │ │
│ │ │ └───────────────────────────────┘ │ │ │
│ │ │ [↑] [↓] [✏️] [🗑️]                    │ │ │
│ │ └─────────────────────────────────────┘ │ │
│ │                                            │ │
│ │ [+ Add Section]                            │ │
│ │   └─ [Text] [Skills] [Contact] [Image]     │ │
│ └───────────────────────────────────────────┘ │
│                                                  │
│ ┌───────────────────────────────────────────┐ │
│ │ Social Links                               │ │
│ │ ☑ GitHub: [https://github.com/...]        │ │
│ │ ☐ Twitter: [________________]              │ │
│ │ ☐ LinkedIn: [________________]              │ │
│ │ ☐ Website: [________________]               │ │
│ │ ☐ Email: [________________]                │ │
│ └───────────────────────────────────────────┘ │
│                                                  │
│ ┌───────────────────────────────────────────┐ │
│ │ Contact Info                               │ │
│ │ Email: [your@email.com]                    │ │
│ │ Location: [City, Country]                   │ │
│ │ Timezone: [UTC+1]                          │ │
│ └───────────────────────────────────────────┘ │
│                                                  │
│ [💾 Save] [👁️ Preview] [↩️ Cancel]              │
└─────────────────────────────────────────────────┘
```

**Section Types:**
- **Text** - Plain Text Area (kein Markdown!)
- **Skills** - Skill-Liste mit Tags
- **Contact** - Kontakt-Informationen
- **Image** - Bild-Upload
- **Links** - Externe Links

**Features:**
- ✅ Drag & Drop Sections
- ✅ Plain Text Areas (kein Markdown!)
- ✅ Section-Types auswählbar
- ✅ Live Preview (rendert JSON direkt)
- ✅ Social Links als separates Formular
- ✅ Contact Info als separates Formular

---

## 🎯 Option 2: **Tab-basierter Formular-Editor**

### Konzept: Strukturierte Tabs, Plain Text Fields

```
┌─────────────────────────────────────────────────┐
│ 📝 About Me Editor                               │
├─────────────────────────────────────────────────┤
│ [Header] [Sections] [Social] [Contact] [Preview] │
├─────────────────────────────────────────────────┤
│                                                  │
│ Header Tab:                                      │
│ ┌───────────────────────────────────────────┐   │
│ │ Title: [About Me            ]              │   │
│ │ Subtitle: [Your tagline     ]              │   │
│ └───────────────────────────────────────────┘   │
│                                                  │
│ Sections Tab:                                    │
│ ┌───────────────────────────────────────────┐   │
│ │ Section 1:                                 │   │
│ │ Type: [Text ▼]                            │   │
│ │ Title: [Introduction        ]              │   │
│ │ Content: [Text Area - Plain Text]          │   │
│ │                                            │   │
│ │ [+ Add Section]                            │   │
│ └───────────────────────────────────────────┘   │
│                                                  │
│ Social Tab:                                      │
│ ┌───────────────────────────────────────────┐   │
│ │ ☑ GitHub: [https://github.com/...]        │   │
│ │ ☐ Twitter: [________________]              │   │
│ │ ☐ LinkedIn: [________________]              │   │
│ │ ☐ Website: [________________]               │   │
│ │ ☐ Email: [________________]                │   │
│ └───────────────────────────────────────────┘   │
│                                                  │
│ [💾 Save] [👁️ Preview]                          │
└─────────────────────────────────────────────────┘
```

**Features:**
- ✅ Klare Tab-Struktur
- ✅ Plain Text Fields (kein Markdown!)
- ✅ Section-Management
- ✅ Preview Tab zeigt gerendertes Ergebnis

---

## 🎯 Option 3: **Wizard-basierter Editor**

### Konzept: Schritt-für-Schritt, strukturierte Felder

```
┌─────────────────────────────────────────────────┐
│ 📝 About Me Editor - Step 1/5                    │
├─────────────────────────────────────────────────┤
│                                                  │
│ ┌───────────────────────────────────────────┐ │
│ │ Step 1: Header                            │ │
│ │ ┌─────────────────────────────────────┐   │ │
│ │ │ Title: [About Me            ]        │   │ │
│ │ │ Subtitle: [Your tagline     ]        │   │ │
│ │ └─────────────────────────────────────┘   │ │
│ └───────────────────────────────────────────┘ │
│                                                  │
│ [Next →]                                         │
│                                                  │
│ Progress: [████░░░░] 20%                        │
└─────────────────────────────────────────────────┘

Step 2: Introduction
Step 3: Additional Sections (optional)
Step 4: Social Links
Step 5: Contact Info
```

**Features:**
- ✅ Guided Experience
- ✅ Plain Text Fields
- ✅ Optional Sections
- ✅ Progress Indicator

---

## 🎯 Option 4: **Card-basierter Editor**

### Konzept: Jede Section = Card, drag & drop

```
┌─────────────────────────────────────────────────┐
│ 📝 About Me Editor                               │
├─────────────────────────────────────────────────┤
│                                                  │
│ ┌───────────────────────────────────────────┐ │
│ │ Header Card                                │ │
│ │ ┌─────────────────────────────────────┐   │ │
│ │ │ Title: [About Me            ]        │   │ │
│ │ │ Subtitle: [Your tagline     ]        │   │ │
│ │ └─────────────────────────────────────┘   │ │
│ └───────────────────────────────────────────┘ │
│                                                  │
│ ┌───────────────────────────────────────────┐ │
│ │ 📝 Introduction                           │ │
│ │ ┌─────────────────────────────────────┐   │ │
│ │ │ [Text Area - Plain Text]            │   │ │
│ │ │ Hi, ich bin Patrick 👋              │   │ │
│ │ │ I'm hobbyist. just vibe coding...   │   │ │
│ │ └─────────────────────────────────────┘   │ │
│ │ [↑] [↓] [⚙️] [🗑️]                            │ │
│ └───────────────────────────────────────────┘ │
│                                                  │
│ ┌───────────────────────────────────────────┐ │
│ │ [+ Add Section]                            │ │
│ │   [Text] [Skills] [Contact] [Image]        │ │
│ └───────────────────────────────────────────┘ │
│                                                  │
│ ┌───────────────────────────────────────────┐ │
│ │ 🔗 Social Links                             │ │
│ │ ☑ GitHub: [https://github.com/...]        │ │
│ │ ☐ Twitter: [________________]              │ │
│ │ ☐ LinkedIn: [________________]              │ │
│ └───────────────────────────────────────────┘ │
│                                                  │
│ [💾 Save] [👁️ Preview]                          │
└─────────────────────────────────────────────────┘
```

**Features:**
- ✅ Card-basiert (visuell klar)
- ✅ Drag & Drop Cards
- ✅ Plain Text Areas
- ✅ Section Settings pro Card

---

## 🎯 **Empfehlung: Option 1 (Section-basierter Block-Editor)**

### **Warum?**
- ✅ Strukturiert (kein Markdown!)
- ✅ Flexibel (verschiedene Section-Types)
- ✅ Intuitiv (Drag & Drop)
- ✅ Wiederverwendbar (für Skills, etc.)

### **Section Types:**

#### **1. Text Section**
```json
{
  "id": "introduction",
  "type": "text",
  "title": "Introduction",
  "content": "Plain text content here - NO MARKDOWN!"
}
```

#### **2. Skills Section**
```json
{
  "id": "top-skills",
  "type": "skills",
  "title": "Top Skills",
  "skills": ["JavaScript", "TypeScript", "React"]
}
```

#### **3. Contact Section**
```json
{
  "id": "contact",
  "type": "contact",
  "title": "Contact",
  "email": "your@email.com",
  "location": "City, Country",
  "timezone": "UTC+1"
}
```

#### **4. Links Section**
```json
{
  "id": "links",
  "type": "links",
  "title": "Links",
  "links": [
    { "label": "Portfolio", "url": "https://..." },
    { "label": "Blog", "url": "https://..." }
  ]
}
```

#### **5. Image Section**
```json
{
  "id": "profile-image",
  "type": "image",
  "title": "Profile Image",
  "imageUrl": "/data/about/profile.jpg",
  "alt": "Profile picture"
}
```

---

## 🎨 **UI/UX Features:**

### **1. Section Editor (pro Section)**
```
┌─────────────────────────────────────────┐
│ Section: Introduction          [✏️] [🗑️] │
├─────────────────────────────────────────┤
│ Type: [Text ▼]                          │
│ Title: [Introduction        ]            │
│                                          │
│ Content:                                 │
│ ┌─────────────────────────────────────┐ │
│ │ [Plain Text Area]                    │ │
│ │ Hi, ich bin Patrick 👋              │ │
│ │ I'm hobbyist. just vibe coding...   │ │
│ │                                      │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ Character Count: 156                     │
└─────────────────────────────────────────┘
```

### **2. Section Type Selector**
```
[+ Add Section]
  ├─ 📝 Text Section
  ├─ 🛠️ Skills Section
  ├─ 📧 Contact Section
  ├─ 🔗 Links Section
  └─ 🖼️ Image Section
```

### **3. Drag & Drop**
- Sections können verschoben werden
- Visual Feedback beim Dragging
- Drop-Zones klar markiert

### **4. Live Preview**
- Zeigt gerendertes Ergebnis
- Auto-refresh bei Änderungen
- Section-basierte Navigation

---

## 📝 **Was sollte ein User in About Me haben können?**

### **Essentials (Muss):**
1. **Header** - Title & Subtitle
2. **Introduction** - Kurze Vorstellung (2-3 Sätze)
3. **Social Links** - GitHub, Twitter, LinkedIn, Website, Email
4. **Contact Info** - Email, Location, Timezone

### **Wichtig (Sollte):**
5. **Experience/Background** - Berufserfahrung, Werdegang
6. **Skills Highlight** - Top 5-10 Skills
7. **Education** - Ausbildung, Studium
8. **Current Focus** - Woran arbeitest du gerade?

### **Optional (Kann):**
9. **Interests/Hobbies** - Persönliche Interessen
10. **Achievements** - Awards, Certificates, Milestones
11. **Projects Highlight** - Top 3 Projekte
12. **Testimonials** - Empfehlungen von anderen
13. **Timeline** - Lebenslauf-Timeline
14. **Links** - Externe Links (Portfolio, Blog, etc.)
15. **Image/Gallery** - Profilbild, Fotos
16. **Call-to-Action** - "Hire me", "Contact me", etc.

---

## 🎯 **Formatierung innerhalb von Sections**

### **Problem:** User will Headers/Abschnitte innerhalb einer Section

### **Lösung 1: Rich Text Editor (OHNE Markdown!)**
- Rich Text mit Toolbar (Bold, Italic, Headers, Lists)
- Speichert als HTML oder strukturiertes JSON
- WYSIWYG-Editor

### **Lösung 2: Strukturierte Sub-Sections**
- Section kann Sub-Sections enthalten
- Jede Sub-Section hat Title + Content
- Verschachtelte Struktur

### **Lösung 3: Block-basierte Content (innerhalb Section)**
- Section enthält Blocks (Heading, Text, List, etc.)
- Blocks können verschoben werden
- Wie Notion innerhalb einer Section

---

## 🎯 **Empfehlung: Lösung 3 (Block-basierte Content)**

### **Warum?**
- ✅ Flexibel (Headers, Text, Lists, etc.)
- ✅ Strukturiert (kein Markdown!)
- ✅ Intuitiv (Drag & Drop)
- ✅ Erweiterbar

### **Struktur:**

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
        {
          "id": "block-1",
          "type": "heading",
          "level": 2,
          "content": "Who I Am"
        },
        {
          "id": "block-2",
          "type": "text",
          "content": "Hi, ich bin Patrick 👋\nI'm hobbyist. just vibe coding ;D"
        },
        {
          "id": "block-3",
          "type": "heading",
          "level": 3,
          "content": "What I Do"
        },
        {
          "id": "block-4",
          "type": "text",
          "content": "I build web applications..."
        },
        {
          "id": "block-5",
          "type": "list",
          "style": "bullet",
          "items": [
            "Frontend Development",
            "Backend Development",
            "DevOps"
          ]
        }
      ]
    }
  ]
}
```

### **Block Types innerhalb einer Section:**

1. **Heading** - H1, H2, H3, H4
2. **Text** - Plain Text (mehrzeilig)
3. **List** - Bullet oder Numbered
4. **Quote** - Zitat
5. **Link** - Externer Link
6. **Image** - Bild innerhalb Section
7. **Divider** - Trennlinie
8. **Code** - Code-Snippet (optional)

---

## 🎨 **UI: Section mit Block-Editor**

```
┌─────────────────────────────────────────────┐
│ Section: Introduction              [✏️] [🗑️] │
├─────────────────────────────────────────────┤
│ Type: [Text ▼]                              │
│ Title: [Introduction        ]                │
│                                              │
│ Content Blocks:                              │
│ ┌─────────────────────────────────────────┐ │
│ │ Block: Heading (H2)            [↑][↓][🗑️]│ │
│ │ ┌───────────────────────────────┐       │ │
│ │ │ Level: [H2 ▼]                 │       │ │
│ │ │ Content: [Who I Am    ]       │       │ │
│ │ └───────────────────────────────┘       │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ ┌─────────────────────────────────────────┐ │
│ │ Block: Text                    [↑][↓][🗑️]│ │
│ │ ┌───────────────────────────────┐       │ │
│ │ │ [Text Area - Plain Text]      │       │ │
│ │ │ Hi, ich bin Patrick 👋        │       │ │
│ │ │ I'm hobbyist. just vibe...    │       │ │
│ │ └───────────────────────────────┘       │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ ┌─────────────────────────────────────────┐ │
│ │ Block: Heading (H3)            [↑][↓][🗑️]│ │
│ │ ┌───────────────────────────────┐       │ │
│ │ │ Level: [H3 ▼]                 │       │ │
│ │ │ Content: [What I Do   ]       │       │ │
│ │ └───────────────────────────────┘       │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ [+ Add Block]                                │
│   ├─ 📝 Heading                              │
│   ├─ 📄 Text                                 │
│   ├─ • List                                  │
│   ├─ 💬 Quote                                │
│   ├─ 🔗 Link                                 │
│   ├─ 🖼️ Image                                │
│   ├─ ➖ Divider                               │
│   └─ 💻 Code                                 │
└─────────────────────────────────────────────┘
```

---

## 🎯 **Alternative: Rich Text Editor (einfacher)**

### **Wenn Blocks zu komplex sind:**

```
┌─────────────────────────────────────────────┐
│ Section: Introduction              [✏️] [🗑️] │
├─────────────────────────────────────────────┤
│ Type: [Text ▼]                              │
│ Title: [Introduction        ]                │
│                                              │
│ Content:                                     │
│ [B] [I] [U] [H2] [H3] [•] [🔗] [📷]         │
│ ┌─────────────────────────────────────────┐ │
│ │ [Rich Text Editor]                      │ │
│ │                                         │ │
│ │ About Me                                │ │
│ │                                         │ │
│ │ Hi, ich bin Patrick 👋                  │ │
│ │ I'm hobbyist. just vibe coding ;D       │ │
│ │                                         │ │
│ │ What I Do                               │ │
│ │                                         │ │
│ │ I build web applications...             │ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ Speichert als: HTML oder strukturiertes JSON│
└─────────────────────────────────────────────┘
```

**Vorteil:** Einfacher, weniger Code
**Nachteil:** Weniger strukturiert, HTML muss geparst werden

---

## 🎯 **Finale Empfehlung:**

### **Für About Me:**

**Option A: Blocks innerhalb Sections** (flexibler)
- Section hat Title
- Section enthält Blocks (Heading, Text, List, etc.)
- Blocks können verschoben werden
- Strukturiertes JSON

**Option B: Rich Text pro Section** (einfacher)
- Section hat Title
- Section hat Rich Text Content
- Toolbar für Formatierung
- Speichert als HTML

### **Eigene Sections adden:**
- ✅ JA! User sollte eigene Sections erstellen können
- Section-Type auswählen (Text, Skills, Contact, etc.)
- Custom Title
- Custom Content

### **Formatierung innerhalb Sections:**
- ✅ JA! Headers/Abschnitte möglich
- Entweder: Blocks (Heading + Text Blocks)
- Oder: Rich Text Editor mit Headers

---

## 📋 **Beispiel: Vollständige About Me Struktur**

```json
{
  "header": {
    "title": "About Me",
    "subtitle": "Full Stack Developer & Hobbyist"
  },
  "sections": [
    {
      "id": "introduction",
      "type": "text",
      "title": "Introduction",
      "blocks": [
        {
          "type": "heading",
          "level": 2,
          "content": "Who I Am"
        },
        {
          "type": "text",
          "content": "Hi, ich bin Patrick 👋\nI'm hobbyist. just vibe coding ;D"
        },
        {
          "type": "heading",
          "level": 3,
          "content": "What I Do"
        },
        {
          "type": "text",
          "content": "I build web applications..."
        }
      ]
    },
    {
      "id": "experience",
      "type": "text",
      "title": "Experience",
      "blocks": [
        {
          "type": "text",
          "content": "I have been coding for 5 years..."
        }
      ]
    },
    {
      "id": "top-skills",
      "type": "skills",
      "title": "Top Skills",
      "skills": ["JavaScript", "TypeScript", "React"]
    },
    {
      "id": "custom-section",
      "type": "text",
      "title": "My Custom Section",
      "blocks": [
        {
          "type": "text",
          "content": "Custom content here..."
        }
      ]
    }
  ],
  "socialLinks": {
    "github": "https://github.com/fr4iser90",
    "twitter": null,
    "linkedin": null,
    "website": null,
    "email": null
  }
}
```

---

## 🎨 **UI Flow:**

1. **User klickt "Add Section"**
   - Wählt Type: Text, Skills, Contact, etc.
   - Gibt Title ein
   - Section wird erstellt

2. **User bearbeitet Section**
   - Bei Text-Section: Block-Editor öffnet
   - User kann Blocks hinzufügen (Heading, Text, List, etc.)
   - Blocks können verschoben werden

3. **User formatiert Content**
   - Innerhalb Text-Block: Plain Text (kein Markdown!)
   - Headers sind separate Blocks
   - Lists sind separate Blocks

---

**Was denkst du? Blocks innerhalb Sections oder Rich Text Editor?**

---

## 🎯 **Für Skills.json:**

### **Struktur:**
```json
{
  "categories": [
    {
      "id": "frontend",
      "name": "Frontend",
      "skills": [
        { "name": "JavaScript", "level": "advanced" },
        { "name": "TypeScript", "level": "intermediate" }
      ]
    }
  ]
}
```

### **UI:**
- Category-basierte Gruppierung
- Skill-Liste pro Category
- Level-Slider (Beginner/Intermediate/Advanced)
- Icon-Picker pro Skill
- Drag & Drop für Reihenfolge

---

## 🎯 **Für User.json:**

### **Struktur:**
```json
{
  "name": "Patrick B.",
  "bio": "I'm hobbyist. just vibe coding ;D",
  "avatar": "/data/user/avatar.jpg",
  "location": "City, Country",
  "timezone": "UTC+1"
}
```

### **UI:**
- Einfaches Formular
- Avatar Upload
- Basic Info Fields
- Social Links (könnte aus about.json kommen)

---

## 🚀 **Implementierung:**

### **Phase 1: About Editor (MVP)**
- Section-basierter Editor
- 2-3 Section Types (Text, Skills, Contact)
- Basic Drag & Drop
- Plain Text Areas (KEIN MARKDOWN!)

### **Phase 2: Erweiterte Features**
- Mehr Section Types (Links, Image)
- Section Templates
- Live Preview
- Validation

### **Phase 3: Andere Content-Types**
- Skills Editor
- User Editor

---

## ✅ **Wichtig: KEIN MARKDOWN!**

- ❌ Kein Markdown-Parsing
- ❌ Kein Markdown-Editor
- ❌ Keine Markdown-Syntax
- ✅ Plain Text Areas
- ✅ Strukturierte JSON-Felder
- ✅ Direkte Datenstruktur

---

**Was denkst du? Section-basierter Editor mit Plain Text?**

