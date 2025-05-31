export const config = {
  // API URLs
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8090',
  aiBaseUrl: process.env.NEXT_PUBLIC_AI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta',
  
  // Authentication
  nextAuthUrl: process.env.NEXTAUTH_URL || 'http://localhost:4000',
  nextAuthSecret: process.env.NEXTAUTH_SECRET,
  
  // AI Configuration
  aiApiKey: process.env.NEXT_PUBLIC_AI_API_KEY,
  aiModel: process.env.NEXT_PUBLIC_AI_MODEL || 'gemini-2.0-flash',
  
  // API Endpoints
  endpoints: {
    auth: {
      login: '/api/auth/login',
      logout: '/api/auth/logout',
      validate: '/api/auth/validate',
    },
    projects: {
      base: '/api/admin/projects',
      import: (source: string) => `/api/admin/projects/import/${source}`,
    },
    llm: {
      generateContent: (model: string) => `/models/${model}:generateContent`,
      embedContent: (model: string) => `/models/${model}:embedContent`,
      generateAnswer: (model: string) => `/models/${model}:generateAnswer`,
    },
  },
} as const; 