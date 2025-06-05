export default function NixOS() {
  return (
    <section id="nixos" style={{ padding: 'var(--section-padding, 60px 0)' }}>
      <div style={{ maxWidth: 'var(--container-max-width, 900px)', margin: '0 auto', padding: 'var(--container-padding, 0 24px)' }}>
        <h2 className="section-heading galaxy-text">NixOS</h2>
        <div style={{ marginBottom: 'var(--nixos-section-gap, 2rem)' }}>
          <h3 style={{ fontSize: 'var(--nixos-subheading-font-size, 2rem)', fontWeight: 'var(--nixos-subheading-font-weight, 600)', marginBottom: 'var(--nixos-subheading-margin-bottom, 0.5rem)' }}>Wie ich zu NixOS kam</h3>
          <p className="section-paragraph" style={{ marginBottom: 'var(--nixos-paragraph-margin-bottom, 1rem)' }}>
            Mein Weg in die Linux-Welt begann mit KI-Experimenten und ersten Schritten auf Debian. Nach etwa 1,5 Jahren bin ich auf NixOS gestoßen – und war sofort fasziniert! Die ersten Wochen waren wild: 3 Wochen lang nur Walls, ein paar Mal das System gebrickt, aber dabei extrem viel gelernt. Seitdem bin ich komplett auf NixOS umgestiegen und liebe die Flexibilität und Stabilität.
          </p>
        </div>
        <div style={{ marginBottom: 'var(--nixos-section-gap, 2rem)' }}>
          <h3 style={{ fontSize: 'var(--nixos-subheading-font-size, 2rem)', fontWeight: 'var(--nixos-subheading-font-weight, 600)', marginBottom: 'var(--nixos-subheading-margin-bottom, 0.5rem)' }}>Was ist NixOS?</h3>
          <p className="section-paragraph" style={{ marginBottom: 'var(--nixos-paragraph-margin-bottom, 1rem)' }}>
            NixOS ist eine innovative Linux-Distribution, die auf deklarativer Systemkonfiguration und dem Nix-Paketmanager basiert. Das bedeutet: System, Pakete und Konfigurationen sind versionierbar, reproduzierbar und super einfach zu verwalten – perfekt für Homelabs, DevOps und alle, die gerne experimentieren.
          </p>
        </div>
        <div style={{ marginBottom: 'var(--nixos-section-gap, 2rem)' }}>
          <h3 style={{ fontSize: 'var(--nixos-subheading-font-size, 2rem)', fontWeight: 'var(--nixos-subheading-font-weight, 600)', marginBottom: 'var(--nixos-subheading-margin-bottom, 0.5rem)' }}>Lieblingskonfigurationen & Projekte</h3>
          <ul style={{ color: 'var(--nixos-list-color, #b0b0b0)' }}>
            <li>Hier kommt bald eine Auswahl meiner liebsten NixOS-Configs!</li>
            <li>Projekte: <a href="https://github.com/fr4iser90/NixOSControlCenter" className="section-link" target="_blank">NixOSControlCenter</a></li>
          </ul>
        </div>
      </div>
    </section>
  );
} 