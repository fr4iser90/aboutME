export default function NixOS() {
  return (
    <section id="nixos" className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold mb-8 galaxy-text text-center">NixOS</h2>
        <div className="mb-8">
          <h3 className="text-2xl font-semibold mb-2">Wie ich zu NixOS kam</h3>
          <p className="text-slate-300 mb-4">
            Mein Weg in die Linux-Welt begann mit KI-Experimenten und ersten Schritten auf Debian. Nach etwa 1,5 Jahren bin ich auf NixOS gestoßen – und war sofort fasziniert! Die ersten Wochen waren wild: 3 Wochen lang nur Walls, ein paar Mal das System gebrickt, aber dabei extrem viel gelernt. Seitdem bin ich komplett auf NixOS umgestiegen und liebe die Flexibilität und Stabilität.
          </p>
        </div>
        <div className="mb-8">
          <h3 className="text-2xl font-semibold mb-2">Was ist NixOS?</h3>
          <p className="text-slate-300 mb-4">
            NixOS ist eine innovative Linux-Distribution, die auf deklarativer Systemkonfiguration und dem Nix-Paketmanager basiert. Das bedeutet: System, Pakete und Konfigurationen sind versionierbar, reproduzierbar und super einfach zu verwalten – perfekt für Homelabs, DevOps und alle, die gerne experimentieren.
          </p>
        </div>
        <div className="mb-8">
          <h3 className="text-2xl font-semibold mb-2">Lieblingskonfigurationen & Projekte</h3>
          <ul className="list-disc list-inside text-slate-300">
            <li>Hier kommt bald eine Auswahl meiner liebsten NixOS-Configs!</li>
            <li>Projekte: <a href="https://github.com/fr4iser90/NixOSControlCenter" className="text-purple-400 underline" target="_blank">NixOSControlCenter</a></li>
          </ul>
        </div>
      </div>
    </section>
  );
} 