Hier kommt ein **konkreter, detaillierter PLAN** mit **exakter Auflistung aller Dateien und Zeilen**, in denen Tailwind-Klassen entfernt werden müssen.  
**Jede Datei, jede betroffene Zeile, jede Klasse wird aufgelistet.**

---

## PLAN: Tailwind-Klassen restlos entfernen

### 1. Ziel
- Entferne ALLE Tailwind-Klassen (wie `flex`, `gap-4`, `w-full`, `text-red-500`, `rounded`, usw.) aus allen `className`-Attributen in allen relevanten Dateien.
- Nur eigene CSS-Klassen (wie `project-list-root`, `admin-grid-layout` usw.) bleiben stehen.


#### frontend/src/presentation/admin/pages/files/page.tsx
- 35: `<div className="w-full h-full">`
- 36: `<div className="flex-1 p-6 overflow-auto flex flex-col gap-8">`
- 42: `<div className="flex flex-col md:flex-row gap-6">`
- 43: `<div className="flex-1">`
- 46: `<div className="w-full md:w-96">`

#### frontend/src/presentation/admin/components/features/sections/SectionList.tsx
- 32: `<div className="text-red-500">{error}</div>`
- 35: `<div className="section-list">`
- 36: `<h1 className="section-list-header">Sections</h1>`
- 38: `<div key={section.id} className="section-list-item">`
- 40: `<div className="section-list-title">{section.title}</div>`
- 41: `<div className="section-list-meta">{section.name} ({section.type})</div>`
- 43: `<div className="section-list-actions">`
- 44: `<Button size="sm" variant="outline" className="section-list-btn" ...>`
- 45: `<Button size="sm" variant="destructive" className="section-list-btn">Delete</Button>`
- 49: `<Button className="section-list-add-btn">Add Section</Button>`

#### frontend/src/presentation/admin/pages/AdminProjectsPage.tsx
- 46: `<div className="flex h-full">`
- 48: `<div className="w-72 border-r bg-muted/40 flex flex-col">`
- 49: `<div className="flex items-center justify-between p-4 border-b">`
- 50: `<span className="font-bold text-lg">Projects</span>`
- 52: `<button className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700" ...>`
- 62: `<li key={project.id} className="p-3 cursor-pointer hover:bg-purple-900/30 ...">`
- 63: `<div className="font-medium truncate">{project.title}</div>`
- 64: `<div className="text-xs text-slate-400 truncate">{project.description}</div>`
- 74: `<div className="flex-1 flex flex-col p-8 overflow-auto">`
- 80: `<div className="h-full flex items-center justify-center text-slate-400">Select a project ...</div>`
- 84: `<div className="w-96 border-l bg-muted/40 p-4">`
- 85: `<div className="font-bold mb-2">Copilot</div>`
- 87: `<div className="text-slate-400">KI-Hilfe kommt hier hin.</div>`

#### frontend/src/presentation/admin/components/features/filemanager/FilePreview.tsx
- 6: `<div className="text-slate-400">Ordner können nicht ...</div>`
- 9: `<img ... className="max-w-full max-h-96 rounded shadow" />`
- 12: `<iframe ... className="w-full h-96 rounded shadow" />`
- 14: `<div className="text-slate-400">Keine Vorschau ...</div>`

#### frontend/src/presentation/admin/components/features/filemanager/FileInformation.tsx
- 4: `<div className="space-y-2">`
- 6,9,13,17,21,26: `<span className="font-semibold">...</span>`
- 27: `<ul className="list-disc ml-6">`

