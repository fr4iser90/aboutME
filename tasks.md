# DDD Restructuring Tasks

## 1. Directory Structure
```bash
frontend/
├── config/
├── Dockerfile
├── jsconfig.json
├── next.config.js
├── next-env.d.ts
├── package.json
├── package-lock.json
├── postcss.config.js
├── public/
│   └── profile.jpg
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/
│   │   │   ├── AdminContext.tsx
│   │   │   ├── components/
│   │   │   │   ├── CopilotChat.tsx
│   │   │   │   └── ProjectEditor.tsx
│   │   │   ├── layout/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── projects/
│   │   │   │   └── page.tsx
│   │   │   └── skills/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   │   ├── layout/
│   │   │   │   ├── projects/
│   │   │   │   └── skills/
│   │   │   └── public/
│   │   │       ├── layout/
│   │   │       ├── projects/
│   │   │       └── skills/
│   │   ├── layout.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── page.tsx
│   │   ├── projects/
│   │   │   └── page.tsx
│   │   ├── public/
│   │   │   ├── layout/
│   │   │   ├── projects/
│   │   │   └── skills/
│   │   └── skills/
│   │       └── page.tsx
│   ├── domain/           # Business Logic & Entities
│   │   ├── entities/     # Domain Models
│   │   │   ├── Project.ts
│   │   │   ├── Skill.ts
│   │   │   └── Theme.ts
│   │   ├── repositories/ # Repository Interfaces
│   │   │   ├── ProjectRepository.ts
│   │   │   └── SkillRepository.ts
│   │   ├── services/     # Domain Services
│   │   └── shared/       # Shared Domain Stuff
│   │       ├── constants/
│   │       ├── styles/
│   │       ├── types/
│   │       ├── ui/
│   │       └── utils/
│   ├── application/      # Use Cases & Application Logic
│   │   ├── admin/       # Admin Use Cases
│   │   │   ├── layout/
│   │   │   ├── projects/
│   │   │   │   └── useProjects.ts
│   │   │   ├── sections/
│   │   │   ├── skills/
│   │   │   │   └── useSkills.ts
│   │   │   └── themes/
│   │   └── public/      # Public Use Cases
│   │       ├── layout/
│   │       ├── projects/
│   │       │   └── useProjects.ts
│   │       ├── sections/
│   │       ├── skills/
│   │       │   └── useSkills.ts
│   │       └── themes/
│   ├── infrastructure/   # External Services & Implementation
│   │   ├── api/         # API Clients
│   │   │   ├── admin/
│   │   │   │   ├── projects.ts
│   │   │   │   └── skills.ts
│   │   │   └── public/
│   │   │       ├── projects.ts
│   │   │       └── skills.ts
│   │   ├── storage/
│   │   └── ui/
│   ├── middleware.ts
│   ├── presentation/    # UI Components
│   │   ├── admin/       # Admin UI
│   │   │   ├── components/
│   │   │   │   ├── features/
│   │   │   │   │   └── projects/
│   │   │   │   ├── GitHubSyncButton.tsx
│   │   │   │   ├── ProjectEditor.tsx
│   │   │   │   ├── ProjectForm.tsx
│   │   │   │   ├── ProjectImportPanel.tsx
│   │   │   │   ├── ProjectList.tsx
│   │   │   │   ├── ProjectModal.tsx
│   │   │   │   ├── sections/
│   │   │   │   ├── shared/
│   │   │   │   │   └── ui/
│   │   │   │   └── SkillForm.tsx
│   │   │   ├── hooks/
│   │   │   └── pages/
│   │   │       ├── AdminProjectsPage.tsx
│   │   │       ├── AdminSkillsPage.tsx
│   │   │       ├── api/
│   │   │       │   ├── admin/
│   │   │       │   │   ├── layout/
│   │   │       │   │   ├── projects/
│   │   │       │   │   ├── sections/
│   │   │       │   │   ├── skills/
│   │   │       │   │   └── themes/
│   │   │       │   └── public/
│   │   │       │       ├── layout/
│   │   │       │       ├── projects/
│   │   │       │       ├── sections/
│   │   │       │       ├── skills/
│   │   │       │       └── themes/
│   │   │       ├── components/
│   │   │       ├── layout/
│   │   │       ├── projects/
│   │   │       ├── sections/
│   │   │       ├── skills/
│   │   │       └── themes/
│   │   ├── public/      # Public UI
│   │   │   ├── components/
│   │   │   │   ├── features/
│   │   │   │   │   └── projects/
│   │   │   │   ├── layout/
│   │   │   │   │   └── Navbar.tsx
│   │   │   │   ├── ProjectCard.tsx
│   │   │   │   ├── ProjectModal.tsx
│   │   │   │   ├── sections/
│   │   │   │   │   ├── About.tsx
│   │   │   │   │   ├── Angeln.tsx
│   │   │   │   │   ├── Homelab.tsx
│   │   │   │   │   ├── NixOS.tsx
│   │   │   │   │   ├── Pflege.tsx
│   │   │   │   │   ├── ProjectCard.tsx
│   │   │   │   │   ├── Projects.tsx
│   │   │   │   │   └── Skills.tsx
│   │   │   │   ├── shared/
│   │   │   │   │   ├── ui/
│   │   │   │   │   └── utils/
│   │   │   │   ├── SkillCard.tsx
│   │   │   │   └── ui/
│   │   │   ├── hooks/
│   │   │   └── pages/
│   │   │       ├── admin/
│   │   │       │   └── projects/
│   │   │       ├── api/
│   │   │       │   ├── admin/
│   │   │       │   │   ├── github/
│   │   │       │   │   │   └── route.ts
│   │   │       │   │   └── projects/
│   │   │       │   │       └── route.ts
│   │   │       │   ├── auth/
│   │   │       │   │   └── validate/
│   │   │       │   │       └── route.ts
│   │   │       │   ├── contact/
│   │   │       │   │   └── route.ts
│   │   │       │   ├── layout/
│   │   │       │   │   └── route.ts
│   │   │       │   ├── projects/
│   │   │       │   │   └── route.ts
│   │   │       │   ├── public/
│   │   │       │   │   ├── layout/
│   │   │       │   │   ├── projects/
│   │   │       │   │   ├── sections/
│   │   │       │   │   ├── skills/
│   │   │       │   │   └── themes/
│   │   │       │   ├── sections/
│   │   │       │   │   └── route.ts
│   │   │       │   ├── skills/
│   │   │       │   │   └── route.ts
│   │   │       │   └── themes/
│   │   │       │       └── route.ts
│   │   │       ├── layout/
│   │   │       ├── layout.tsx
│   │   │       ├── login/
│   │   │       │   └── page.tsx
│   │   │       ├── page.tsx
│   │   │       ├── projects/
│   │   │       ├── ProjectsPage.tsx
│   │   │       ├── sections/
│   │   │       ├── skills/
│   │   │       ├── SkillsPage.tsx
│   │   │       └── themes/
│   │   └── shared/
│   │       ├── styles/
│   │       └── ui/
│   │           ├── accordion.tsx
│   │           ├── alert-dialog.tsx
│   │           ├── alert.tsx
│   │           ├── aspect-ratio.tsx
│   │           ├── avatar.tsx
│   │           ├── badge.tsx
│   │           ├── button.tsx
│   │           ├── card.tsx
│   │           ├── dialog.tsx
│   │           ├── dropdown-menu.tsx
│   │           ├── hover-card.tsx
│   │           ├── input.tsx
│   │           ├── label.tsx
│   │           ├── menubar.tsx
│   │           ├── navigation-menu.tsx
│   │           ├── pagination.tsx
│   │           ├── popover.tsx
│   │           ├── progress.tsx
│   │           ├── radio-group.tsx
│   │           ├── resizable.tsx
│   │           ├── scroll-area.tsx
│   │           ├── select.tsx
│   │           ├── separator.tsx
│   │           ├── sheet.tsx
│   │           ├── switch.tsx
│   │           ├── tabs.tsx
│   │           ├── textarea.tsx
│   │           ├── toaster.tsx
│   │           ├── toast.tsx
│   │           ├── tooltip.tsx
│   │           └── use-toast.ts
│   └── shared/
│       ├── constants/
│       │   └── globals.css
│       ├── styles/
│       ├── types/
│       │   └── project.ts
│       ├── ui/
│       └── utils/
│           ├── api.ts
│           └── config.ts
├── tailwind.config.js
├── tests/
└── types/
    └── heroicons.d.ts
```

## 2. File Moves & Imports
**ABSOLUTE RULE: DO NOT CHANGE ANY CODE LOGIC. ONLY PERFORM FILE MOVES AS SPECIFIED IN THE SCRIPT BELOW, AND UPDATE IMPORT PATHS. NO OTHER CODE MODIFICATIONS ARE ALLOWED UNLESS EXPLICITLY REQUESTED AS A SEPARATE TASK.**

**EXCEPTION TO "NEVER CREATE ANY NEW FILE": If `mv` commands move Next.js router files (layout.tsx, page.tsx) out of `src/app`, new wrapper files may need to be created in `src/app` to maintain functionality. This is the ONLY allowed file creation.**

```bash

## 3. Cleanup
- [ ] Remove empty directories
- [ ] Remove duplicate files
- [ ] Remove unused imports
- [ ] Fix any remaining linter errors

## 4. Verification
- [ ] Check all imports are correct
- [ ] Check all paths are correct
- [ ] Check no files are missing
- [ ] Check no files are duplicated
- [ ] Check no empty directories
- [ ] Check no linter errors 