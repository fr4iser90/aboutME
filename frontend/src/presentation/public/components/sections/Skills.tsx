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
    <section id="skills" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold mb-12 galaxy-text text-center">Skills & Stuff</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {skills.map((skillGroup) => (
            <div key={skillGroup.category} className="galaxy-card p-6 rounded-lg">
              <h3 className="text-2xl font-semibold mb-4 galaxy-text">{skillGroup.category}</h3>
              <p className="text-slate-400 mb-4">{skillGroup.description}</p>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                {skillGroup.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-center text-slate-400 mt-8">Ich mag es, Probleme zu lösen, Dinge zu verbinden und Neues auszuprobieren – immer mit einer Prise Humor und viel KI-Unterstützung ;)</p>
      </div>
    </section>
  );
} 