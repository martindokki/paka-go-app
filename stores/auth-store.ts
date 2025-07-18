import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { trpcClient } from '@/lib/trpc';
import { errorLogger } from '@/utils/error-logger';

export type UserType = 'client' | 'driver' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  userType: UserType;
  token?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  userType: UserType;
}

export interface RegisterRequest extends LoginRequest {
  name: string;
  phone: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateProfile: (profileData: Partial<User>) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  
  // Internal actions
  setUser: (userData: User) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setInitialized: (initialized: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initialize the store
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isInitialized: false,
      
      login: async (credentials: LoginRequest): Promise<boolean> => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await trpcClient.auth.login.mutate(credentials);
          
          if (response.success && response.data) {
            const { user, token } = response.data;
            
            set({
              user: { ...user, token },
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            
            await errorLogger.info('Login successful', { userType: user.userType });
            return true;
          } else {
            const errorMsg = 'Login failed';
            set({ 
              error: errorMsg, 
              isLoading: false,
              isAuthenticated: false,
              user: null,
              token: null,
            });
            
            await errorLogger.error('Login failed', { 
              error: errorMsg,
              credentials: { email: credentials.email, userType: credentials.userType }
            });
            return false;
          }
        } catch (error: any) {
          let errorMsg = 'Login failed. Please check your credentials.';
          
          // Handle specific error messages from the backend
          if (error.message) {
            if (error.message.includes('Invalid credentials')) {
              errorMsg = 'Invalid email, password, or user type. Please check your information and try again.';
            } else if (error.message.includes('not found')) {
              errorMsg = 'No account found with this email and user type. Please check your information or sign up.';
            } else {
              errorMsg = error.message;
            }
          }
          
          set({ 
            error: errorMsg, 
            isLoading: false,
            isAuthenticated: false,
            user: null,
            token: null,
          });
          
          await errorLogger.error('Login failed', { 
            error: error.message || 'Unknown error',
            credentials: { email: credentials.email, userType: credentials.userType }
          });
          return false;
        }
      },
      
      register: async (userData: RegisterRequest): Promise<boolean> => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await trpcClient.auth.register.mutate(userData);
          
          if (response.success && response.data) {
            const { user, token } = response.data;
            
            set({
              user: { ...user, token },
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            
            await errorLogger.info('Registration successful', { userType: user.userType });
            return true;
          } else {
            const errorMsg = 'Registration failed';
            set({ 
              error: errorMsg, 
              isLoading: false,
              isAuthenticated: false,
              user: null,
              token: null,
            });
            
            await errorLogger.error('Registration failed', { 
              error: errorMsg,
              userData: { email: userData.email, userType: userData.userType }
            });
            return false;
          }
        } catch (error: any) {
          let errorMsg = 'Registration failed. Please try again.';
          
          // Handle specific error messages from the backend
          if (error.message) {
            if (error.message.includes('already exists')) {
              errorMsg = 'An account with this email already exists. Please try signing in instead.';
            } else if (error.message.includes('invalid')) {
              errorMsg = 'Please check your information and try again.';
            } else {
              errorMsg = error.message;
            }
          }
          
          set({ 
            error: errorMsg, 
            isLoading: false,
            isAuthenticated: false,
            user: null,
            token: null,
          });
          
          await errorLogger.error('Registration failed', { 
            error: error.message || 'Unknown error',
            userData: { email: userData.email, userType: userData.userType }
          });
          return false;
        }
      },
      
      logout: async (): Promise<void> => {
        set({ isLoading: true });
        
        try {
          await errorLogger.info('User logged out');
          
          // Clear storage on web and mobile
          if (Platform.OS === 'web') {
            // Clear localStorage on web
            try {
              localStorage.removeItem('auth-storage');
            } catch (e) {
              console.warn('Failed to clear localStorage:', e);
            }
          } else {
            // Clear AsyncStorage on mobile
            try {
              await AsyncStorage.removeItem('auth-storage');
            } catch (e) {
              console.warn('Failed to clear AsyncStorage:', e);
            }
          }
        } catch (error) {
          await errorLogger.error(error as Error, { action: 'logout' });
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },
      
      updateProfile: async (profileData: Partial<User>): Promise<boolean> => {
        const { user } = get();
        if (!user) return false;
        
        set({ isLoading: true, error: null });
        
        try {
          // For now, just update locally since we don't have a backend endpoint
          set({
            user: { ...user, ...profileData },
            isLoading: false,
            error: null,
          });
          
          await errorLogger.info('Profile updated successfully');
          return true;
        } catch (error) {
          const errorMsg = 'Profile update failed. Please try again.';
          set({ error: errorMsg, isLoading: false });
          
          await errorLogger.error(error as Error, { action: 'updateProfile' });
          return false;
        }
      },
      
      deleteAccount: async (): Promise<boolean> => {
        set({ isLoading: true, error: null });
        
        try {
          // For now, just clear the account locally
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          
          await errorLogger.info('Account deleted successfully');
          return true;
        } catch (error) {
          const errorMsg = 'Account deletion failed. Please try again.';
          set({ error: errorMsg, isLoading: false });
          
          await errorLogger.error(error as Error, { action: 'deleteAccount' });
          return false;
        }
      },
      
      // Internal actions
      setUser: (userData: User) => {
        set({
          user: userData,
          isAuthenticated: true,
        });
      },
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      
      setError: (error: string | null) => {
        set({ error });
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      setInitialized: (initialized: boolean) => {
        set({ isInitialized: initialized });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => {
        if (Platform.OS === 'web') {
          // Use localStorage for web
          return {
            getItem: (name: string) => {
              try {
                return localStorage.getItem(name);
              } catch {
                return null;
              }
            },
            setItem: (name: string, value: string) => {
              try {
                localStorage.setItem(name, value);
              } catch {
                // Ignore storage errors on web
              }
            },
            removeItem: (name: string) => {
              try {
                localStorage.removeItem(name);
              } catch {
                // Ignore storage errors on web
              }
            },
          };
        }
        return AsyncStorage;
      }),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setInitialized(true);
        }
      },
    }
  )
);

// Fallback initialization after a timeout
setTimeout(() => {
  const state = useAuthStore.getState();
  if (!state.isInitialized) {
    state.setInitialized(true);
  }
}, 1000);