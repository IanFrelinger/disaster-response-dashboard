/**
 * Authentication Service
 * 
 * Handles user authentication, authorization, and session management
 * for the Disaster Response Dashboard.
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'operator' | 'viewer';
  permissions: string[];
  lastLogin?: Date;
  isActive: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  tokenType: 'Bearer';
}

export class AuthService {
  private static readonly TOKEN_KEY = 'disaster_response_auth_token';
  private static readonly REFRESH_TOKEN_KEY = 'disaster_response_refresh_token';
  private static readonly USER_KEY = 'disaster_response_user';
  
  private static authState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  };

  private static listeners: Set<(state: AuthState) => void> = new Set();

  /**
   * Subscribe to auth state changes
   */
  static subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of state changes
   */
  private static notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.authState));
  }

  /**
   * Get current auth state
   */
  static getAuthState(): AuthState {
    return { ...this.authState };
  }

  /**
   * Initialize auth service
   */
  static async initialize(): Promise<void> {
    this.authState.isLoading = true;
    this.notifyListeners();

    try {
      const token = this.getStoredToken();
      if (token && !this.isTokenExpired(token)) {
        const user = await this.getCurrentUser();
        this.authState = {
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        };
      } else {
        this.clearStoredAuth();
        this.authState = {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        };
      }
    } catch (error) {
      this.authState = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }

    this.notifyListeners();
  }

  /**
   * Login with email and password
   */
  static async login(credentials: LoginCredentials): Promise<AuthState> {
    this.authState.isLoading = true;
    this.authState.error = null;
    this.notifyListeners();

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      const { user, accessToken, refreshToken, expiresIn } = data;

      const token: AuthToken = {
        accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
        tokenType: 'Bearer'
      };

      this.storeAuth(token, user);
      
      this.authState = {
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };

      this.notifyListeners();
      return this.authState;
    } catch (error) {
      this.authState = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };

      this.notifyListeners();
      throw error;
    }
  }

  /**
   * Logout current user
   */
  static async logout(): Promise<void> {
    this.authState.isLoading = true;
    this.notifyListeners();

    try {
      const refreshToken = this.getStoredRefreshToken();
      if (refreshToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${refreshToken}`
          },
        });
      }
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      this.clearStoredAuth();
      this.authState = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
      this.notifyListeners();
    }
  }

  /**
   * Refresh authentication token
   */
  static async refreshToken(): Promise<AuthToken | null> {
    const refreshToken = this.getStoredRefreshToken();
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`
        },
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      const { accessToken, expiresIn } = data;

      const token: AuthToken = {
        accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
        tokenType: 'Bearer'
      };

      this.storeToken(token);
      return token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
      return null;
    }
  }

  /**
   * Get current user information
   */
  static async getCurrentUser(): Promise<User> {
    const token = this.getStoredToken();
    if (!token) {
      throw new Error('No authentication token');
    }

    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token.accessToken}`
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user information');
    }

    return response.json();
  }

  /**
   * Check if user has specific permission
   */
  static hasPermission(permission: string): boolean {
    if (!this.authState.user) {
      return false;
    }

    return this.authState.user.permissions.includes(permission) || 
           this.authState.user.role === 'admin';
  }

  /**
   * Check if user has specific role
   */
  static hasRole(role: string): boolean {
    if (!this.authState.user) {
      return false;
    }

    return this.authState.user.role === role || this.authState.user.role === 'admin';
  }

  /**
   * Get authorization header for API requests
   */
  static getAuthHeader(): Record<string, string> {
    const token = this.getStoredToken();
    if (!token || this.isTokenExpired(token)) {
      return {};
    }

    return {
      'Authorization': `${token.tokenType} ${token.accessToken}`
    };
  }

  /**
   * Store authentication data
   */
  private static storeAuth(token: AuthToken, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, JSON.stringify(token));
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Store token only
   */
  private static storeToken(token: AuthToken): void {
    localStorage.setItem(this.TOKEN_KEY, JSON.stringify(token));
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token.refreshToken);
  }

  /**
   * Get stored token
   */
  private static getStoredToken(): AuthToken | null {
    try {
      const tokenData = localStorage.getItem(this.TOKEN_KEY);
      return tokenData ? JSON.parse(tokenData) : null;
    } catch {
      return null;
    }
  }

  /**
   * Get stored refresh token
   */
  private static getStoredRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Clear stored authentication data
   */
  private static clearStoredAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Check if token is expired
   */
  private static isTokenExpired(token: AuthToken): boolean {
    return new Date() >= token.expiresAt;
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get user permissions based on role
   */
  static getRolePermissions(role: string): string[] {
    const rolePermissions: Record<string, string[]> = {
      admin: [
        'read:dashboard',
        'write:dashboard',
        'read:users',
        'write:users',
        'read:settings',
        'write:settings',
        'read:logs',
        'write:logs',
        'manage:system'
      ],
      operator: [
        'read:dashboard',
        'write:dashboard',
        'read:users',
        'read:settings',
        'read:logs'
      ],
      viewer: [
        'read:dashboard',
        'read:users'
      ]
    };

    return rolePermissions[role] || [];
  }
}

