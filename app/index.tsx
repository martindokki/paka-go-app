import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/auth-store';
import { View, ActivityIndicator } from 'react-native';
import colors from '@/constants/colors';

export default function Index() {
  const { isAuthenticated, user, isInitialized } = useAuthStore();

  // Show loading while auth store initializes
  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  console.log('Index route - Auth state:', { isAuthenticated, userType: user?.userType, email: user?.email });

  if (!isAuthenticated || !user) {
    return <Redirect href="/auth" />;
  }

  // Redirect based on user type
  switch (user.userType) {
    case 'customer':
      return <Redirect href="/(client)" />;
    case 'driver':
      return <Redirect href="/(driver)" />;
    case 'admin':
      return <Redirect href="/(admin)" />;
    default:
      return <Redirect href="/auth" />;
  }
}