import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, trpcClient } from '@/lib/trpc';
import { useOrdersStore } from '@/stores/orders-store';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  const { initializeSampleData } = useOrdersStore();

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      // Initialize sample data when app loads
      initializeSampleData();
    }
  }, [loaded, initializeSampleData]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ErrorBoundary>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="auth/index" options={{ headerShown: false }} />
              <Stack.Screen name="(client)" options={{ headerShown: false }} />
              <Stack.Screen name="(driver)" options={{ headerShown: false }} />
              <Stack.Screen name="(admin)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
              <Stack.Screen 
                name="booking/index" 
                options={{ 
                  presentation: 'modal',
                  title: 'Book Delivery',
                  headerShown: true,
                }} 
              />
              <Stack.Screen 
                name="payment/index" 
                options={{ 
                  presentation: 'modal',
                  title: 'Payment',
                  headerShown: true,
                }} 
              />
              <Stack.Screen 
                name="payment/history" 
                options={{ 
                  presentation: 'modal',
                  title: 'Payment History',
                  headerShown: true,
                }} 
              />
              <Stack.Screen 
                name="tracking/index" 
                options={{ 
                  presentation: 'modal',
                  title: 'Track Order',
                  headerShown: true,
                }} 
              />
              <Stack.Screen 
                name="chat/index" 
                options={{ 
                  presentation: 'modal',
                  title: 'Chat',
                  headerShown: true,
                }} 
              />
              <Stack.Screen 
                name="map/index" 
                options={{ 
                  presentation: 'fullScreenModal',
                  title: 'Map',
                  headerShown: false,
                }} 
              />
            </Stack>
          </ThemeProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </ErrorBoundary>
  );
}