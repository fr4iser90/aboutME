-- Beispiel-Initialdaten für Sections
INSERT INTO sections (name, title, type, content, display_order) VALUES
  ('about', 'Über mich', 'text', '{"text": "Ich bin Gesundheits- und Krankenpfleger, KI- und Linux-Fan, Bastler und Angler aus Leipzig."}', 1),
  ('nixos', 'NixOS', 'text', '{"text": "Mein Weg zu NixOS begann mit Debian, dann 3 Wochen Walls, viel gebrickt, viel gelernt. Jetzt liebe ich die Flexibilität!"}', 2),
  ('homelab', 'Homelab', 'text', '{"text": "Hier findest du bald Fotos, Hardware-Setups und Automatisierungen aus meinem Homelab."}', 3),
  ('angeln', 'Angeln', 'text', '{"text": "Ich angle am liebsten an der Pleiße und Lauer in Leipzig – Ansitz auf Friedfisch und Aktivangeln im Sommer."}', 4),
  ('contact', 'Kontakt', 'text', '{"text": "Kontaktformular wird hier angezeigt."}', 5);

-- Beispiel-Initialdaten für Projects
-- These projects belong to the site owner.
INSERT INTO projects (name, description, status, details, source_url) VALUES
  ('2D Multiplayer Framework', 'Framework für 2D Multiplayer-Spiele, gebaut mit KI-Unterstützung.', 'WIP', '{"features": ["Netzwerk-Logik", "KI-Integration", "Dynamische Configs"]}', 'https://github.com/fr4iser90/2d-multiplayer-framework'),
  ('NixOSControlCenter', 'Webinterface zur Verwaltung von NixOS-Konfigurationen.', 'Done', '{"features": ["Hardware-Checks", "Generische Configs", "Rebuild per Klick"]}', 'https://github.com/fr4iser90/NixOSControlCenter');

-- Beispiel-Initialdaten für Skills
INSERT INTO skills (category, description, items, display_order) VALUES
  ('KI & Prompting', 'Ich liebe es, mit KI-Systemen zu experimentieren und Prompts zu bauen.', '["Prompt Engineering", "KI-Tools kreativ nutzen", "Ideen entwickeln & umsetzen"]', 1),
  ('Linux & NixOS', 'Ich bastle gerne an Linux-Systemen, vor allem an NixOS.', '["Linux Basics", "NixOS (Konfiguration, Hardware-Checks)", "Probleme lösen & Systeme retten"]', 2),
  ('Kreativität & Projekte', 'Ich habe Spaß daran, neue Projektideen zu entwickeln und mit KI-Unterstützung umzusetzen.', '["Projektideen & Brainstorming", "KI-generierte Projekte bauen", "2D Multiplayer Framework (mit KI-Hilfe)"]', 3),
  ('Angeln', 'In meiner Freizeit bin ich gerne am Wasser – am liebsten an der Pleiße oder Lauer in Leipzig.', '["Ansitz auf Friedfisch", "Aktivangeln im Sommer", "Pleiße, Lauer & Umgebung (Leipzig)"]', 4);

-- Beispiel-Initialdaten für Themes
INSERT INTO themes (name, description, style_properties, is_default) VALUES
  ('Default Dark', 'A clean and simple dark theme.', '{"backgroundColor": "#1a202c", "textColor": "#e2e8f0", "primaryColor": "#805ad5", "secondaryColor": "#a0aec0", "fontFamily": "Inter, sans-serif"}', TRUE),
  ('Light Mode', 'A standard light theme.', '{"backgroundColor": "#ffffff", "textColor": "#2d3748", "primaryColor": "#5a67d8", "secondaryColor": "#4a5568", "fontFamily": "Inter, sans-serif"}', FALSE);

-- Seeding for owner_profile and owner_page_layouts.
-- This assumes a site_owner with ID 'me' exists (which is enforced by the schema)
-- and a default theme ID (e.g., 1 from above).

-- Example for owner_profile:
-- INSERT INTO owner_profile (owner_id, display_name, bio, selected_theme_id) VALUES
--   ('me', 'Your Name', 'Your bio goes here.', (SELECT id from themes WHERE is_default=TRUE LIMIT 1));

-- Example for owner_page_layouts:
-- INSERT INTO owner_page_layouts (owner_id, section_id, custom_title, custom_content, section_order, is_visible) VALUES
--   ('me', (SELECT id from sections WHERE name='about'), 'Über Mich (Angepasst)', '{"text": "Meine angepasste Über-Mich-Sektion."}', 1, TRUE),
--   ('me', (SELECT id from sections WHERE name='projects'), 'Meine Projekte (Angepasst)', '{}', 2, TRUE);

