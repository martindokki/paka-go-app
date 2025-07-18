import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/auth-store-simple';
import colors from '@/constants/colors';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredUserType?: 'client' | 'driver' | 'admin';
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requiredUserType 
}) => {
  const { isAuthenticated, user, isLoading, isInitialized } = useAuthStore();

  console.log("AuthGuard check:", { 
    isAuthenticated, 
    user: user?.userType, 
    isLoading, 
    isInitialized,
    requiredUserType 
  });

  // Show loading while auth is being initialized or checked
  if (isLoading || !isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Allow access if no specific user type is required and user is authenticated
  if (!requiredUserType && isAuthenticated && user) {
    return <>{children}</>;
  }

  // Check user type requirements
  if (requiredUserType && isAuthenticated && user) {
    if (user.userType === requiredUserType) {
      return <>{children}</>;
    } else {
      // User is authenticated but wrong type - redirect to appropriate dashboard
      setTimeout(() => {
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
      }, 100);
      
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }
  }

  // Not authenticated - redirect to auth
  if (!isAuthenticated || !user) {
    setTimeout(() => {
      router.replace('/auth');
    }, 100);
    
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
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
    backgroundColor: colors.background,
  },
});