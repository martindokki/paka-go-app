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
  const { isAuthenticated, user, token, setLoading } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Check if we have a stored token and user
        if (token && user) {
          // Verify token is still valid
          const healthCheck = await apiService.healthCheck();
          
          if (!healthCheck.success) {
            await errorLogger.warn('Health check failed, but continuing with stored auth');
          }
          
          await errorLogger.info('Auth initialized from storage', { 
            userType: user.userType,
            userId: user.id 
          });
        } else if (isAuthenticated) {
          // Clear invalid auth state
          await useAuthStore.getState().logout();
          await errorLogger.warn('Cleared invalid auth state');
        }
      } catch (error) {
        await errorLogger.error(error as Error, { action: 'initializeAuth' });
        
        // Clear auth on error
        await useAuthStore.getState().logout();
      } finally {
        setLoading(false);
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (!isInitializing) {
      if (!isAuthenticated || !user) {
        // Redirect to auth screen
        router.replace('/auth');
        return;
      }

      // Check user type requirements
      if (requiredUserType && user.userType !== requiredUserType) {
        errorLogger.warn('User type mismatch', { 
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
    }
  }, [isAuthenticated, user, requiredUserType, isInitializing]);

  if (isInitializing) {
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