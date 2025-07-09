import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, LoginRequest, RegisterRequest } from '@/services/api';
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

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  _hasHydrated?: boolean;
  
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
  _setHasHydrated?: (hasHydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initialize the store
      _hasHydrated: false,
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isInitialized: false,
      
      login: async (credentials: LoginRequest): Promise<boolean> => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiService.login(credentials);
          
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
            const errorMsg = response.message || response.error || 'Login failed';
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
        } catch (error) {
          const errorMsg = 'Network error. Please check your connection.';
          set({ 
            error: errorMsg, 
            isLoading: false,
            isAuthenticated: false,
            user: null,
            token: null,
          });
          
          await errorLogger.error(error as Error, { action: 'login' });
          return false;
        }
      },
      
      register: async (userData: RegisterRequest): Promise<boolean> => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiService.register(userData);
          
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
            const errorMsg = response.message || response.error || 'Registration failed';
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
        } catch (error) {
          const errorMsg = 'Network error. Please check your connection.';
          set({ 
            error: errorMsg, 
            isLoading: false,
            isAuthenticated: false,
            user: null,
            token: null,
          });
          
          await errorLogger.error(error as Error, { action: 'register' });
          return false;
        }
      },
      
      logout: async (): Promise<void> => {
        set({ isLoading: true });
        
        try {
          await apiService.logout();
          await errorLogger.info('User logged out');
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
          const response = await apiService.updateProfile(profileData);
          
          if (response.success && response.data) {
            set({
              user: { ...user, ...response.data },
              isLoading: false,
              error: null,
            });
            
            await errorLogger.info('Profile updated successfully');
            return true;
          } else {
            const errorMsg = response.message || response.error || 'Profile update failed';
            set({ error: errorMsg, isLoading: false });
            
            await errorLogger.error('Profile update failed', { error: errorMsg });
            return false;
          }
        } catch (error) {
          const errorMsg = 'Network error. Please try again.';
          set({ error: errorMsg, isLoading: false });
          
          await errorLogger.error(error as Error, { action: 'updateProfile' });
          return false;
        }
      },
      
      deleteAccount: async (): Promise<boolean> => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiService.deleteAccount();
          
          if (response.success) {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
            
            await errorLogger.info('Account deleted successfully');
            return true;
          } else {
            const errorMsg = response.message || response.error || 'Account deletion failed';
            set({ error: errorMsg, isLoading: false });
            
            await errorLogger.error('Account deletion failed', { error: errorMsg });
            return false;
          }
        } catch (error) {
          const errorMsg = 'Network error. Please try again.';
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
      
      // Internal method to handle hydration
      _setHasHydrated: (hasHydrated: boolean) => {
        set({ _hasHydrated: hasHydrated, isInitialized: hasHydrated });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isInitialized: state.isInitialized,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Failed to rehydrate auth state:', error);
        }
        
        if (state) {
          // Validate stored data
          if (state.user && state.token && state.isAuthenticated) {
            state.isInitialized = true;
            errorLogger.info('Auth state rehydrated', { 
              userType: state.user.userType,
              userId: state.user.id 
            }).catch(() => {});
          } else {
            // Clear invalid state
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.isInitialized = true;
            errorLogger.warning('Invalid auth state cleared on rehydration').catch(() => {});
          }
          state._hasHydrated = true;
        }
      },
    }
  )
);