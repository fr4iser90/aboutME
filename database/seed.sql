-- Beispiel-Initialdaten für Sections
INSERT INTO sections (name, title, type, content, "order") VALUES
  ('about', 'Über mich', 'text', '{"text": "Ich bin Gesundheits- und Krankenpfleger, KI- und Linux-Fan, Bastler und Angler aus Leipzig."}', 1),
  ('nixos', 'NixOS', 'text', '{"text": "Mein Weg zu NixOS begann mit Debian, dann 3 Wochen Walls, viel gebrickt, viel gelernt. Jetzt liebe ich die Flexibilität!"}', 2),
  ('homelab', 'Homelab', 'text', '{"text": "Hier findest du bald Fotos, Hardware-Setups und Automatisierungen aus meinem Homelab."}', 3),
  ('angeln', 'Angeln', 'text', '{"text": "Ich angle am liebsten an der Pleiße und Lauer in Leipzig – Ansitz auf Friedfisch und Aktivangeln im Sommer."}', 4),
  ('contact', 'Kontakt', 'text', '{"text": "Kontaktformular wird hier angezeigt."}', 5);

-- Beispiel-Initialdaten für Projects
-- Note: These projects are global examples. User-specific projects would be linked via user_id.
INSERT INTO projects (name, description, status, details, source_url) VALUES
  ('2D Multiplayer Framework', 'Framework für 2D Multiplayer-Spiele, gebaut mit KI-Unterstützung.', 'WIP', '{"features": ["Netzwerk-Logik", "KI-Integration", "Dynamische Configs"]}', 'https://github.com/fr4iser90/2d-multiplayer-framework'),
  ('NixOSControlCenter', 'Webinterface zur Verwaltung von NixOS-Konfigurationen.', 'Done', '{"features": ["Hardware-Checks", "Generische Configs", "Rebuild per Klick"]}', 'https://github.com/fr4iser90/NixOSControlCenter');

-- Beispiel-Initialdaten für Skills
INSERT INTO skills (category, description, items, "order") VALUES
  ('KI & Prompting', 'Ich liebe es, mit KI-Systemen zu experimentieren und Prompts zu bauen.', '["Prompt Engineering", "KI-Tools kreativ nutzen", "Ideen entwickeln & umsetzen"]', 1),
  ('Linux & NixOS', 'Ich bastle gerne an Linux-Systemen, vor allem an NixOS.', '["Linux Basics", "NixOS (Konfiguration, Hardware-Checks)", "Probleme lösen & Systeme retten"]', 2),
  ('Kreativität & Projekte', 'Ich habe Spaß daran, neue Projektideen zu entwickeln und mit KI-Unterstützung umzusetzen.', '["Projektideen & Brainstorming", "KI-generierte Projekte bauen", "2D Multiplayer Framework (mit KI-Hilfe)"]', 3),
  ('Angeln', 'In meiner Freizeit bin ich gerne am Wasser – am liebsten an der Pleiße oder Lauer in Leipzig.', '["Ansitz auf Friedfisch", "Aktivangeln im Sommer", "Pleiße, Lauer & Umgebung (Leipzig)"]', 4);

-- Beispiel-Initialdaten für Themes
INSERT INTO themes (name, description, style_properties, is_default) VALUES
  ('Default Dark', 'A clean and simple dark theme.', '{"backgroundColor": "#1a202c", "textColor": "#e2e8f0", "primaryColor": "#805ad5", "secondaryColor": "#a0aec0", "fontFamily": "Inter, sans-serif"}', TRUE),
  ('Light Mode', 'A standard light theme.', '{"backgroundColor": "#ffffff", "textColor": "#2d3748", "primaryColor": "#5a67d8", "secondaryColor": "#4a5568", "fontFamily": "Inter, sans-serif"}', FALSE);

-- Note: Seeding for user_profiles, user_page_layouts would typically happen after a user is created.
-- For example, after running create_admin.py, you might manually insert or have a script:
-- Assuming an admin user with ID 'some-uuid-for-admin' exists and default theme ID is 1:
-- INSERT INTO user_profiles (user_id, display_name, bio, selected_theme_id) VALUES
--   ('some-uuid-for-admin', 'Admin User', 'This is the admin user profile.', 1);

-- INSERT INTO user_page_layouts (user_id, section_id, custom_title, custom_content, section_order, is_visible) VALUES
--   ('some-uuid-for-admin', (SELECT id from sections WHERE name='about'), 'Über Mich (Admin)', '{"text": "Admin-specific about me content."}', 1, TRUE),
--   ('some-uuid-for-admin', (SELECT id from sections WHERE name='projects'), 'Meine Projekte (Admin)', '{}', 2, TRUE);