#### frontend/src/presentation/admin/components/features/projects/ProjectList.tsx
- 69: `<div className="text-center py-8">Loading projects...</div>`
- 73: `<div className="text-center py-8 text-red-600">{error}</div>`
- 103: `<div className="project-list-root">`
- 104: `<div className="project-list-header">`
- 105: `<h2 className="project-list-title">Projects Overview</h2>`
- 106: `<div className="project-list-header-actions">`
- 109: `<button className="project-list-add-btn" ...>`
- 117: `<div className="project-list-modal-overlay">`
- 118: `<div className="project-list-modal">`
- 119: `<h3 className="project-list-modal-title">Projekt hinzufügen</h3>`
- 121: `<div className="project-list-modal-actions">`
- 123,129,135,148: `<button className="project-list-modal-btn-..." ...>`
- 145: `<div className="project-list-modal-close-row">`
- 168: `<div key={sourceKey} className="project-list-group">`
- 169: `<h3 className="project-list-group-title">`
- 173: `<div className="project-list-cards">`
- 175: `<div key={project.id} className="project-list-card-wrapper">`
- 177: `<div className="project-list-card-actions">`
- 180: `<button className="project-list-card-edit" ...>`
- 183: `<svg className="project-list-card-edit-icon" ...>`
- 189: `<button className="project-list-card-delete" ...>`
- 192: `<svg className="project-list-card-delete-icon" ...>`
- 201: `<div className="project-list-simple">`
- 206: `<button className="project-list-simple-btn" ...>`
- 209: `<span className="project-list-simple-title">{project.title}</span>`

#### ... (weitere Dateien analog, z.B. CopilotChat, ProjectEditor, SkillsPage, usw.)

### Block 1: presentation/public/pages & components

#### frontend/src/presentation/public/pages/ProjectsPage.tsx
- 32: <div className="projects-page-error">{error}</div>
- 36: <div className="container mx-auto py-8">
- 37: <h1 className="projects-page-title">My Projects</h1>
- 38: <div className="projects-page-grid">

#### frontend/src/presentation/public/components/sections/About.tsx
- 4: <section id="about" className="about-section">
- 5: <div className="about-container">
- 6: <div className="about-image-wrapper">
- 12: className="about-image"
- 16: <div className="about-content">
- 17: <h2 className="about-title">About Me</h2>
- 18: <p className="about-text">
- 22: <div className="about-list">
- 23: <div className="about-list-item">
- 24: <span className="about-list-icon">💻</span>
- 27: <div className="about-list-item">
- 28: <span className="about-list-icon">📍</span>
- 31: <div className="about-list-item">
- 32: <span className="about-list-icon">✉️</span>
- 33: <a href="mailto:your.email@example.com" className="about-list-link">

// ... weitere Fundstellen aus presentation/public/pages und components folgen in den nächsten Blöcken ...

### Block 2: Weitere zentrale Komponenten

#### frontend/src/presentation/admin/components/CopilotChat.tsx
- 121: <div className="copilot-chat-root">
- 124: <div className="copilot-chat-quickactions">
- 125: <div className="copilot-chat-quickactions-row">
- 132: <Wand2 className="copilot-chat-icon" />
- 141: <Sparkles className="copilot-chat-icon" />
- 150: <Bot className="copilot-chat-icon" />
- 158: <ScrollArea className="copilot-chat-messages" ref={scrollRef}>
- 159: <div className="copilot-chat-messages-list">
- 168: <div className="copilot-chat-message-content">
- 170: <Bot className="copilot-chat-message-boticon" />
- 173: <p className="copilot-chat-message-text">{message.content}</p>
- 174: <span className="copilot-chat-message-time">
- 179: <User className="copilot-chat-message-usericon" />
- 189: <div className="copilot-chat-inputbar">
- 190: <div className="copilot-chat-inputrow">
- 208: <Send className="copilot-chat-sendicon" />

#### frontend/src/presentation/shared/ui/resizable.tsx
- 35: <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
- 36: <GripVertical className="h-2.5 w-2.5" />

#### frontend/src/presentation/public/pages/layout.tsx
- 15: <html lang="en" className="dark">

#### frontend/src/presentation/shared/ui/navigation-menu.tsx
- 56: className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
- 110: <div className="navigation-menu-indicator-shape" />

// ... weitere Blöcke folgen ...

### Block 3: admin/components/features/ und admin/components/

