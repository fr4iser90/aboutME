export default function Skills() {
  const skills = [
    {
      category: 'KI & Prompting',
      description: 'Ich liebe es, mit KI-Systemen zu experimentieren, Prompts zu bauen und kreative Lösungen zu finden. Frameworks zu bauen.',
      items: [
        'Prompt Engineering',
        'KI-Tools kreativ nutzen',
        'Ideen entwickeln & umsetzen',
      ],
    },
    {
      category: 'Linux & NixOS',
      description: 'Ich bastle gerne an Linux-Systemen, vor allem an NixOS. Systeme bricken und wieder fixen gehört dazu!',
      items: [
        'Linux Basics',
        'NixOS (Konfiguration, Hardware-Checks)',
        'Probleme lösen & Systeme retten',
      ],
    },
    {
      category: 'Kreativität & Projekte',
      description: 'Ich habe Spaß daran, neue Projektideen zu entwickeln und mit KI-Unterstützung umzusetzen.',
      items: [
        'Projektideen & Brainstorming',
        'KI-generierte Projekte bauen',
        '2D Multiplayer Framework (mit KI-Hilfe)',
      ],
    },
    {
      category: 'Angeln',
      description: 'In meiner Freizeit bin ich gerne am Wasser – am liebsten an der Pleiße oder Lauer in Leipzig.',
      items: [
        'Ansitz auf Friedfisch',
        'Aktivangeln im Sommer',
        'Pleiße, Lauer & Umgebung (Leipzig)',
      ],
    },
  ];

  return (
    <section id="skills" className="skills-section">
      <div className="skills-container">
        <h2 className="skills-title">Skills & Stuff</h2>
        <div className="skills-grid">
          {skills.map((skillGroup) => (
            <div key={skillGroup.category} className="skills-card">
              <h3 className="skills-card-title">{skillGroup.category}</h3>
              <p className="skills-card-desc">{skillGroup.description}</p>
              <ul className="skills-list">
                {skillGroup.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="skills-footer">Ich mag es, Probleme zu lösen, Dinge zu verbinden und Neues auszuprobieren – immer mit einer Prise Humor und viel KI-Unterstützung ;)</p>
      </div>
    </section>
  );
} 