import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Authentication Store for Tareeqa POS
 * Manages user authentication state and operations
 */

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email?: string;
  role: 'admin' | 'manager' | 'cashier' | 'stock_clerk' | 'accountant';
  permissions: string[];
  isActive: boolean;
  lastLogin?: string;
}

interface AuthState {
  // State
  isAuthenticated: boolean;
  user: User | null;
  sessionToken: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  clearError: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      sessionToken: null,
      isLoading: false,
      error: null,

      // Initialize authentication
      initialize: async () => {
        set({ isLoading: true, error: null });

        try {
          console.log('🔐 Initializing authentication...');

          const state = get();
          if (state.sessionToken && state.user) {
            // Try to refresh existing session
            const isValid = await get().refreshSession();
            if (isValid) {
              console.log('✅ Session restored from storage');
              return;
            }
          }

          // No valid session found
          set({
            isAuthenticated: false,
            user: null,
            sessionToken: null,
            isLoading: false
          });

          console.log('ℹ️ No valid session found');
        } catch (error) {
          console.error('❌ Auth initialization failed:', error);
          set({
            error: 'فشل في تهيئة نظام المصادقة',
            isLoading: false,
            isAuthenticated: false,
            user: null,
            sessionToken: null
          });
        }
      },

      // Login user
      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          console.log('🔑 Attempting login for:', username);

          if (!window.tareeqa?.security?.authenticate) {
            throw new Error('Security API not available');
          }

          const result = await window.tareeqa.security.authenticate({
            username,
            password
          });

          if (result.success) {
            const user: User = {
              id: result.user.id || '1',
              username: result.user.username,
              firstName: result.user.firstName || result.user.username,
              lastName: result.user.lastName || '',
              email: result.user.email,
              role: result.user.role,
              permissions: result.user.permissions || [],
              isActive: true,
              lastLogin: new Date().toISOString()
            };

            set({
              isAuthenticated: true,
              user,
              sessionToken: result.sessionToken,
              isLoading: false,
              error: null
            });

            console.log('✅ Login successful');
            return true;
          } else {
            set({
              error: result.error || 'فشل في تسجيل الدخول',
              isLoading: false
            });
            console.log('❌ Login failed:', result.error);
            return false;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
          set({
            error: `خطأ في تسجيل الدخول: ${errorMessage}`,
            isLoading: false
          });
          console.error('❌ Login error:', error);
          return false;
        }
      },

      // Logout user
      logout: async () => {
        set({ isLoading: true });

        try {
          console.log('🚪 Logging out...');

          // Clear session on server side if possible
          const state = get();
          if (state.sessionToken && window.tareeqa?.security) {
            // Revoke session token
            // This would be implemented in the security service
          }

          // Clear local state
          set({
            isAuthenticated: false,
            user: null,
            sessionToken: null,
            isLoading: false,
            error: null
          });

          console.log('✅ Logout successful');
        } catch (error) {
          console.error('❌ Logout error:', error);
          // Still clear local state even if server logout fails
          set({
            isAuthenticated: false,
            user: null,
            sessionToken: null,
            isLoading: false,
            error: null
          });
        }
      },

      // Refresh session
      refreshSession: async () => {
        const state = get();
        
        if (!state.sessionToken) {
          return false;
        }

        try {
          console.log('🔄 Refreshing session...');

          // This would validate the session token with the security service
          // For now, we'll assume it's valid if it exists
          if (window.tareeqa?.security?.getStatus) {
            const status = await window.tareeqa.security.getStatus();
            if (status.encryptionEnabled) {
              console.log('✅ Session refreshed');
              return true;
            }
          }

          return false;
        } catch (error) {
          console.error('❌ Session refresh failed:', error);
          return false;
        }
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Check if user has specific permission
      hasPermission: (permission: string) => {
        const state = get();
        if (!state.isAuthenticated || !state.user) {
          return false;
        }

        // Admin has all permissions
        if (state.user.role === 'admin' || state.user.permissions.includes('*')) {
          return true;
        }

        return state.user.permissions.includes(permission);
      },

      // Check if user has specific role
      hasRole: (role: string) => {
        const state = get();
        if (!state.isAuthenticated || !state.user) {
          return false;
        }

        return state.user.role === role;
      }
    }),
    {
      name: 'tareeqa-auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        sessionToken: state.sessionToken
      })
    }
  )
);
