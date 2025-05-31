declare const process: {
  env: {
    BACKEND_URL?: string;
  };
};

const API_URL = process.env.BACKEND_URL || 'http://localhost:8090';

const defaultOptions = {
  credentials: 'include' as const,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
};

// Server-side cookie handling
export const clearAuthCookie = (): void => {
  if (typeof window === 'undefined') return;
  console.log('[Auth] Clearing auth cookie');
  document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};

const getCookies = (): string => {
  if (typeof window === 'undefined') return '';
  return document.cookie;
};

const hasAuthCookie = (): boolean => {
  if (typeof window === 'undefined') return false;
  const cookies = getCookies();
  console.log('[Auth] Checking for auth cookie:', cookies);
  return cookies.includes('auth_token=');
};

export const validateAuth = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  
  try {
    console.log('[Auth] Starting token validation');
    
    if (!hasAuthCookie()) {
      console.log('[Auth] No auth cookie found');
      return false;
    }
    
    console.log('[Auth] Current cookies:', getCookies());
    
    const data = await apiRequest<{ valid: boolean; user?: { email: string } }>('/api/auth/validate');
    
    console.log('[Auth] Token validation result:', {
      valid: data.valid,
      user: data.user?.email
    });
    return data.valid;
  } catch (error) {
    console.error('[Auth] Token validation error:', error);
    clearAuthCookie();
    return false;
  }
};

export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  if (typeof window === 'undefined') {
    console.warn('API request attempted during SSR, skipping...');
    return {} as T;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
  console.log(`[API] Making request to: ${url}`);
  
  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, finalOptions);
    
    if (response.status === 401) {
      console.log('[API] Unauthorized access detected');
      clearAuthCookie();
      window.location.href = '/login';
      throw new Error('Authentication required');
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] Request failed: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`[API] Request successful: ${url}`);
    return data;
  } catch (error) {
    console.error('[API] Request error:', error);
    throw error;
  }
};