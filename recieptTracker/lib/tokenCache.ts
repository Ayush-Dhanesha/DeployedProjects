// Token cache utility to prevent excessive API calls
interface TokenCache {
  token: string;
  expiresAt: number;
  userId: string;
}

const TOKEN_CACHE_KEY = 'schematic_access_token';
const TOKEN_EXPIRY_MINUTES = 10; // Cache for 10 minutes

export class TokenCacheManager {
  static setToken(userId: string, token: string): void {
    const cache: TokenCache = {
      token,
      userId,
      expiresAt: Date.now() + (TOKEN_EXPIRY_MINUTES * 60 * 1000)
    };
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_CACHE_KEY, JSON.stringify(cache));
    }
  }

  static getToken(userId: string): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const cached = localStorage.getItem(TOKEN_CACHE_KEY);
      if (!cached) return null;

      const cache: TokenCache = JSON.parse(cached);
      
      // Check if token is for the current user and not expired
      if (cache.userId === userId && cache.expiresAt > Date.now()) {
        return cache.token;
      }
      
      // Clean up expired or invalid token
      localStorage.removeItem(TOKEN_CACHE_KEY);
      return null;
    } catch (error) {
      console.error('Error reading token cache:', error);
      localStorage.removeItem(TOKEN_CACHE_KEY);
      return null;
    }
  }

  static clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_CACHE_KEY);
    }
  }
}
