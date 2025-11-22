// Shared Utilities Barrel Export
// Components
export { default as BaseModal } from './components/BaseModal'
export { default as BaseSection } from './components/BaseSection'
export { default as ThemeSwitcher } from './components/ThemeSwitcher'
export { default as ContactSection } from './components/ContactSection'
export { default as DynamicBackground } from './components/DynamicBackground'

// Services/Utilities
export { config } from './services/config'
export { MarkdownParser, renderMarkdownElement } from './services/markdownParser'
export { isMobileDevice, shouldReduceMotion } from './services/mobileDetection'
export { generateSecrets, hasSecrets, initializeSecrets, validateSecret } from './services/secret-generator'

// Types
export type { ParsedMarkdown, MarkdownSection } from './services/markdownParser'
// export type { Config } from './services/config' // Config type doesn't exist
