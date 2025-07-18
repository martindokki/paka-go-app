import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useOrdersStore } from '@/stores/orders-store';

export const useAppInitialization = () => {
  const [isAppReady, setIsAppReady] = useState(false);
  const { isInitialized: authInitialized } = useAuthStore();
  const { initializeSampleData } = useOrdersStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('App initialization started');
        
        // Wait for auth store to be ready
        if (authInitialized) {
          console.log('Auth store initialized');
          
          // Initialize sample data
          initializeSampleData();
          console.log('Sample data initialized');
          
          // Small delay to ensure everything is ready
          setTimeout(() => {
            setIsAppReady(true);
            console.log('App initialization completed');
          }, 500);
        }
      } catch (error) {
        console.error('App initialization error:', error);
        // Still mark as ready to prevent infinite loading
        setIsAppReady(true);
      }
    };

    initializeApp();
  }, [authInitialized, initializeSampleData]);

  return { isAppReady };
};