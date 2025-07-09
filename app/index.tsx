import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import Colors from '@/constants/colors';
import { useAuthStore } from '@/stores/auth-store';

export default function Index() {
  const { isAuthenticated, user, isInitialized } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isInitialized || !isMounted) return;
    
    // Use setTimeout to ensure navigation happens after component is fully mounted
    const timeoutId = setTimeout(() => {
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
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, user, isInitialized, isMounted]);

  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: Colors.light.background 
    }}>
      <ActivityIndicator size="large" color={Colors.light.primary} />
    </View>
  );
}