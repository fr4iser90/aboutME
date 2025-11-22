/**
 * Theme Initialization Script (Server-Side)
 * Generates inline script that runs immediately on page load
 * This prevents white flash by setting theme before React hydrates
 */

export function getThemeInitScript() {
  return `
    (function() {
      // Get saved preferences or use defaults from config
      const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
      const savedDesign = localStorage.getItem('portfolio-design') || 'glassmorphism';
      
      // Apply theme immediately (before React loads)
      const root = document.documentElement;
      root.setAttribute('data-theme', savedTheme);
      root.setAttribute('data-design', savedDesign);
      root.classList.toggle('dark', savedTheme === 'dark');
    })();
  `.trim()
}

