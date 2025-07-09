import { useFonts } from "expo-font";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Platform, View, ActivityIndicator } from "react-native";
import { useAuthStore } from "@/stores/auth-store";
import { errorLogger } from "@/utils/error-logger";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Colors from "@/constants/colors";

export const unstable_settings = {
  initialRouteName: "auth",
};

// Initialize error logging
errorLogger.info('App started', { platform: Platform.OS });

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // Add custom fonts here if needed
  });

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const { isAuthenticated, user, isLoading, isInitialized } = useAuthStore();
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Prevent multiple navigation attempts
        if (hasNavigated) return;
        
        // Wait for store to be initialized
        if (!isInitialized) return;
        
        // Check authentication state
        if (isAuthenticated && user) {
          await errorLogger.info('User session restored', { 
            userType: user.userType,
            userId: user.id 
          });
          
          // Navigate to appropriate dashboard based on user type
          switch (user.userType) {
            case 'client':
              router.replace('/(client)');
              break;
            case 'driver':
              router.replace('/(driver)');
              break;
            case 'admin':
              if (Platform.OS === 'web') {
                router.replace('/(admin)');
              } else {
                await errorLogger.warn('Admin access attempted on mobile');
                router.replace('/auth');
              }
              break;
            default:
              router.replace('/auth');
          }
        } else {
          // No valid session, go to auth
          router.replace('/auth');
        }
        
        setHasNavigated(true);
      } catch (error) {
        await errorLogger.error(error as Error, { action: 'initializeApp' });
        router.replace('/auth');
        setHasNavigated(true);
      }
    };

    initializeApp();
  }, [isInitialized, isAuthenticated, user?.userType, hasNavigated]);

  // Show loading screen while initializing
  if (!isInitialized || isLoading || !hasNavigated) {
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

  return (
    <ErrorBoundary>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen 
          name="auth" 
          options={{ 
            headerShown: false,
            gestureEnabled: false,
          }} 
        />
        <Stack.Screen 
          name="(client)" 
          options={{ 
            headerShown: false,
            gestureEnabled: false,
          }} 
        />
        <Stack.Screen 
          name="(driver)" 
          options={{ 
            headerShown: false,
            gestureEnabled: false,
          }} 
        />
        {/* Admin routes only available on web */}
        {Platform.OS === 'web' && (
          <Stack.Screen 
            name="(admin)" 
            options={{ 
              headerShown: false,
              gestureEnabled: false,
            }} 
          />
        )}
        <Stack.Screen 
          name="booking" 
          options={{ 
            headerShown: true,
            title: "Book Delivery",
            presentation: "modal",
            headerStyle: {
              backgroundColor: Colors.light.background,
            },
            headerTintColor: Colors.light.text,
          }} 
        />
        <Stack.Screen 
          name="tracking" 
          options={{ 
            headerShown: true,
            title: "Track Order",
            presentation: "modal",
            headerStyle: {
              backgroundColor: Colors.light.background,
            },
            headerTintColor: Colors.light.text,
          }} 
        />
        <Stack.Screen 
          name="payment" 
          options={{ 
            headerShown: true,
            title: "Payment",
            presentation: "modal",
            headerStyle: {
              backgroundColor: Colors.light.background,
            },
            headerTintColor: Colors.light.text,
          }} 
        />
        <Stack.Screen 
          name="chat" 
          options={{ 
            headerShown: true,
            title: "Chat",
            presentation: "modal",
            headerStyle: {
              backgroundColor: Colors.light.background,
            },
            headerTintColor: Colors.light.text,
          }} 
        />
      </Stack>
    </ErrorBoundary>
  );
}