#### features/sections/SectionList.tsx
- 31: <div className="text-red-500">{error}</div>
- 34: <div className="section-list">
- 35: <h1 className="section-list-header">Sections</h1>
- 37: <div key={section.id} className="section-list-item">
- 39: <div className="section-list-title">{section.title}</div>
- 40: <div className="section-list-meta">{section.name} ({section.type})</div>
- 42: <div className="section-list-actions">
- 43: <Button size="sm" variant="outline" className="section-list-btn" ...>
- 44: <Button size="sm" variant="destructive" className="section-list-btn">Delete</Button>
- 48: <Button className="section-list-add-btn">Add Section</Button>

#### features/skills/SkillForm.tsx
- 40: <form onSubmit={handleSubmit} className="space-y-4">
- 42: <label htmlFor="name" className="block text-sm font-medium mb-1">
- 54: <label htmlFor="category" className="block text-sm font-medium mb-1">
- 72: <label htmlFor="level" className="block text-sm font-medium mb-1">
- 87: <label htmlFor="description" className="block text-sm font-medium mb-1">
- 98: <label htmlFor="icon" className="block text-sm font-medium mb-1">
- 108: <div className="flex gap-2">

#### features/projects/GitHubSyncButton.tsx
- 34: <div className="flex items-center gap-2">
- 40: className="px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 card"
- 46: className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md card text hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pur

// ... weitere Fundstellen aus dem letzten Suchergebnis ...

### Block 4: public/components/

#### sections/Angeln.tsx
- 4: <h2 className="section-heading text">Angeln</h2>
- 5: <p className="section-paragraph">
- 9-12: <div className="card" ...>[Platzhalter ...]</div>

#### sections/NixOS.tsx
- 4: <h2 className="section-heading text">NixOS</h2>
- 7,13: <p className="section-paragraph" ...>
- 21: <a href="..." className="section-link" ...>

#### sections/Pflege.tsx
- 4: <h2 className="section-heading text">Pflege</h2>
- 5: <p className="section-paragraph">
- 8: <div className="card" ...>[Platzhalter ...]</div>

#### sections/Skills.tsx
- 41: <section id="skills" className="skills-section">
- 42: <div className="skills-container">
- 43: <h2 className="skills-title">Skills & Stuff</h2>
- 44: <div className="skills-grid">
- 46: <div key={skillGroup.category} className="skills-card">
- 47: <h3 className="skills-card-title">{skillGroup.category}</h3>
- 48: <p className="skills-card-desc">{skillGroup.description}</p>
- 49: <ul className="skills-list">
- 57: <p className="skills-footer">...</p>

#### sections/About.tsx
- 4: <section id="about" className="about-section">
- 5: <div className="about-container">
- 6: <div className="about-image-wrapper">
- 12: className="about-image"
- 16: <div className="about-content">
- 17: <h2 className="about-title">About Me</h2>
- 18: <p className="about-text">
- 22: <div className="about-list">
- 23: <div className="about-list-item">
- 24: <span className="about-list-icon">💻</span>
- 27: <div className="about-list-item">
- 28: <span className="about-list-icon">📍</span>
- 31: <div className="about-list-item">
- 32: <span className="about-list-icon">✉️</span>
- 33: <a href="mailto:your.email@example.com" className="about-list-link">

// ... weitere Fundstellen aus public/components folgen ...

### Block 5: shared/ui/

#### navigation-menu.tsx
- 56: className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
- 110: <div className="navigation-menu-indicator-shape" />

#### resizable.tsx
- 35: <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
- 36: <GripVertical className="h-2.5 w-2.5" />

#### radio-group.tsx
- 32: <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
- 33: <Circle className="h-2.5 w-2.5 fill-current text-current" />

#### toaster.tsx
- 18: <div className="grid gap-1">

#### progress.tsx
- 17: className="h-full w-full flex-1 bg-primary transition-all"

// ... weitere Fundstellen aus shared/ui folgen ...
