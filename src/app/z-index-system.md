# Z-Index System Documentation

## Overview
This document outlines the comprehensive z-index system implemented in the portfolio project. The system uses CSS custom properties (variables) to maintain consistent layering across all components.

## Z-Index Ranges

### 0-9: Grundlegende Inhalte (Text, Bilder)
- `--z-base: 0` - Base layer for basic content
- `--z-content: 1` - Basic content elements
- `--z-elevated: 2` - Elevated content

### 10-99: Interaktive Elemente (Buttons, Links)
- `--z-interactive: 10` - Interactive elements base
- `--z-button: 10` - Buttons
- `--z-link: 11` - Links
- `--z-form-element: 12` - Form elements
- `--z-card-hover: 15` - Card hover states

### 100-199: Header, Navigation, Sidebars
- `--z-header: 100` - Main header
- `--z-navigation: 101` - Navigation elements
- `--z-sidebar: 102` - Sidebars
- `--z-subnav: 103` - Sub-navigation

### 200-299: Dropdown-Menüs, Tooltips
- `--z-dropdown: 200` - Dropdown menus
- `--z-tooltip: 201` - Tooltips
- `--z-context-menu: 202` - Context menus
- `--z-autocomplete: 203` - Autocomplete

### 300-399: Overlays, Popups
- `--z-overlay: 300` - Overlays
- `--z-popup: 301` - Popups
- `--z-lightbox: 302` - Lightbox
- `--z-backdrop: 303` - Backdrop

### 400-499: Sticky Elemente
- `--z-sticky: 400` - Sticky elements
- `--z-fixed-header: 401` - Fixed header
- `--z-floating: 402` - Floating elements
- `--z-scroll-indicator: 403` - Scroll indicators

### 500-999: Spezielle UI-Elemente
- `--z-special-ui: 500` - Special UI elements base
- `--z-terminal: 500` - Terminal component
- `--z-floating-hero: 501` - Floating hero
- `--z-timeline: 502` - Timeline
- `--z-progress-bar: 503` - Progress bars
- `--z-notification: 504` - Notifications
- `--z-loading: 505` - Loading states
- `--z-easter-egg: 506` - Easter eggs

### 1000+: Modals, Dialoge, Notifications
- `--z-modal: 1000` - Modals
- `--z-dialog: 1001` - Dialogs
- `--z-toast: 1002` - Toast notifications
- `--z-critical-modal: 1003` - Critical modals
- `--z-debug: 9999` - Debug elements

## Implementation Examples

### Header Components
```css
.glass {
  z-index: var(--z-header);
}

.terminal-header {
  z-index: var(--z-header);
}

.header {
  z-index: var(--z-header);
}
```

### Modal Components
```css
.blog-modal {
  z-index: var(--z-modal);
}

.modal-overlay {
  z-index: var(--z-modal);
}

.terminal-section-content--maximized {
  z-index: var(--z-modal);
}
```

### Interactive Elements
```css
.btn-neon {
  z-index: var(--z-button);
}

.glass-card {
  z-index: var(--z-content);
}

.glass-card--hover {
  z-index: var(--z-card-hover);
}
```

### Special UI Components
```css
.terminal {
  z-index: var(--z-terminal);
}

.floating-hero--minimized,
.floating-hero--expanded {
  z-index: var(--z-floating-hero);
}

.loading-spinner {
  z-index: var(--z-loading);
}

.footer-terminal-btn {
  z-index: var(--z-easter-egg);
}
```

### Sticky Elements
```css
.footer {
  z-index: var(--z-sticky);
}
```

## Benefits

1. **Consistency**: All components use standardized z-index values
2. **Maintainability**: Easy to update z-index values globally
3. **Scalability**: Clear ranges for different types of components
4. **Debugging**: Easy to identify layering issues
5. **Documentation**: Self-documenting system with clear ranges

## Usage Guidelines

1. Always use CSS custom properties instead of hardcoded values
2. Follow the established ranges for different component types
3. When adding new components, choose the appropriate range
4. For overlapping components, use the next available number in the range
5. Document any new z-index values added to the system

## Future Extensions

The system can be easily extended by adding new custom properties within the appropriate ranges. For example:
- `--z-carousel: 507` for carousel components
- `--z-toolbar: 104` for toolbar elements
- `--z-breadcrumb: 105` for breadcrumb navigation
