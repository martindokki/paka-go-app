import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/auth-store';
import { apiService } from '@/services/api';
import { errorLogger } from '@/utils/error-logger';
import Colors from '@/constants/colors';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredUserType?: 'client' | 'driver' | 'admin';
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requiredUserType 
}) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (hasChecked) return;
      
      try {
        if (!isAuthenticated || !user) {
          router.replace('/auth');
          return;
        }

        // Check user type requirements
        if (requiredUserType && user.userType !== requiredUserType) {
          await errorLogger.warning('User type mismatch', { 
            required: requiredUserType, 
            actual: user.userType 
          });
          
          // Redirect to appropriate dashboard
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
          return;
        }
        
        setHasChecked(true);
      } catch (error) {
        await errorLogger.error(error as Error, { action: 'checkAuth' });
        router.replace('/auth');
      }
    };

    checkAuth();
  }, [isAuthenticated, user?.id, requiredUserType, hasChecked]);

  if (isLoading || !hasChecked) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  if (requiredUserType && user.userType !== requiredUserType) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
});