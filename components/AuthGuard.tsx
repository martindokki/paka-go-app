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
  const { isAuthenticated, user, isLoading } = useAuthStore();

  // Show loading while auth is being checked
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Redirect to auth if not authenticated
  if (!isAuthenticated || !user) {
    router.replace('/auth');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Check user type requirements
  if (requiredUserType && user.userType !== requiredUserType) {
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