import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { AuthService } from '@/services/auth-service';

export const useAppInitialization = () => {
  const [isAppReady, setIsAppReady] = useState(false);
  const { isInitialized: authInitialized, checkAuthStatus, logout } = useAuthStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('App initialization started');
        
        // Set up auth state listener - be very conservative to prevent logout
        const { data: { subscription } } = AuthService.onAuthStateChange(async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.id);
          
          // Only handle explicit sign out events - ignore all other events to prevent logout
          if (event === 'SIGNED_OUT' && !session) {
            console.log('User explicitly signed out, clearing auth state');
            await logout(false); // Don't show loading for automatic logout
          } else {
            console.log('Ignoring auth state change event to prevent logout:', event);
            // Extend session on any auth event to prevent logout
            const authStore = useAuthStore.getState();
            if (authStore.isAuthenticated) {
              const newExpiry = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days
              authStore.sessionExpiry = newExpiry;
              console.log('Extended session expiry to prevent logout');
            }
          }
        });

        // Wait for auth store to be ready
        if (authInitialized) {
          console.log('Auth store initialized');
          
          // Skip auth status check on app start to prevent logout
          console.log('Skipping auth status check on app start to prevent logout');
          
          // Small delay to ensure everything is ready
          setTimeout(() => {
            setIsAppReady(true);
            console.log('App initialization completed');
          }, 500);
        } else {
          // If auth is not initialized after a timeout, force initialization
          setTimeout(() => {
            if (!authInitialized) {
              console.log('Auth store initialization timeout, forcing app ready state');
              setIsAppReady(true);
            }
          }, 3000);
        }

        // Cleanup subscription on unmount
        return () => {
          subscription?.unsubscribe();
        };
      } catch (error) {
        console.error('App initialization error:', error);
        // Still mark as ready to prevent infinite loading
        setIsAppReady(true);
      }
    };

    initializeApp();
  }, [authInitialized, checkAuthStatus, logout]);

  return { isAppReady };
};