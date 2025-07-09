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
  const authStore = useAuthStore();
  const { isAuthenticated, user, isLoading } = authStore;
  const [hasNavigated, setHasNavigated] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for Zustand to hydrate
  useEffect(() => {
    let isMounted = true;
    
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      if (isMounted) {
        setIsHydrated(true);
      }
    });
    
    // Fallback timeout
    const timeout = setTimeout(() => {
      if (isMounted) {
        setIsHydrated(true);
      }
    }, 1000);

    return () => {
      isMounted = false;
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const initializeApp = async () => {
      try {
        // Prevent multiple navigation attempts
        if (hasNavigated || !isMounted) return;
        
        // Wait for hydration to complete
        if (!isHydrated) return;
        
        // Check authentication state
        if (isAuthenticated && user) {
          await errorLogger.info('User session restored', { 
            userType: user.userType,
            userId: user.id 
          });
          
          // Navigate to appropriate dashboard based on user type
          switch (user.userType) {
            case 'client':
              if (isMounted) router.replace('/(client)');
              break;
            case 'driver':
              if (isMounted) router.replace('/(driver)');
              break;
            case 'admin':
              if (Platform.OS === 'web') {
                if (isMounted) router.replace('/(admin)');
              } else {
                await errorLogger.warning('Admin access attempted on mobile');
                if (isMounted) router.replace('/auth');
              }
              break;
            default:
              if (isMounted) router.replace('/auth');
          }
        } else {
          // No valid session, go to auth
          if (isMounted) router.replace('/auth');
        }
        
        if (isMounted) setHasNavigated(true);
      } catch (error) {
        await errorLogger.error(error as Error, { action: 'initializeApp' });
        if (isMounted) {
          router.replace('/auth');
          setHasNavigated(true);
        }
      }
    };

    if (isHydrated && !hasNavigated) {
      initializeApp();
    }
    
    return () => {
      isMounted = false;
    };
  }, [isHydrated, isAuthenticated, hasNavigated]);

  // Show loading screen while initializing
  if (!isHydrated || isLoading || !hasNavigated) {
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