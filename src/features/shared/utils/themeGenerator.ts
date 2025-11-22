/**
 * Theme File Generator
 * Generates CSS files for new themes
 */

export interface ThemeConfig {
  id: string
  name: string
  colors: {
    bgPrimary: string
    bgSecondary: string
    bgTertiary: string
    bgQuaternary: string
    textPrimary: string
    textSecondary: string
    textMuted: string
    textSubtle: string
    neonBlue?: string
    neonPurple?: string
    neonCyan?: string
    neonPink?: string
    neonGreen?: string
  }
  backgroundImage?: string
}

/**
 * Generate CSS content for a theme
 */
export function generateThemeCSS(config: ThemeConfig): string {
  const {
    id,
    colors,
    backgroundImage = "url('/assets/galaxy.png')"
  } = config

  const css = `/* ${config.name} Theme - Color System Only
 * This theme is applied when data-theme="${id}" is set
 * Design-specific styles are in src/styles/designs/
 */

:root[data-theme="${id}"],
[data-theme="${id}"] {
  /* Color System */
  --bg-primary: ${colors.bgPrimary};
  --bg-secondary: ${colors.bgSecondary};
  --bg-tertiary: ${colors.bgTertiary};
  --bg-quaternary: ${colors.bgQuaternary};
  --text-primary: ${colors.textPrimary};
  --text-secondary: ${colors.textSecondary};
  --text-muted: ${colors.textMuted};
  --text-subtle: ${colors.textSubtle};
  
  /* Neon Colors */
  ${colors.neonBlue ? `--neon-blue: ${colors.neonBlue};` : '--neon-blue: #00d4ff;'}
  ${colors.neonPurple ? `--neon-purple: ${colors.neonPurple};` : '--neon-purple: #8b5cf6;'}
  ${colors.neonCyan ? `--neon-cyan: ${colors.neonCyan};` : '--neon-cyan: #06b6d4;'}
  ${colors.neonPink ? `--neon-pink: ${colors.neonPink};` : '--neon-pink: #ec4899;'}
  ${colors.neonGreen ? `--neon-green: ${colors.neonGreen};` : '--neon-green: #10b981;'}
  
  /* Dynamic Background Image */
  --dynamic-bg-image: ${backgroundImage};
}

/* Background Styles - Only apply if no design-specific background is set */
:root:not([data-design]) body,
html:not([data-design]) body {
  background-image: var(--dynamic-bg-image);
  background-size: cover;
  background-position: center -50px;
  background-attachment: fixed;
  background-repeat: no-repeat;
  min-height: 100vh;
  background-color: var(--bg-primary);
}

/* Ensure design backgrounds override theme backgrounds */
:root[data-design] body,
html[data-design] body {
  /* Design CSS will set background-image with !important */
  /* This rule ensures theme background is NOT applied when design is active */
}

/* Hide background when readability mode is active */
body.background-hidden {
  background-image: none !important;
}

body.background-hidden .galaxy-bg {
  background-image: none !important;
}

body.background-hidden::before {
  display: none !important;
}

/* Mobile Performance Optimization */
@media (max-width: 768px) {
  body {
    background-attachment: fixed;
    -webkit-transform: translateZ(0);
  }
}

/* Animated background particles */
body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(2px 2px at 20px 30px, rgba(0, 212, 255, 0.3), transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(139, 92, 246, 0.3), transparent),
    radial-gradient(1px 1px at 90px 40px, rgba(236, 72, 153, 0.3), transparent),
    radial-gradient(1px 1px at 130px 80px, rgba(6, 182, 212, 0.3), transparent),
    radial-gradient(2px 2px at 160px 30px, rgba(0, 212, 255, 0.3), transparent);
  background-repeat: repeat;
  background-size: 200px 100px;
  animation: float 20s ease-in-out infinite;
  pointer-events: none;
  z-index: -1;
}

/* Mobile Performance Optimization - Disable particles on mobile */
@media (max-width: 768px) {
  body::before {
    display: none; /* Disable animated particles on mobile for better performance */
  }
}

/* Galaxy Background for main container - Dynamic */
.galaxy-bg {
  background-image: var(--dynamic-bg-image);
  background-size: cover;
  background-position: center -50px;
  background-attachment: fixed;
  background-repeat: no-repeat;
  min-height: 100vh;
}

/* Ensure main container doesn't override background */
.min-h-screen {
  background: transparent;
}
`

  return css
}

/**
 * Validate theme ID format
 */
export function validateThemeId(id: string): { valid: boolean; error?: string } {
  if (!id || id.trim().length === 0) {
    return { valid: false, error: 'Theme ID is required' }
  }
  
  // Only allow lowercase letters, numbers, and hyphens
  if (!/^[a-z0-9-]+$/.test(id)) {
    return { valid: false, error: 'Theme ID can only contain lowercase letters, numbers, and hyphens' }
  }
  
  // Must start with a letter
  if (!/^[a-z]/.test(id)) {
    return { valid: false, error: 'Theme ID must start with a letter' }
  }
  
  // Must not end with a hyphen
  if (id.endsWith('-')) {
    return { valid: false, error: 'Theme ID cannot end with a hyphen' }
  }
  
  return { valid: true }
}

