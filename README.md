# 🚀 Portfolio Generator

Ein intelligenter Portfolio-Generator mit **zwei Architekturtypen**: **Backendless** (statisch) und **Dynamic** (mit Backend). Automatische GitHub-Daten-Scraping, intelligente Content-Erkennung und flexible Deployment-Optionen.

## ✨ Features

### 🎯 Core Features
- **GitHub Integration** - Automatisches Scraping von Repositories, Stars, Languages
- **Intelligente Content-Erkennung** - Blog-Posts werden automatisch erkannt
- **Admin Panel** - Complete content management system with glassmorphism design
- **Terminal Game** - Interaktives Terminal-Spiel mit Puzzle-System
- **Responsive Design** - Mobile-First, Dark/Light Theme
- **SEO Optimiert** - Meta Tags, Open Graph, Sitemap

### 🏗️ Zwei Architekturtypen

#### 🔧 Backendless Mode (Statisch)
- ✅ **Self-Hosted** - Läuft auf deinem eigenen Server
- ✅ **Kein Backend nötig** - Nur Frontend + JSON-Dateien
- ✅ **Sichere API Routes** - Next.js API Routes mit Path-Traversal Protection
- ✅ **File-System basiert** - Markdown → JSON Konvertierung
- ✅ **Docker Support** - Einfaches Deployment

#### ⚡ Dynamic Mode (Mit Backend)
- ✅ **Admin Panel** - Blog/Projekt Editor
- ✅ **Authentication** - NextAuth.js mit OAuth
- ✅ **Database** - SQLite/PostgreSQL
- ✅ **CRUD APIs** - Vollständige Content-Verwaltung
- ✅ **File Upload** - Bilder, Assets

## 🚀 Quick Start

### 1. Repository klonen
```bash
git clone https://github.com/fr4iser90/aboutME-static.git
cd aboutME-static
```

### 2. Environment konfigurieren
```bash
cp env.example .env
```

**Minimale Konfiguration (.env):**
```bash
# GitHub Integration (Required)
GITHUB_USERNAME=fr4iser90

# Feature Flags
ENABLE_CONTACT=true
ENABLE_GAME_TERMINAL=true


```

### 3. Dependencies installieren
```bash
npm install
```

### 4. GitHub-Daten generieren
```bash
npm run generate-data
```

### 5. Portfolio starten
```bash
# Backendless Mode
npm run dev

# Oder mit Docker
docker-compose up
```

## 📁 Projektstruktur

```
aboutME-static/
├── frontend/                 # Next.js Frontend
│   ├── src/
│   │   ├── app/            # App Router
│   │   ├── components/     # React Komponenten
│   │   ├── lib/           # Utilities & Config
│   │   └── themes/        # Theme System
│   └── public/data/        # Generierte JSON-Dateien
├── scripts/                # Data Generation Scripts
│   ├── data-generation/   # GitHub Scraping
│   ├── terminal-system/   # Terminal Game Setup
│   └── validation/        # Data Validation
├── portfolio.config.js    # Hauptkonfiguration
└── env.example           # Environment Template
```

## ⚙️ Konfiguration

### Environment Variables

#### 🔧 Backendless Mode (Default)
```bash
# GitHub Integration
GITHUB_USERNAME=fr4iser90
GITHUB_TOKEN=                    # Optional, für bessere Rate Limits

# Portfolio Basics (Auto-generated)
PORTFOLIO_TITLE=
PORTFOLIO_DESCRIPTION=
PORTFOLIO_AUTHOR=

# Feature Flags
ENABLE_CONTACT=true
ENABLE_GAME_TERMINAL=true

# Terminal Game Configuration
TERMINAL_HOSTNAME=portfolio-server
TERMINAL_USERNAME=guest
TERMINAL_PASSWORD=welcome123
TERMINAL_PASSWORD_HINT="Try common passwords"
TERMINAL_ROOTPASSWORD=admin2024
TERMINAL_ROOTPASSWORD_HINT="Year + admin"
```

#### ⚡ Dynamic Mode (Backend)
```bash
# Backend Features

ENABLE_AUTH=true


# Admin Users
ADMIN_USERS=admin@example.com

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### Portfolio Configuration

Die `portfolio.config.js` bietet umfangreiche Anpassungsmöglichkeiten:

```javascript
module.exports = {
  // GitHub Konfiguration
  github: {
    username: '',
    fetchOptions: {
      includeForks: false,
      minStars: 0,
      languages: [], // Leer = alle Sprachen
    }
  },

  // Features
  features: {
    projects: { enabled: true },
    skills: { enabled: true },
    blog: { enabled: true }, // Automatisch erkannt
    contact: { enabled: true },
    terminal: { enabled: true }
  },

  // SEO & Meta
  seo: {
    title: 'Patrick B. - Tech Enthusiast',
    description: 'Portfolio mit Leidenschaft für Technologie',
    keywords: ['portfolio', 'homelab', 'nixos']
  }
};
```

## 🎮 Terminal Game

Das Portfolio enthält ein interaktives Terminal-Spiel mit:

- **Puzzle-System** - Verschiedene Herausforderungen
- **Permission-System** - Realistische Unix-Permissions
- **Hidden Files** - Versteckte Inhalte entdecken
- **Progress Tracking** - Fortschritt speichern
- **Hint System** - Intelligente Hinweise

**Konfiguration:**
```bash
TERMINAL_HOSTNAME=portfolio-server
TERMINAL_USERNAME=guest
TERMINAL_PASSWORD=welcome123
TERMINAL_ROOTPASSWORD=admin2024
```

## 📝 Content Management

### Admin Panel (`/admin`)
A complete admin control panel with glassmorphism design:

#### 🎛️ Features
- **Dashboard** - Overview with stats, quick actions, and feature status
- **Feature Management** - Toggle all portfolio features (standard & optional)
- **Content Editor** - Edit projects, blog posts, and about page
- **Games Configurator** - Configure terminal game settings
- **Settings** - Portfolio title, description, author, GitHub username

#### 📊 Dashboard
- Real-time stats (projects, skills, blog posts)
- Feature overview with visual indicators
- Quick actions (Edit Content, Manage Features, View Portfolio, Settings)
- Recent activity feed

#### ⚙️ Feature Management
All features are toggleable:
- **Standard Features** (Default ON): Projects, Skills, About Me
- **Optional Features** (Default OFF): Blog, Contact, Auth, Games
- Complex features (Auth, Games) have dedicated configuration pages

#### 🎮 Games Configurator
Configure available games:
- **Terminal Game** ✅ (Active) - Full terminal configuration
- **Snake** 🐍 (Coming Soon)
- **Pacman** 👻 (Coming Soon)

#### 🎨 Design System
- Glassmorphism effects with blur and transparency
- Neon blue accent colors
- Responsive design (mobile, tablet, desktop)
- Smooth animations and transitions
- Galaxy background with radial gradients

### Access
```bash
# Navigate to admin panel
http://localhost:3000/admin

