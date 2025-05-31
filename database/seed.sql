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
