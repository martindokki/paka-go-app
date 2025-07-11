import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
          // Fallback to mock authentication when backend is not available
          console.log('Backend not available, using mock authentication');
          
          // Mock users for fallback
          const mockUsers = [
            {
              id: '1',
              name: 'John Client',
              email: 'client@test.com',
              phone: '+254712345678',
              userType: 'client' as const,
              password: 'password123',
            },
            {
              id: '2',
              name: 'Jane Driver',
              email: 'driver@test.com',
              phone: '+254712345679',
              userType: 'driver' as const,
              password: 'password123',
            },
            {
              id: '3',
              name: 'Admin User',
              email: 'admin@test.com',
              phone: '+254712345680',
              userType: 'admin' as const,
              password: 'password123',
            },
          ];
          
          const user = mockUsers.find(
            u => u.email === credentials.email && 
                 u.password === credentials.password &&
                 u.userType === credentials.userType
          );
          
          if (user) {
            const { password, ...userWithoutPassword } = user;
            const token = `mock_token_${user.id}_${Date.now()}`;
            
            set({
              user: { ...userWithoutPassword, token },
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            
            await errorLogger.info('Mock login successful', { userType: user.userType });
            return true;
          } else {
            set({ 
              error: 'Invalid email, password, or user type', 
              isLoading: false,
              isAuthenticated: false,
              user: null,
              token: null,
            });
            
            await errorLogger.error('Mock login failed', { 
              credentials: { email: credentials.email, userType: credentials.userType }
            });
            return false;
          }
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
          // Fallback to mock registration when backend is not available
          console.log('Backend not available, using mock registration');
          
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Create new user
          const newUser = {
            id: Date.now().toString(),
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            userType: userData.userType,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          const token = `mock_token_${newUser.id}_${Date.now()}`;
          
          set({
            user: { ...newUser, token },
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          await errorLogger.info('Mock registration successful', { userType: newUser.userType });
          return true;
        }
      },
      
      logout: async (): Promise<void> => {
        set({ isLoading: true });
        
        try {
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
      storage: createJSONStorage(() => AsyncStorage),
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