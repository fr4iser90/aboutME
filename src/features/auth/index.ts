// Auth Feature Barrel Export - Client Components Only
// Components (Client-side)
export { default as LogoutButton } from './components/LogoutButton'

// Types (Safe to export)
export type { AuthConfig, AuthMode } from './services/auth-config'

// Note: Server-side utilities are not exported here to avoid 
// "next/headers" import issues in client components.
// Import them directly from './lib/auth' in server components.
