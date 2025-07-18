import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

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
      // Mock login - simulate successful authentication
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      // Create mock user data
      const mockUser: User = {
        id: `user_${Date.now()}`,
        name: credentials.email.split('@')[0], // Use email prefix as name
        email: credentials.email,
        phone: '+254700000000', // Mock phone
        userType: credentials.userType,
        token: `mock_token_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      set({
        user: mockUser,
        token: mockUser.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      console.log('Login successful', { userType: mockUser.userType });
      return true;
    } catch (error: any) {
      const errorMsg = 'Login failed. Please try again.';
      
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
    
    try {
      // Mock registration - simulate successful registration
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
      
      // Create mock user data
      const mockUser: User = {
        id: `user_${Date.now()}`,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        userType: userData.userType,
        token: `mock_token_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      set({
        user: mockUser,
        token: mockUser.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      console.log('Registration successful', { userType: mockUser.userType, email: userData.email });
      return true;
    } catch (error: any) {
      const errorMsg = 'Registration failed. Please check your details and try again.';
      
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
      console.log('User logged out');
      
      // Clear storage on web and mobile
      if (Platform.OS === 'web') {
        try {
          localStorage.removeItem('auth-simple-storage');
        } catch (e) {
          console.warn('Failed to clear localStorage:', e);
        }
      } else {
        try {
          await AsyncStorage.removeItem('auth-simple-storage');
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
      // Update locally
      set({
        user: { ...user, ...profileData, updatedAt: new Date().toISOString() },
        isLoading: false,
        error: null,
      });
      
      console.log('Profile updated successfully');
      return true;
    } catch (error) {
      const errorMsg = 'Profile update failed. Please try again.';
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
  name: 'auth-simple-storage',
  storage: createJSONStorage(() => {
    if (Platform.OS === 'web') {
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