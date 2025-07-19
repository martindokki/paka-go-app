import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store-simple';

export const useAppInitialization = () => {
  const [isAppReady, setIsAppReady] = useState(false);
  const { isInitialized: authInitialized } = useAuthStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('App initialization started');
        
        // Wait for auth store to be ready
        if (authInitialized) {
          console.log('Auth store initialized');
          
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
      } catch (error) {
        console.error('App initialization error:', error);
        // Still mark as ready to prevent infinite loading
        setIsAppReady(true);
      }
    };

    initializeApp();
  }, [authInitialized]);

  return { isAppReady };
};