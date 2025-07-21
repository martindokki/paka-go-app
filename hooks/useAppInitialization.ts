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
        
        // Set up auth state listener - but be less aggressive
        const { data: { subscription } } = AuthService.onAuthStateChange(async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.id);
          
          // Only handle explicit sign out events
          if (event === 'SIGNED_OUT') {
            console.log('User explicitly signed out, clearing auth state');
            await logout();
          } else if (event === 'SIGNED_IN') {
            console.log('User signed in, checking auth status');
            // Only check auth status on explicit sign in, not token refresh
            await checkAuthStatus();
          }
          // Ignore TOKEN_REFRESHED events to prevent unnecessary auth checks
        });

        // Wait for auth store to be ready
        if (authInitialized) {
          console.log('Auth store initialized');
          
          // Check auth status on app start
          await checkAuthStatus();
          
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