-- Initialdaten für site_owner (Beispiel, Passwort muss gehasht werden!)
-- WICHTIG: Das Passwort 'yoursecurepassword' MUSS vor dem Einfügen sicher gehasht werden.
-- Dieser Datensatz sollte idealerweise durch ein Skript wie 'create_admin.py' erstellt werden,
-- das das Passwort korrekt hasht.
-- Beispiel (NICHT FÜR PRODUKTION MIT KLARTEXTPASSWORT):
-- INSERT INTO site_owner (id, email, hashed_password, source_username) VALUES
--   ('me', 'admin@example.com', 'your_securely_hashed_password_here', 'your_github_username');

-- Beispiel-Posts für verschiedene Content-Typen
INSERT INTO posts (
    type, project_id, title, slug, subtitle, content_markdown, excerpt,
    cover_image_url, tags, categories, is_published, is_featured,
    difficulty_level, estimated_completion_time, prerequisites,
    learning_objectives, resources, content_status
) VALUES
    -- Projekt-Roadmap
    ('project', 1, '2D Multiplayer Framework Roadmap', '2d-multiplayer-framework-roadmap',
    'Die Zukunft unseres Open-Source Multiplayer-Frameworks',
    '# Roadmap 2024

## Q1: Foundation
- [x] Basis-Netzwerk-Architektur
- [ ] KI-Integration für Spieler-Matching
- [ ] Dynamische Config-Generierung

## Q2: Features
- [ ] In-Game Chat System
- [ ] Spieler-Statistiken
- [ ] Custom Game Modes

## Q3: Performance
- [ ] Optimierung der Netzwerk-Latenz
- [ ] Server-Scaling
- [ ] Load Balancing

## Q4: Community
- [ ] Dokumentation
- [ ] Beispiel-Spiele
- [ ] Community-Tools',
    'Eine detaillierte Roadmap für die Entwicklung des 2D Multiplayer Frameworks',
    'https://example.com/roadmap-cover.jpg',
    ARRAY['roadmap', 'gaming', 'open-source', 'networking'],
    ARRAY['development', 'planning'],
    TRUE, TRUE,
    NULL, NULL, NULL,
    NULL,
    '{"github": "https://github.com/fr4iser90/2d-multiplayer-framework",
      "discord": "https://discord.gg/2d-multiplayer",
      "milestones": [
        {"title": "Alpha Release", "date": "2024-03-01"},
        {"title": "Beta Release", "date": "2024-06-01"},
        {"title": "1.0 Release", "date": "2024-09-01"}
      ]}',
    'published'
    ),

    -- Tutorial
    ('tutorial', 2, 'NixOS Control Center Setup', 'nixos-control-center-tutorial',
    'Wie du das NixOS Control Center in deinem Homelab einrichtest',
    '# NixOS Control Center Tutorial

## Voraussetzungen
- NixOS System
- Docker
- Port 8080 frei

## Installation
1. Clone das Repository
2. Konfiguriere die Umgebungsvariablen
3. Starte mit Docker Compose

## Konfiguration
- Hardware-Checks einrichten
- Backup-Strategie planen
- Monitoring aktivieren',
    'Ein Schritt-für-Schritt Guide zur Installation des NixOS Control Centers',
    'https://example.com/nixos-tutorial.jpg',
    ARRAY['nixos', 'homelab', 'tutorial', 'docker'],
    ARRAY['system-administration', 'devops'],
    TRUE, FALSE,
    'intermediate', 45,
    ARRAY['Linux Basics', 'Docker Grundlagen', 'NixOS Grundkenntnisse'],
    ARRAY['NixOS Control Center installieren', 'Docker Compose verstehen', 'Backup-Strategien planen'],
    '{"github": "https://github.com/fr4iser90/NixOSControlCenter",
      "docker": "https://hub.docker.com/r/fr4iser/nixos-control-center",
      "docs": "https://docs.nixos-control-center.example.com"}',
    'published'
    ),

    -- Case Study
    ('case-study', 1, 'KI-Integration in Multiplayer-Spiele', 'ai-multiplayer-case-study',
    'Wie wir KI nutzen, um besseres Spieler-Matching zu ermöglichen',
    '# Case Study: KI im Multiplayer

## Herausforderung
- Unausgewogene Teams
- Lange Wartezeiten
- Schlechte Spielerfahrung

## Lösung
- KI-basiertes Matchmaking
- Skill-basierte Team-Bildung
- Dynamische Anpassung

## Ergebnisse
- 40% kürzere Wartezeiten
- 60% bessere Team-Balance
- 85% zufriedenere Spieler',
    'Eine detaillierte Analyse unserer KI-Integration im Multiplayer Framework',
    'https://example.com/ai-case-study.jpg',
    ARRAY['ai', 'gaming', 'case-study', 'machine-learning'],
    ARRAY['research', 'implementation'],
    TRUE, TRUE,
    NULL, NULL, NULL,
    NULL,
    '{"metrics": {
        "wait_time_reduction": "40%",
        "team_balance_improvement": "60%",
        "player_satisfaction": "85%"
      },
      "charts": [
        "https://example.com/charts/wait-time.png",
        "https://example.com/charts/team-balance.png"
      ]}',
    'published'
    );
