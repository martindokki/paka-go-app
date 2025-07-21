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
  sessionExpiry: number | null;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: (isUserInitiated?: boolean) => Promise<void>;
  clearError: () => void;
  updateProfile: (profileData: Partial<User>) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  refreshSession: () => Promise<boolean>;
  checkAuthStatus: () => Promise<void>;
  
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
      sessionExpiry: null,
      
      login: async (credentials: LoginRequest): Promise<boolean> => {
        set({ isLoading: true, error: null });
        console.log('🔐 Login attempt started:', { email: credentials.email, userType: credentials.userType });
        
        try {
          // Validate credentials
          if (!credentials.email || !credentials.password) {
            throw new Error('Email and password are required');
          }

          console.log('📞 Calling AuthService.signIn...');
          const { user: authUser, error } = await AuthService.signIn(credentials.email.trim(), credentials.password);
          
          console.log('📞 AuthService.signIn response:', { 
            hasUser: !!authUser, 
            userId: authUser?.id, 
            hasError: !!error,
            errorMessage: error?.message || error
          });
          
          if (error) {
            console.error('❌ Auth service error:', error);
            const errorMessage = error instanceof Error 
              ? error.message 
              : typeof error === 'string' 
              ? error 
              : typeof error === 'object' && error && 'message' in error
              ? String((error as any).message)
              : 'Login failed';
            throw new Error(errorMessage);
          }

          if (!authUser) {
            console.error('❌ No user returned from authentication');
            throw new Error('No user returned from authentication');
          }

          console.log('✅ Auth user obtained:', authUser.id);

          // Get user profile with retry logic
          let profile = null;
          let profileError = null;
          
          console.log('👤 Fetching user profile...');
          for (let attempt = 0; attempt < 3; attempt++) {
            console.log(`👤 Profile fetch attempt ${attempt + 1}/3`);
            const result = await AuthService.getCurrentUser();
            console.log(`👤 Profile fetch result:`, { 
              hasProfile: !!result.profile, 
              hasError: !!result.error,
              errorMessage: result.error && typeof result.error === 'object' && 'message' in result.error 
                ? (result.error as any).message 
                : result.error
            });
            
            if (result.profile && !result.error) {
              profile = result.profile;
              console.log('✅ Profile obtained successfully:', profile);
              break;
            }
            profileError = result.error;
            console.warn(`⚠️ Profile fetch attempt ${attempt + 1} failed:`, result.error);
            
            if (attempt < 2) {
              console.log('⏳ Waiting 1 second before retry...');
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
          
          if (!profile) {
            console.error('❌ Failed to get user profile after 3 attempts:', profileError);
            throw new Error('Failed to get user profile. Please try again.');
          }

          console.log('✅ Profile obtained:', profile);

          const userData: User = {
            id: profile.id,
            name: profile.full_name,
            email: profile.email,
            phone: profile.phone_number || '',
            userType: profile.role as UserType,
            token: 'authenticated',
            createdAt: profile.created_at,
            updatedAt: profile.updated_at || profile.created_at,
          };
          
          // Set session expiry to 24 hours from now
          const sessionExpiry = Date.now() + (24 * 60 * 60 * 1000);
          
          console.log('💾 Setting user data in store:', userData);
          
          set({
            user: userData,
            token: 'authenticated',
            isAuthenticated: true,
            isLoading: false,
            error: null,
            sessionExpiry,
          });
          
          console.log('🎉 Login successful!', { userType: userData.userType, userId: userData.id });
          
          return true;
        } catch (error: any) {
          const errorMsg = error?.message || 'Login failed. Please check your credentials and try again.';
          
          console.error('❌ Login failed with error:', error);
          console.error('❌ Error message:', errorMsg);
          
          set({ 
            error: errorMsg, 
            isLoading: false,
            isAuthenticated: false,
            user: null,
            token: null,
            sessionExpiry: null,
          });
          
          return false;
        }
      },
      
      register: async (userData: RegisterRequest): Promise<boolean> => {
        set({ isLoading: true, error: null });
        console.log('🔐 Registration attempt started:', { email: userData.email, userType: userData.userType });
        
        try {
          console.log('📞 Calling AuthService.signUp...');
          const { user: authUser, error } = await AuthService.signUp(
            userData.email, 
            userData.password, 
            userData.name, 
            userData.phone, 
            userData.userType === 'admin' ? 'customer' : userData.userType as 'customer' | 'driver'
          );
          
          console.log('📞 AuthService.signUp response:', { 
            hasUser: !!authUser, 
            userId: authUser?.id, 
            hasError: !!error,
            errorMessage: error?.message || error
          });
          
          if (error || !authUser) {
            const errorMessage = error instanceof Error 
              ? error.message 
              : typeof error === 'string' 
              ? error 
              : typeof error === 'object' && error && 'message' in error
              ? String((error as any).message)
              : 'Registration failed';
            console.error('❌ Registration auth error:', errorMessage);
            throw new Error(`Authentication failed: ${errorMessage}`);
          }

          console.log('✅ Auth user created:', authUser.id);

          // Get updated user profile
          console.log('👤 Fetching user profile after registration...');
          const { profile, error: profileError } = await AuthService.getCurrentUser();
          
          console.log('👤 Profile fetch result:', { 
            hasProfile: !!profile, 
            hasError: !!profileError,
            errorMessage: profileError && typeof profileError === 'object' && 'message' in profileError 
              ? (profileError as any).message 
              : profileError
          });
          
          if (profileError || !profile) {
            console.error('❌ Failed to get user profile after registration:', profileError);
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
          
          console.log('💾 Setting user data in store:', userDataForStore);
          
          // Set session expiry to 24 hours from now
          const sessionExpiry = Date.now() + (24 * 60 * 60 * 1000);
          
          set({
            user: userDataForStore,
            token: 'authenticated',
            isAuthenticated: true,
            isLoading: false,
            error: null,
            sessionExpiry,
          });
          
          console.log('🎉 Registration successful!', { userType: userDataForStore.userType, email: userData.email, userId: userDataForStore.id });
          
          return true;
        } catch (error: any) {
          const errorMsg = error.message || 'Registration failed. Please check your details and try again.';
          
          console.error('❌ Registration failed with error:', error);
          console.error('❌ Error message:', errorMsg);
          
          set({ 
            error: errorMsg, 
            isLoading: false,
            isAuthenticated: false,
            user: null,
            token: null,
          });
          
          return false;
        }
      },
      
      logout: async (isUserInitiated: boolean = false): Promise<void> => {
        // Only set loading state if this is a user-initiated logout
        // For automatic logouts (session expiry, auth errors), don't show loading
        if (isUserInitiated) {
          set({ isLoading: true });
        }
        
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
            sessionExpiry: null,
          });
        }
      },
      
      updateProfile: async (profileData: Partial<User>): Promise<boolean> => {
        const { user } = get();
        if (!user) return false;
        
        set({ isLoading: true, error: null });
        
        try {
          // Update profile in backend
          const { data, error } = await AuthService.updateProfile(user.id, {
            full_name: profileData.name,
            email: profileData.email,
            phone_number: profileData.phone,
          });
          
          if (error) {
            throw error;
          }
          
          // Update local state with the response data or fallback to provided data
          const updatedUser = {
            ...user,
            name: data?.full_name || profileData.name || user.name,
            email: data?.email || profileData.email || user.email,
            phone: data?.phone_number || profileData.phone || user.phone,
            updatedAt: new Date().toISOString(),
          };
          
          set({
            user: updatedUser,
            isLoading: false,
            error: null,
          });
          
          console.log('Profile updated successfully:', updatedUser);
          return true;
        } catch (error: any) {
          const errorMsg = error?.message || 'Profile update failed. Please try again.';
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
            sessionExpiry: null,
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

      refreshSession: async (): Promise<boolean> => {
        try {
          console.log('Refreshing session...');
          const { user, profile, error } = await AuthService.getCurrentUser();
          
          if (error || !user || !profile) {
            console.log('Session refresh failed - but keeping user logged in to prevent unexpected logouts');
            // Don't logout on refresh failure - just extend the current session
            const sessionExpiry = Date.now() + (7 * 24 * 60 * 60 * 1000); // Extend by 7 days
            set({ sessionExpiry });
            return true; // Return true to prevent logout
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

          // Extend session expiry to 7 days
          const sessionExpiry = Date.now() + (7 * 24 * 60 * 60 * 1000);

          // Don't set loading state during session refresh to avoid UI issues
          set({
            user: userData,
            token: 'authenticated',
            isAuthenticated: true,
            sessionExpiry,
            error: null,
            // Preserve current loading state
            isLoading: get().isLoading,
          });

          console.log('Session refreshed successfully');
          return true;
        } catch (error) {
          console.error('Session refresh error:', error);
          // Don't logout on refresh errors - just extend session and continue
          const sessionExpiry = Date.now() + (7 * 24 * 60 * 60 * 1000);
          set({ sessionExpiry });
          console.log('Session refresh failed but extending current session to prevent logout');
          return true;
        }
      },

      checkAuthStatus: async (): Promise<void> => {
        const state = get();
        
        // Only check auth status if user is authenticated
        if (!state.isAuthenticated || !state.user) {
          return;
        }

        // Check if session has expired (extend expiry time to 7 days)
        if (state.sessionExpiry && Date.now() > state.sessionExpiry) {
          console.log('Session expired, attempting refresh');
          const refreshed = await get().refreshSession();
          if (!refreshed) {
            console.log('Session refresh failed, user will need to login again');
            return;
          }
        }

        // If user is authenticated but no session expiry, set one (7 days)
        if (state.isAuthenticated && state.user && !state.sessionExpiry) {
          const sessionExpiry = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days instead of 1 day
          set({ sessionExpiry });
        }

        // Only verify with backend occasionally and be very resilient to errors
        // Skip backend verification to prevent unnecessary logouts
        console.log('Auth status check completed - keeping user logged in');
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
        sessionExpiry: state.sessionExpiry,
      }),
      onRehydrateStorage: () => (state, error) => {
        console.log('Auth store rehydrating:', state ? 'success' : 'failed');
        if (error) {
          console.error('Auth store rehydration error:', error);
        }
        if (state) {
          console.log('Rehydrated user:', state.user?.email, 'isAuthenticated:', state.isAuthenticated);
          
          // Ensure loading state is false after rehydration
          state.setLoading(false);
          
          // Be more lenient with session expiry - extend it instead of logging out
          if (state.sessionExpiry && Date.now() > state.sessionExpiry) {
            console.log('Session expired during rehydration, extending session instead of logging out');
            // Extend session by 7 days instead of logging out
            const newExpiry = Date.now() + (7 * 24 * 60 * 60 * 1000);
            state.sessionExpiry = newExpiry;
          } else if (state.isAuthenticated && state.user && !state.sessionExpiry) {
            // Set session expiry if missing
            const newExpiry = Date.now() + (7 * 24 * 60 * 60 * 1000);
            state.sessionExpiry = newExpiry;
          }
          
          // Don't check auth status on rehydration to prevent unnecessary logouts
          console.log('Skipping auth status check on rehydration to prevent logout');
          
          state.setInitialized(true);
        } else {
          // Even if rehydration fails, mark as initialized to prevent infinite loading
          console.log('Auth store rehydration failed, marking as initialized');
          const storeState = useAuthStore.getState();
          storeState.setLoading(false);
          storeState.setInitialized(true);
        }
      },
    }
  )
);

// Fallback initialization after a timeout
setTimeout(() => {
  const state = useAuthStore.getState();
  if (!state.isInitialized) {
    state.setLoading(false); // Ensure loading is false
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
      isInitialized: state.isInitialized,
      isLoading: state.isLoading
    });
    // Ensure loading is false on initialization
    if (state.isLoading && !state.isAuthenticated) {
      state.setLoading(false);
    }
  }, 100);
} else {
  // Mobile initialization
  setTimeout(() => {
    const state = useAuthStore.getState();
    console.log('Auth store state on mobile:', { 
      isAuthenticated: state.isAuthenticated, 
      user: state.user?.email,
      isInitialized: state.isInitialized,
      isLoading: state.isLoading
    });
    // Ensure loading is false on initialization
    if (state.isLoading && !state.isAuthenticated) {
      state.setLoading(false);
    }
  }, 100);
}