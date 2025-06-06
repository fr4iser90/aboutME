export default function Angeln() {
  return (
    <section id="angeln" style={{ padding: 'var(--theme-section-padding, 60px 0)' }}>
      <div style={{ maxWidth: 'var(--container-max-width, 900px)', margin: '0 auto', padding: 'var(--container-padding, 0 24px)' }}>
        <h2 className="section-heading">Angeln</h2>
        <p className="section-paragraph">
          Hier findest du bald Fotos, Lieblingsplätze, Fangberichte und Ausrüstung rund ums Angeln.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(var(--angeln-grid-cols, 2), 1fr)', gap: 'var(--angeln-grid-gap, 2rem)' }}>
          <div className="card-glow" style={{ textAlign: 'center', padding: 'var(--theme-card-padding, 1.5rem)', borderRadius: 'var(--theme-card-radius, 1rem)' }}>[Platzhalter für Fotos]</div>
          <div className="card-glow" style={{ textAlign: 'center', padding: 'var(--theme-card-padding, 1.5rem)', borderRadius: 'var(--theme-card-radius, 1rem)' }}>[Platzhalter für Lieblingsplätze]</div>
          <div className="card-glow" style={{ textAlign: 'center', padding: 'var(--theme-card-padding, 1.5rem)', borderRadius: 'var(--theme-card-radius, 1rem)' }}>[Platzhalter für Fangberichte]</div>
          <div className="card-glow" style={{ textAlign: 'center', padding: 'var(--theme-card-padding, 1.5rem)', borderRadius: 'var(--theme-card-radius, 1rem)' }}>[Platzhalter für Ausrüstung]</div>
        </div>
      </div>
    </section>
  );
}
