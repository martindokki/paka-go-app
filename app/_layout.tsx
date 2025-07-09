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
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

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
    }, 2000);

    return () => {
      isMounted = false;
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  // Initialize navigation once hydrated
  useEffect(() => {
    if (isHydrated && !hasInitialized) {
      setHasInitialized(true);
      // Let the router handle initial navigation
      router.replace('/auth');
    }
  }, [isHydrated, hasInitialized]);

  // Show loading screen while initializing
  if (!isHydrated || !hasInitialized) {
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