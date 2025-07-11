import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import colors from '@/constants/colors';
import { useAuthStore } from '@/stores/auth-store';

export default function Index() {
  const { isAuthenticated, user, isInitialized } = useAuthStore();
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    if (!isInitialized || hasNavigated) return;
    
    // Add a small delay to ensure the layout is mounted
    const timer = setTimeout(() => {
      if (isAuthenticated && user) {
        // Navigate based on user type
        switch (user.userType) {
          case 'client':
            router.replace('/(client)');
            break;
          case 'driver':
            router.replace('/(driver)');
            break;
          case 'admin':
            router.replace('/(admin)');
            break;
          default:
            router.replace('/auth');
        }
      } else {
        router.replace('/auth');
      }
      setHasNavigated(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, isInitialized, hasNavigated]);

  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: colors.background 
    }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}