# Routes:
/admin              # Dashboard
/admin/features     # Feature Management
/admin/content      # Content Editor
/admin/features/games  # Games Configuration
/admin/settings     # Settings
```

### Backendless Mode
- **Markdown-Dateien** in `public/data/content/`
- **Automatische Erkennung** - Blog-Posts werden automatisch gefunden
- **Sichere API Routes** - Path-Traversal Protection
- **Build-Time Konvertierung** - Markdown → JSON

### Dynamic Mode
- **Admin Panel** unter `/admin`
- **WYSIWYG Editor** - Markdown mit Live Preview
- **File Upload** - Bilder und Assets
- **Database Storage** - Strukturierte Daten

## 🚀 Deployment

### Backendless Mode (Self-Hosted)

#### Docker (Empfohlen)
```bash
docker-compose up
# Läuft auf Port 3000
# Self-hosted auf deinem Server
```

#### Manuell
```bash
npm run build
npm start
# Läuft auf Port 3000
```

### Dynamic Mode (Self-Hosted)

#### Docker Compose
```bash
docker-compose -f docker-compose-server.yml up
# Mit PostgreSQL + Redis
# Vollständiges Backend auf deinem Server
```

#### Manuell
```bash
npm run build
npm run start:server
# Mit Database + Auth
```

## 🔧 Scripts

### Data Generation
```bash
# GitHub-Daten scrapen
npm run generate-data

# Nur Blog-Daten generieren
npm run generate-blog

# Terminal-System setup
npm run setup-terminal
```

### Development
```bash
# Development Server
npm run dev

# Build für Production
npm run build

# Type Checking
npm run type-check
```

### Validation
```bash
# Daten validieren
npm run validate-data

# Portfolio-Konfiguration testen
npm run test-config
```

## 🛡️ Sicherheit

### Backendless Mode
- **Path Traversal Protection** - Sichere Datei-Zugriffe
- **Slug Validation** - Nur erlaubte Zeichen
- **File Extension Checks** - Nur .md Dateien
- **Symlink Protection** - Verhindert Directory Traversal

### Dynamic Mode
- **NextAuth.js** - Sichere Authentication
- **CSRF Protection** - Cross-Site Request Forgery Schutz
- **Input Validation** - Alle Eingaben validiert
- **Rate Limiting** - API Rate Limits

## 🎨 Customization

### Themes
```javascript
// portfolio.config.js
theme: {
  enabled: true,
  defaultTheme: 'dark',
  themes: {
    dark: {
      primary: '#6366f1',
      background: '#0f0f23'
    },
    light: {
      primary: '#3b82f6',
      background: '#ffffff'
    }
  }
}
```

### Layout
```javascript
layout: {
  sections: {
    order: ['hero', 'about', 'projects', 'skills', 'blog', 'contact'],
    spacing: 'large'
  }
}
```

## 📊 Performance

- **Lazy Loading** - Bilder werden lazy geladen
- **Image Optimization** - Automatische Bild-Optimierung
- **Code Splitting** - Automatisches Code Splitting
- **Static Generation** - Pre-rendered Seiten
- **Self-Hosted Ready** - Optimiert für eigenen Server

## 🤝 Contributing

1. Fork das Repository
2. Erstelle einen Feature Branch (`git checkout -b feature/amazing-feature`)
3. Committe deine Änderungen (`git commit -m 'Add amazing feature'`)
4. Push zum Branch (`git push origin feature/amazing-feature`)
5. Öffne eine Pull Request

## 📄 License

Dieses Projekt ist unter der MIT License lizenziert - siehe [LICENSE](LICENSE) für Details.

## 👨‍💻 Author

**Patrick B.** - Tech Enthusiast & Homelab Enthusiast

- GitHub: [@fr4iser90](https://github.com/fr4iser90)
- Website: [fr4iser.com](https://fr4iser.com)

## 🙏 Acknowledgments

- Next.js für das großartige Framework
- GitHub API für die Daten
- Alle Open Source Contributors

---

**⭐ Star dieses Repository wenn es dir gefällt!**
