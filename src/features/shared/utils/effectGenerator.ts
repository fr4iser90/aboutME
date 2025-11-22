/**
 * Effect File Generator
 * Generates CSS files for new effects
 */

export interface EffectConfig {
  id: string
  name: string
  description?: string
  variables: {
    glassBg?: string
    glassBgHover?: string
    glassBorder?: string
    glassBorderHover?: string
    glassShadow?: string
    glassShadowHover?: string
    blur?: string
    borderRadius?: string
    backdropFilter?: string
    transition?: string
  }
  lightThemeOverrides?: {
    glassBg?: string
    glassBgHover?: string
    glassBorder?: string
    glassBorderHover?: string
    glassShadow?: string
    glassShadowHover?: string
  }
  mobileOptimizations?: {
    blur?: string
    backdropFilter?: string
    transition?: string
  }
}

/**
 * Generate CSS content for an effect
 */
export function generateEffectCSS(config: EffectConfig): string {
  const {
    id,
    name,
    description,
    variables,
    lightThemeOverrides,
    mobileOptimizations
  } = config

  const css = `/* ${name} Effect System${description ? ` - ${description}` : ''}
 * Visual effects with blur, transparency, and styling
 */

:root[data-effect="${id}"],
[data-effect="${id}"] {
  /* Glass Background Variables - Effect Prefix */
  ${variables.glassBg ? `--effect-glass-bg: ${variables.glassBg};` : '--effect-glass-bg: rgba(255, 255, 255, 0.03);'}
  ${variables.glassBgHover ? `--effect-glass-bg-hover: ${variables.glassBgHover};` : '--effect-glass-bg-hover: rgba(255, 255, 255, 0.06);'}
  ${variables.glassBorder ? `--effect-glass-border: ${variables.glassBorder};` : '--effect-glass-border: rgba(255, 255, 255, 0.08);'}
  ${variables.glassBorderHover ? `--effect-glass-border-hover: ${variables.glassBorderHover};` : '--effect-glass-border-hover: rgba(0, 212, 255, 0.2);'}
  ${variables.glassShadow ? `--effect-glass-shadow: ${variables.glassShadow};` : '--effect-glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);'}
  ${variables.glassShadowHover ? `--effect-glass-shadow-hover: ${variables.glassShadowHover};` : '--effect-glass-shadow-hover: 0 20px 40px rgba(0, 0, 0, 0.6);'}
  
  /* Effect Variables - Effect Prefix */
  ${variables.blur ? `--effect-blur: ${variables.blur};` : '--effect-blur: 24px;'}
  ${variables.borderRadius ? `--effect-border-radius: ${variables.borderRadius};` : '--effect-border-radius: 24px;'}
  ${variables.backdropFilter ? `--effect-backdrop-filter: ${variables.backdropFilter};` : '--effect-backdrop-filter: blur(24px);'}
  ${variables.transition ? `--effect-transition: ${variables.transition};` : '--effect-transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);'}
  
  /* Legacy Support - Map to design variables */
  --glass-bg: var(--effect-glass-bg);
  --glass-bg-hover: var(--effect-glass-bg-hover);
  --glass-border: var(--effect-glass-border);
  --glass-border-hover: var(--effect-glass-border-hover);
  --glass-shadow: var(--effect-glass-shadow);
  --glass-shadow-hover: var(--effect-glass-shadow-hover);
  --design-blur: var(--effect-blur);
  --design-border-radius: var(--effect-border-radius);
  --design-backdrop-filter: var(--effect-backdrop-filter);
  --design-transition: var(--effect-transition);
}
`

  let lightThemeCSS = ''
  if (lightThemeOverrides) {
    lightThemeCSS = `
/* Light Theme ${name} Overrides */
:root[data-theme="light"][data-effect="${id}"],
[data-theme="light"][data-effect="${id}"] {
  ${lightThemeOverrides.glassBg ? `--effect-glass-bg: ${lightThemeOverrides.glassBg};` : ''}
  ${lightThemeOverrides.glassBgHover ? `--effect-glass-bg-hover: ${lightThemeOverrides.glassBgHover};` : ''}
  ${lightThemeOverrides.glassBorder ? `--effect-glass-border: ${lightThemeOverrides.glassBorder};` : ''}
  ${lightThemeOverrides.glassBorderHover ? `--effect-glass-border-hover: ${lightThemeOverrides.glassBorderHover};` : ''}
  ${lightThemeOverrides.glassShadow ? `--effect-glass-shadow: ${lightThemeOverrides.glassShadow};` : ''}
  ${lightThemeOverrides.glassShadowHover ? `--effect-glass-shadow-hover: ${lightThemeOverrides.glassShadowHover};` : ''}
  
  /* Legacy Support */
  --glass-bg: var(--effect-glass-bg);
  --glass-bg-hover: var(--effect-glass-bg-hover);
  --glass-border: var(--effect-glass-border);
  --glass-border-hover: var(--effect-glass-border-hover);
  --glass-shadow: var(--effect-glass-shadow);
  --glass-shadow-hover: var(--effect-glass-shadow-hover);
}
`
  }

  let mobileCSS = ''
  if (mobileOptimizations) {
    mobileCSS = `
/* Mobile Performance Optimization */
@media (max-width: 768px) {
  :root[data-effect="${id}"],
  [data-effect="${id}"] {
    ${mobileOptimizations.blur ? `--effect-blur: ${mobileOptimizations.blur};` : '--effect-blur: 8px;'}
    ${mobileOptimizations.backdropFilter ? `--effect-backdrop-filter: ${mobileOptimizations.backdropFilter};` : '--effect-backdrop-filter: blur(8px);'}
    ${mobileOptimizations.transition ? `--effect-transition: ${mobileOptimizations.transition};` : '--effect-transition: all 0.3s ease;'}
    
    /* Legacy Support */
    --design-blur: var(--effect-blur);
    --design-backdrop-filter: var(--effect-backdrop-filter);
    --design-transition: var(--effect-transition);
  }
}
`
  }

  return css + lightThemeCSS + mobileCSS
}

/**
 * Validate effect ID format
 */
export function validateEffectId(id: string): { valid: boolean; error?: string } {
  if (!id || id.trim().length === 0) {
    return { valid: false, error: 'Effect ID is required' }
  }
  
  // Only allow lowercase letters, numbers, and hyphens
  if (!/^[a-z0-9-]+$/.test(id)) {
    return { valid: false, error: 'Effect ID can only contain lowercase letters, numbers, and hyphens' }
  }
  
  // Must start with a letter
  if (!/^[a-z]/.test(id)) {
    return { valid: false, error: 'Effect ID must start with a letter' }
  }
  
  // Must not end with a hyphen
  if (id.endsWith('-')) {
    return { valid: false, error: 'Effect ID cannot end with a hyphen' }
  }
  
  return { valid: true }
}

