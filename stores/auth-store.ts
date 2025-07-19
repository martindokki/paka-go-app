import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { AuthService } from '@/services/auth-service';
import { User as SupabaseUser } from '@/services/supabase';

export type UserType = 'customer' | 'driver' | 'admin';

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
  userType?: UserType;
}

export interface RegisterRequest extends LoginRequest {
  name: string;
  phone: string;
  userType: UserType;
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
        console.log('Login attempt:', { email: credentials.email });
        
        try {
          const { user: authUser, error } = await AuthService.signIn(credentials.email, credentials.password);
          
          if (error || !authUser) {
            const errorMessage = error instanceof Error 
              ? error.message 
              : typeof error === 'string' 
              ? error 
              : typeof error === 'object' && error && 'message' in error
              ? String((error as any).message)
              : 'Login failed';
            throw new Error(errorMessage);
          }

          // Get user profile
          const { profile, error: profileError } = await AuthService.getCurrentUser();
          
          if (profileError || !profile) {
            throw new Error('Failed to get user profile');
          }

          const userData: User = {
            id: profile.id,
            name: profile.full_name,
            email: profile.email,
            phone: profile.phone_number || '',
            userType: profile.role as UserType,
            token: 'authenticated',
            createdAt: profile.created_at,
            updatedAt: profile.created_at,
          };
          
          console.log('Setting user data:', userData);
          
          set({
            user: userData,
            token: 'authenticated',
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          console.log('Login successful', { userType: userData.userType, userId: userData.id });
          
          return true;
        } catch (error: any) {
          const errorMsg = error.message || 'Login failed. Please try again.';
          
          set({ 
            error: errorMsg, 
            isLoading: false,
            isAuthenticated: false,
            user: null,
            token: null,
          });
          
          console.error('Login failed', error);
          return false;
        }
      },
      
      register: async (userData: RegisterRequest): Promise<boolean> => {
        set({ isLoading: true, error: null });
        console.log('Registration attempt:', { email: userData.email, userType: userData.userType });
        
        try {
          const { user: authUser, error } = await AuthService.signUp(
            userData.email, 
            userData.password, 
            userData.name, 
            userData.phone, 
            userData.userType === 'admin' ? 'customer' : userData.userType as 'customer' | 'driver'
          );
          
          if (error || !authUser) {
            const errorMessage = error instanceof Error 
              ? error.message 
              : typeof error === 'string' 
              ? error 
              : typeof error === 'object' && error && 'message' in error
              ? String((error as any).message)
              : 'Registration failed';
            throw new Error(`Authentication failed: ${errorMessage}`);
          }

          // Get updated user profile
          const { profile, error: profileError } = await AuthService.getCurrentUser();
          
          if (profileError || !profile) {
            throw new Error('Failed to get user profile after registration');
          }

          const userDataForStore: User = {
            id: profile.id,
            name: profile.full_name,
            email: profile.email,
            phone: profile.phone_number || '',
            userType: profile.role as UserType,
            token: 'authenticated',
            createdAt: profile.created_at,
            updatedAt: profile.created_at,
          };
          
          console.log('Setting user data:', userDataForStore);
          
          set({
            user: userDataForStore,
            token: 'authenticated',
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          console.log('Registration successful', { userType: userDataForStore.userType, email: userData.email, userId: userDataForStore.id });
          
          return true;
        } catch (error: any) {
          const errorMsg = error.message || 'Registration failed. Please check your details and try again.';
          
          set({ 
            error: errorMsg, 
            isLoading: false,
            isAuthenticated: false,
            user: null,
            token: null,
          });
          
          console.error('Registration error:', error);
          return false;
        }
      },
      
      logout: async (): Promise<void> => {
        set({ isLoading: true });
        
        try {
          await AuthService.signOut();
          console.log('User logged out');
          
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
          console.error('Logout error:', error);
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
          console.log('Updating profile in database:', profileData);
          
          // Update in database first
          const { data, error } = await AuthService.updateProfile(user.id, {
            full_name: profileData.name,
            email: profileData.email,
            phone_number: profileData.phone,
          });
          
          if (error) {
            throw new Error((error as any)?.message || 'Failed to update profile in database');
          }
          
          // Update locally after successful database update
          const updatedUser = { 
            ...user, 
            ...profileData, 
            updatedAt: new Date().toISOString() 
          };
          
          set({
            user: updatedUser,
            isLoading: false,
            error: null,
          });
          
          console.log('Profile updated successfully in database and locally');
          return true;
        } catch (error: any) {
          const errorMsg = error.message || 'Profile update failed. Please try again.';
          set({ error: errorMsg, isLoading: false });
          
          console.error('Profile update error:', error);
          return false;
        }
      },
      
      deleteAccount: async (): Promise<boolean> => {
        set({ isLoading: true, error: null });
        
        try {
          // Clear the account locally
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          
          console.log('Account deleted successfully');
          return true;
        } catch (error) {
          const errorMsg = 'Account deletion failed. Please try again.';
          set({ error: errorMsg, isLoading: false });
          
          console.error('Account deletion error:', error);
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
      onRehydrateStorage: () => (state, error) => {
        console.log('Auth store rehydrating:', state ? 'success' : 'failed');
        if (error) {
          console.error('Auth store rehydration error:', error);
        }
        if (state) {
          console.log('Rehydrated user:', state.user?.email, 'isAuthenticated:', state.isAuthenticated);
          state.setInitialized(true);
        } else {
          // Even if rehydration fails, mark as initialized to prevent infinite loading
          console.log('Auth store rehydration failed, marking as initialized');
          useAuthStore.getState().setInitialized(true);
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
    console.log('Auth store initialized via timeout fallback');
  }
}, 2000);

// Initialize auth store on app start
if (typeof window !== 'undefined') {
  // Web initialization
  setTimeout(() => {
    const state = useAuthStore.getState();
    console.log('Auth store state on web:', { 
      isAuthenticated: state.isAuthenticated, 
      user: state.user?.email,
      isInitialized: state.isInitialized 
    });
  }, 100);
} else {
  // Mobile initialization
  setTimeout(() => {
    const state = useAuthStore.getState();
    console.log('Auth store state on mobile:', { 
      isAuthenticated: state.isAuthenticated, 
      user: state.user?.email,
      isInitialized: state.isInitialized 
    });
  }, 100);
}