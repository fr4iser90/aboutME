'use client';

/**
 * Live preview = real homepage in an iframe (admin-only via proxy).
 */
export default function PortfolioPreview() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: '#0a0a0f',
        color: '#fff',
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 1.25rem',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          fontSize: '0.95rem',
        }}
      >
        <span>Live Portfolio Preview</span>
        <a href="/" target="_blank" rel="noreferrer" style={{ color: '#67e8f9' }}>
          Open full site ↗
        </a>
      </header>
      <iframe
        title="Portfolio preview"
        src="/"
        style={{ flex: 1, width: '100%', border: 'none', background: '#000' }}
      />
    </div>
  );
}
